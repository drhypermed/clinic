module.exports = ({
  getDb,
  buildSourcePathCandidates,
  docToChunk,
  bookPageRead,
}) => {
  const listGuidelineBooks = async (request) => {
    const data = request.data || {};
    const selectedCollectionId = data.selectedCollectionId ? String(data.selectedCollectionId) : '';
    const limit = Math.min(500, Math.max(50, Number(data.limit || 250) || 250));
    const db = getDb();
    let query = db.collection('guideline_books').where('status', '==', 'active');
    if (selectedCollectionId) query = query.where('collectionId', '==', selectedCollectionId);
    const snapshot = await query.limit(limit).get();
    const books = [];
    snapshot.forEach((doc) => {
      const d = doc.data() || {};
      books.push({
        id: doc.id,
        bookId: d.bookId || doc.id,
        collectionId: d.collectionId || '',
        school: d.school || '',
        year: Number(d.year || 0),
        title: d.title || d.sourceTitle || '',
        sourceTitle: d.sourceTitle || '',
        folderTitle: d.folderTitle || '',
        fileTitle: d.fileTitle || '',
        sourcePath: d.sourcePath || '',
        pageCount: Number(d.pageCount || 0),
        chunkCount: Number(d.chunkCount || 0),
        textChars: Number(d.textChars || 0),
        storagePdfPath: d.storagePdfPath || '',
        storagePdfUrl: d.storagePdfUrl || '',
      });
    });
    books.sort((a, b) => {
      if (a.school !== b.school) return a.school.localeCompare(b.school);
      if (b.year !== a.year) return b.year - a.year;
      return a.sourcePath.localeCompare(b.sourcePath);
    });
    return { books };
  };

  const getGuidelineBookText = async (request) => {
    const data = request.data || {};
    const db = getDb();
    const bookId = String(data.bookId || '').trim();
    const limit = Math.min(80, Math.max(12, Number(data.limit || 40) || 40));
    const afterChunkIndex = Math.max(0, Number(data.afterChunkIndex || 0) || 0);
    const samplingMode = String(data.samplingMode || '').trim();
    const sourcePathCandidates = buildSourcePathCandidates(data);

    let chunks = [];
    let book = null;

    if (bookId) {
      const bookSnap = await db.collection('guideline_books').doc(bookId).get();
      if (bookSnap.exists) book = { id: bookSnap.id, ...bookSnap.data() };
      const startIndex = Math.max(1, afterChunkIndex + 1);
      const readLimit = Math.min(bookPageRead, limit + 1);
      const refs = Array.from({ length: readLimit }, (_, idx) => {
        const chunkIndex = startIndex + idx;
        return db.collection('guideline_book_chunks').doc(`${bookId}:${String(chunkIndex).padStart(5, '0')}`);
      });
      const snapshots = await db.getAll(...refs);
      snapshots.forEach((doc) => {
        if (doc.exists) chunks.push(docToChunk(doc));
      });
    } else {
      for (const sourcePath of sourcePathCandidates) {
        const snapshot = await db.collection('guideline_book_chunks')
          .where('sourcePath', '==', sourcePath)
          .limit(bookPageRead)
          .get();
        snapshot.forEach((doc) => chunks.push(docToChunk(doc)));
        if (chunks.length > 0) break;
      }
      if (chunks[0]?.bookId) {
        const bookSnap = await db.collection('guideline_books').doc(chunks[0].bookId).get();
        if (bookSnap.exists) book = { id: bookSnap.id, ...bookSnap.data() };
      }
    }

    chunks = chunks.sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));

    if (samplingMode === 'summary') {
      const selected = new Map();
      const add = (chunk) => {
        if (!chunk) return;
        selected.set(chunk.id || `${chunk.bookId || chunk.sourcePath}:${chunk.chunkIndex}`, chunk);
      };
      chunks.slice(0, 5).forEach(add);

      const highValuePattern = /\b(recommend|recommendation|should|diagnos|criteria|classif|management|treat|therapy|contraindicat|avoid|monitor|follow-up|follow up|screen|refer|risk|dose|dosage|target|threshold|algorithm|emergency|acute|severe|pregnan|child|elderly|renal|hepatic)\b/i;
      chunks
        .filter((chunk) => highValuePattern.test(`${chunk.heading || ''} ${chunk.text || ''}`))
        .slice(0, Math.max(8, limit - 8))
        .forEach(add);

      const remainingSlots = Math.max(0, limit - selected.size);
      const step = remainingSlots > 0 ? Math.max(1, Math.floor(chunks.length / remainingSlots)) : chunks.length || 1;
      for (let i = 0; selected.size < limit && i < chunks.length; i += step) add(chunks[i]);
      chunks.slice(-3).forEach(add);

      chunks = Array.from(selected.values())
        .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0))
        .slice(0, limit);
    } else {
      chunks = chunks.filter((chunk) => (chunk.chunkIndex || 0) > afterChunkIndex);
    }

    const page = chunks.slice(0, limit);
    const last = page[page.length - 1];
    return {
      book: book ? {
        id: book.id || book.bookId || '',
        bookId: book.bookId || book.id || '',
        collectionId: book.collectionId || '',
        school: book.school || '',
        year: Number(book.year || 0),
        title: book.title || book.sourceTitle || '',
        sourceTitle: book.sourceTitle || '',
        folderTitle: book.folderTitle || '',
        fileTitle: book.fileTitle || '',
        sourcePath: book.sourcePath || '',
        pageCount: Number(book.pageCount || 0),
        chunkCount: Number(book.chunkCount || 0),
        textChars: Number(book.textChars || 0),
        storagePdfPath: book.storagePdfPath || '',
        storagePdfUrl: book.storagePdfUrl || '',
      } : null,
      chunks: page,
      nextAfterChunkIndex: samplingMode === 'summary' ? null : (last ? last.chunkIndex : null),
      hasMore: samplingMode === 'summary' ? false : chunks.length > page.length,
    };
  };


  return {
    getGuidelineBookText,
    listGuidelineBooks,
  };
};

