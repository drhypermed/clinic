const zlib = require('zlib');

module.exports = ({ admin, normalizeSearchText }) => {
  const root = String(process.env.GUIDELINE_STATIC_SEARCH_ROOT || 'guidelines-search/v1').replace(/^\/+|\/+$/g, '');
  const manifestPath = `${root}/manifest.json`;
  const maxBookCache = Math.max(12, Math.min(200, Number(process.env.GUIDELINE_STATIC_BOOK_CACHE_MAX || 60)));
  let manifestPromise = null;
  const shardPromises = new Map();
  const bookCache = new Map();
  const collectionManifestCache = new Map();
  const keywordBloomSeeds = [2166136261, 2166136261 ^ 0x9e3779b9, 2166136261 ^ 0x85ebca6b, 2166136261 ^ 0xc2b2ae35];

  const bloomHash = (value, seed) => {
    let hash = seed >>> 0;
    for (const character of String(value || '')) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    hash ^= hash >>> 16;
    return hash >>> 0;
  };

  const keywordBloomHas = (encoded, term) => {
    if (!encoded || !term) return false;
    const bytes = Buffer.from(encoded, 'base64');
    const bitCount = bytes.length * 8;
    return keywordBloomSeeds.every((seed) => {
      const bit = bloomHash(term, seed) % bitCount;
      return (bytes[bit >> 3] & (1 << (bit & 7))) !== 0;
    });
  };

  const download = async (objectPath) => {
    const [buffer] = await admin.storage().bucket().file(objectPath).download();
    return buffer;
  };

  const maybeGunzip = (buffer) => (
    buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b
      ? zlib.gunzipSync(buffer)
      : buffer
  );

  const getManifest = async () => {
    if (!manifestPromise) {
      manifestPromise = download(manifestPath)
        .then((buffer) => JSON.parse(buffer.toString('utf8')))
        .catch((error) => {
          manifestPromise = null;
          throw error;
        });
    }
    return manifestPromise;
  };

  const loadShard = async (shard) => {
    if (!shardPromises.has(shard.id)) {
      const promise = Promise.all([
        download(`${root}/${shard.metadataPath}`),
        download(`${root}/${shard.vectorsPath}`),
      ]).then(([metadataBuffer, vectorBuffer]) => {
        const metadata = JSON.parse(maybeGunzip(metadataBuffer).toString('utf8'));
        const vectorBytes = vectorBuffer.buffer.slice(
          vectorBuffer.byteOffset,
          vectorBuffer.byteOffset + vectorBuffer.byteLength,
        );
        const vectors = new Float32Array(vectorBytes);
        if (metadata.count !== metadata.chunks.length) {
          throw new Error(`Static guideline shard ${shard.id} metadata count mismatch`);
        }
        if (vectors.length !== metadata.count * metadata.dimensions) {
          throw new Error(`Static guideline shard ${shard.id} vector count mismatch`);
        }
        return { ...metadata, vectors };
      }).catch((error) => {
        shardPromises.delete(shard.id);
        throw error;
      });
      shardPromises.set(shard.id, promise);
    }
    return shardPromises.get(shard.id);
  };

  const normalizeQueryVector = (values, dimensions) => {
    if (!Array.isArray(values) || values.length !== dimensions) return null;
    const normalized = new Float32Array(dimensions);
    let normSquared = 0;
    for (let index = 0; index < dimensions; index += 1) {
      const value = Number(values[index]);
      if (!Number.isFinite(value)) return null;
      normalized[index] = value;
      normSquared += value * value;
    }
    const norm = Math.sqrt(normSquared);
    if (!Number.isFinite(norm) || norm <= 0) return null;
    for (let index = 0; index < dimensions; index += 1) normalized[index] /= norm;
    return normalized;
  };

  const insertTopCandidate = (top, candidate, limit) => {
    if (top.length >= limit && candidate.similarity <= top[top.length - 1].similarity) return;
    let low = 0;
    let high = top.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (top[middle].similarity >= candidate.similarity) low = middle + 1;
      else high = middle;
    }
    top.splice(low, 0, candidate);
    if (top.length > limit) top.pop();
  };

  const resolveShards = (manifest, selectedCollectionId, focusCollections = []) => {
    const collectionIds = selectedCollectionId
      ? [selectedCollectionId]
      : focusCollections.filter(Boolean);
    if (collectionIds.length === 0) return manifest.shards;
    const shardIds = new Set(
      collectionIds
        .map((collectionId) => manifest.collectionToShard?.[collectionId])
        .filter(Boolean),
    );
    if (shardIds.size === 0) return manifest.shards;
    return manifest.shards.filter((shard) => shardIds.has(shard.id));
  };

  const toSearchChunk = (chunk, embedding, similarity, source) => ({
    ...chunk,
    page: chunk.pageStart,
    endPage: chunk.pageEnd,
    text: chunk.textPreview || '',
    embedding,
    embeddingModel: 'gemini-embedding-001',
    vectorDistance: Number.isFinite(similarity) ? 1 - similarity : null,
    retrievalSources: [source],
    kind: 'full-text',
  });

  const searchVectors = async ({
    queryEmbedding,
    selectedCollectionId,
    focusCollections = [],
    sourcePathCandidates = [],
    limit = 40,
  }) => {
    const startedAt = Date.now();
    const manifest = await getManifest();
    const normalizedQuery = normalizeQueryVector(queryEmbedding, manifest.dimensions);
    if (!normalizedQuery) return { candidates: [], loadedShards: 0, durationMs: Date.now() - startedAt };
    const shards = resolveShards(manifest, selectedCollectionId, focusCollections);
    const loaded = await Promise.all(shards.map(loadShard));
    const sourcePaths = new Set(sourcePathCandidates);
    const top = [];

    for (const shard of loaded) {
      for (let row = 0; row < shard.count; row += 1) {
        const chunk = shard.chunks[row];
        if (selectedCollectionId && chunk.collectionId !== selectedCollectionId) continue;
        if (sourcePaths.size > 0 && !sourcePaths.has(chunk.sourcePath)) continue;
        if (chunk.hasEmbedding === false) continue;
        const offset = row * shard.dimensions;
        let similarity = 0;
        for (let dimension = 0; dimension < shard.dimensions; dimension += 1) {
          similarity += normalizedQuery[dimension] * shard.vectors[offset + dimension];
        }
        insertTopCandidate(top, { shard, row, chunk, similarity }, limit);
      }
    }

    return {
      candidates: top.map(({ shard, row, chunk, similarity }) => {
        const offset = row * shard.dimensions;
        const embedding = Array.from(shard.vectors.subarray(offset, offset + shard.dimensions));
        return toSearchChunk(chunk, embedding, similarity, 'static-vector');
      }),
      loadedShards: loaded.length,
      durationMs: Date.now() - startedAt,
    };
  };

  const searchLexical = async ({
    terms = [],
    selectedCollectionId,
    focusCollections = [],
    sourcePathCandidates = [],
    limit = 80,
  }) => {
    const startedAt = Date.now();
    const manifest = await getManifest();
    const shards = resolveShards(manifest, selectedCollectionId, focusCollections);
    const loaded = await Promise.all(shards.map(loadShard));
    const normalizedTerms = Array.from(new Set(terms.map(normalizeSearchText).filter(Boolean))).slice(0, 12);
    const focus = new Set(focusCollections);
    const sourcePaths = new Set(sourcePathCandidates);
    const top = [];

    for (const shard of loaded) {
      for (let row = 0; row < shard.count; row += 1) {
        const chunk = shard.chunks[row];
        if (selectedCollectionId && chunk.collectionId !== selectedCollectionId) continue;
        if (sourcePaths.size > 0 && !sourcePaths.has(chunk.sourcePath)) continue;
        const meta = normalizeSearchText([
          chunk.label, chunk.heading, chunk.sourceTitle, chunk.folderTitle, chunk.fileTitle,
          chunk.keywordText, ...(chunk.concepts || []), ...(chunk.intentTags || []),
        ].filter(Boolean).join(' '));
        const text = normalizeSearchText(chunk.textPreview || '');
        let score = focus.has(chunk.collectionId) ? 16 : 0;
        let matches = 0;
        for (const term of normalizedTerms) {
          const metaHit = meta.includes(term);
          const textHit = text.includes(term);
          const keywordHit = keywordBloomHas(chunk.keywordBloom, term);
          if (metaHit || textHit || keywordHit) matches += 1;
          if (metaHit) score += 12;
          if (textHit) score += 5;
          if (keywordHit) score += 10;
        }
        if (sourcePaths.has(chunk.sourcePath)) score += 100;
        if (matches === 0) continue;
        score += matches * matches * 3;
        insertTopCandidate(top, { chunk, similarity: score }, limit);
      }
    }

    return {
      candidates: top.map(({ chunk }) => toSearchChunk(chunk, null, Number.NaN, 'static-keyword')),
      loadedShards: loaded.length,
      durationMs: Date.now() - startedAt,
    };
  };

  const getCollectionManifest = async (collectionId) => {
    if (!collectionManifestCache.has(collectionId)) {
      const promise = download(`guidelines-static/${collectionId}/manifest.json.gz`)
        .then((buffer) => JSON.parse(maybeGunzip(buffer).toString('utf8')))
        .catch((error) => {
          collectionManifestCache.delete(collectionId);
          throw error;
        });
      collectionManifestCache.set(collectionId, promise);
    }
    return collectionManifestCache.get(collectionId);
  };

  const getBook = async (collectionId, bookId, sourcePath) => {
    const key = `${collectionId}/${sourcePath || bookId}`;
    if (bookCache.has(key)) {
      const cached = bookCache.get(key);
      bookCache.delete(key);
      bookCache.set(key, cached);
      return cached;
    }
    const value = getCollectionManifest(collectionId)
      .then((manifest) => {
        const book = (manifest.books || []).find((item) => (
          (sourcePath && item.sourcePath === sourcePath)
          || item.bookId === bookId
          || item.id === bookId
        ));
        if (!book?.staticGzipPath) {
          throw new Error(`Static book mapping not found for ${collectionId}/${sourcePath || bookId}`);
        }
        return download(`guidelines-static/${book.staticGzipPath}`);
      })
      .then((buffer) => JSON.parse(maybeGunzip(buffer).toString('utf8')))
      .catch((error) => {
        bookCache.delete(key);
        throw error;
      });
    bookCache.set(key, value);
    while (bookCache.size > maxBookCache) {
      bookCache.delete(bookCache.keys().next().value);
    }
    return value;
  };

  const hydrateChunks = async (chunks) => {
    const byBook = new Map();
    chunks.forEach((chunk) => {
      if (!chunk.collectionId || !chunk.bookId) return;
      const key = `${chunk.collectionId}/${chunk.bookId}`;
      if (!byBook.has(key)) byBook.set(key, []);
      byBook.get(key).push(chunk);
    });
    const hydrated = new Map();
    await Promise.all(Array.from(byBook.values()).map(async (bookChunks) => {
      const first = bookChunks[0];
      let book;
      try {
        book = await getBook(first.collectionId, first.bookId, first.sourcePath);
      } catch (error) {
        console.warn('[guidelineStaticSearch] book hydration failed', {
          collectionId: first.collectionId,
          bookId: first.bookId,
          message: error?.message || String(error),
        });
        return;
      }
      const fullByIndex = new Map((book.chunks || []).map((chunk) => [Number(chunk.chunkIndex || 0), chunk]));
      bookChunks.forEach((chunk) => {
        const full = fullByIndex.get(Number(chunk.chunkIndex || 0));
        if (full) {
          hydrated.set(chunk.id, {
            ...chunk,
            ...full,
            id: chunk.id,
            bookId: chunk.bookId,
            collectionId: chunk.collectionId,
            sourcePath: chunk.sourcePath,
            localFile: chunk.localFile,
            embedding: chunk.embedding,
            vectorDistance: chunk.vectorDistance,
            retrievalSources: chunk.retrievalSources,
          });
        }
      });
    }));
    return chunks.map((chunk) => hydrated.get(chunk.id) || chunk);
  };

  const getNeighborChunks = async (ranked, maxRoots, maxReads) => {
    const expanded = new Map(ranked.map((chunk) => [chunk.id, chunk]));
    let added = 0;
    for (const rootChunk of ranked.slice(0, maxRoots)) {
      if (!rootChunk.collectionId || !rootChunk.bookId || !rootChunk.chunkIndex) continue;
      let book;
      try {
        book = await getBook(rootChunk.collectionId, rootChunk.bookId, rootChunk.sourcePath);
      } catch (error) {
        console.warn('[guidelineStaticSearch] neighbor hydration failed', {
          collectionId: rootChunk.collectionId,
          bookId: rootChunk.bookId,
          message: error?.message || String(error),
        });
        continue;
      }
      const byIndex = new Map((book.chunks || []).map((chunk) => [Number(chunk.chunkIndex || 0), chunk]));
      for (const offset of [-2, -1, 1, 2]) {
        if (added >= maxReads) break;
        const neighbor = byIndex.get(rootChunk.chunkIndex + offset);
        const neighborId = `${rootChunk.bookId}:${String(rootChunk.chunkIndex + offset).padStart(5, '0')}`;
        if (!neighbor || expanded.has(neighborId)) continue;
        expanded.set(neighborId, {
          ...neighbor,
          id: neighborId,
          bookId: rootChunk.bookId,
          collectionId: rootChunk.collectionId,
          sourcePath: rootChunk.sourcePath,
          localFile: rootChunk.localFile,
          score: Math.max(1, Number(rootChunk.score || 1) - 12),
          contextOnly: true,
          retrievalSources: ['static-neighbor'],
        });
        added += 1;
      }
    }
    return Array.from(expanded.values());
  };

  return {
    getManifest,
    searchVectors,
    searchLexical,
    hydrateChunks,
    getNeighborChunks,
  };
};
