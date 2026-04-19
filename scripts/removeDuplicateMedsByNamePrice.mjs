import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const normalizeNameForKey = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');

const readText = (p) => fs.readFileSync(p, 'utf8');
const writeText = (p, s) => fs.writeFileSync(p, s, 'utf8');

const stripQuotes = (s) => {
  const m = s.match(/^(['"])(.*)\1$/);
  return m ? m[2] : s;
};

// Very small tokenizer to safely skip strings and comments while scanning.
function scanTopLevelObjects(arrayText) {
  const objects = [];

  let i = 0;
  let inS = false;
  let inD = false;
  let inT = false;
  let inLineComment = false;
  let inBlockComment = false;
  let braceDepth = 0;
  let bracketDepth = 0;

  let objStart = -1;

  const len = arrayText.length;
  while (i < len) {
    const ch = arrayText[i];
    const next = i + 1 < len ? arrayText[i + 1] : '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      i++;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inS) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === "'") inS = false;
      i++;
      continue;
    }
    if (inD) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === '"') inD = false;
      i++;
      continue;
    }
    if (inT) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === '`') inT = false;
      i++;
      continue;
    }

    if (ch === '/' && next === '/') { inLineComment = true; i += 2; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i += 2; continue; }

    if (ch === "'") { inS = true; i++; continue; }
    if (ch === '"') { inD = true; i++; continue; }
    if (ch === '`') { inT = true; i++; continue; }

    if (ch === '[') { bracketDepth++; i++; continue; }
    if (ch === ']') { bracketDepth = Math.max(0, bracketDepth - 1); i++; continue; }

    if (ch === '{') {
      if (braceDepth === 0 && bracketDepth === 0) {
        objStart = i;
      }
      braceDepth++;
      i++;
      continue;
    }

    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      if (braceDepth === 0 && bracketDepth === 0 && objStart !== -1) {
        objects.push({ start: objStart, end: i });
        objStart = -1;
      }
      i++;
      continue;
    }

    i++;
  }

  return objects;
}

function findExportedArrayRange(fileText, exportName) {
  const idx = fileText.indexOf(`export const ${exportName}`);
  if (idx === -1) return null;

  const eqIdx = fileText.indexOf('=', idx);
  if (eqIdx === -1) return null;

  const openBracketIdx = fileText.indexOf('[', eqIdx);
  if (openBracketIdx === -1) return null;

  // Find matching ] for this [ (ignoring strings/comments)
  let i = openBracketIdx;
  let inS = false, inD = false, inT = false, inLine = false, inBlock = false;
  let depth = 0;

  while (i < fileText.length) {
    const ch = fileText[i];
    const next = i + 1 < fileText.length ? fileText[i + 1] : '';

    if (inLine) { if (ch === '\n') inLine = false; i++; continue; }
    if (inBlock) { if (ch === '*' && next === '/') { inBlock = false; i += 2; continue; } i++; continue; }

    if (inS) { if (ch === '\\') { i += 2; continue; } if (ch === "'") inS = false; i++; continue; }
    if (inD) { if (ch === '\\') { i += 2; continue; } if (ch === '"') inD = false; i++; continue; }
    if (inT) { if (ch === '\\') { i += 2; continue; } if (ch === '`') inT = false; i++; continue; }

    if (ch === '/' && next === '/') { inLine = true; i += 2; continue; }
    if (ch === '/' && next === '*') { inBlock = true; i += 2; continue; }
    if (ch === "'") { inS = true; i++; continue; }
    if (ch === '"') { inD = true; i++; continue; }
    if (ch === '`') { inT = true; i++; continue; }

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        return { start: openBracketIdx, end: i };
      }
    }
    i++;
  }

  return null;
}

function parseImportsMap(constantsText) {
  // import { A, B } from './drugs/...';
  const map = new Map();
  const re = /^import\s+\{([^}]+)\}\s+from\s+['"](.+?)['"];?/gm;
  let m;
  while ((m = re.exec(constantsText))) {
    const names = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    const importPath = m[2];
    for (const n of names) map.set(n, importPath);
  }
  return map;
}

function parseAllMedsRawSpreadOrder(constantsText) {
  const start = constantsText.indexOf('const ALL_MEDS_RAW');
  if (start === -1) throw new Error('Cannot find ALL_MEDS_RAW in app/drug-catalog/constants.ts');
  const open = constantsText.indexOf('[', start);
  if (open === -1) throw new Error('Cannot find [ for ALL_MEDS_RAW');

  // Find matching ] using same scanning used earlier
  const range = findExportedArrayRange(constantsText, 'MEDICATIONS');
  // Not used; implement matching for ALL_MEDS_RAW specifically:
  let i = open;
  let inS = false, inD = false, inT = false, inLine = false, inBlock = false;
  let depth = 0;
  while (i < constantsText.length) {
    const ch = constantsText[i];
    const next = i + 1 < constantsText.length ? constantsText[i + 1] : '';

    if (inLine) { if (ch === '\n') inLine = false; i++; continue; }
    if (inBlock) { if (ch === '*' && next === '/') { inBlock = false; i += 2; continue; } i++; continue; }

    if (inS) { if (ch === '\\') { i += 2; continue; } if (ch === "'") inS = false; i++; continue; }
    if (inD) { if (ch === '\\') { i += 2; continue; } if (ch === '"') inD = false; i++; continue; }
    if (inT) { if (ch === '\\') { i += 2; continue; } if (ch === '`') inT = false; i++; continue; }

    if (ch === '/' && next === '/') { inLine = true; i += 2; continue; }
    if (ch === '/' && next === '*') { inBlock = true; i += 2; continue; }
    if (ch === "'") { inS = true; i++; continue; }
    if (ch === '"') { inD = true; i++; continue; }
    if (ch === '`') { inT = true; i++; continue; }

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        const inner = constantsText.slice(open + 1, i);
        const spreads = [];
        const spreadRe = /\.\.\.([A-Z0-9_]+)/g;
        let sm;
        while ((sm = spreadRe.exec(inner))) spreads.push(sm[1]);
        return spreads;
      }
    }

    i++;
  }

  throw new Error('Unterminated ALL_MEDS_RAW array');
}

function extractMedMetaFromObjectText(objText) {
  const id = objText.match(/\bid\s*:\s*(['"`])([\s\S]*?)\1/);
  const name = objText.match(/\bname\s*:\s*(['"`])([\s\S]*?)\1/);
  const price = objText.match(/\bprice\s*:\s*(\d+(?:\.\d+)?)/);

  return {
    id: id ? stripQuotes(id[0].split(':').slice(1).join(':').trim()) : null,
    name: name ? name[2] : null,
    price: price ? Number(price[1]) : null,
  };
}

function computeRemovalRanges(arrayText, objects, removeIndices) {
  // removeIndices: indices in `objects` to delete
  const ranges = [];
  const len = arrayText.length;

  const isWs = (c) => c === ' ' || c === '\t' || c === '\r' || c === '\n';

  const skipWsAndCommentsForward = (pos) => {
    let i = pos;
    while (i < len) {
      const ch = arrayText[i];
      const next = i + 1 < len ? arrayText[i + 1] : '';
      if (isWs(ch)) { i++; continue; }
      if (ch === '/' && next === '/') {
        i += 2;
        while (i < len && arrayText[i] !== '\n') i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        i += 2;
        while (i + 1 < len && !(arrayText[i] === '*' && arrayText[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      break;
    }
    return i;
  };

  const skipWsAndCommentsBackward = (pos) => {
    let i = pos;
    while (i >= 0) {
      const ch = arrayText[i];
      const prev = i - 1 >= 0 ? arrayText[i - 1] : '';
      if (isWs(ch)) { i--; continue; }
      // Backward comment skipping is tricky; keep it simple: don't attempt to jump over comments.
      // We'll only skip whitespace backward.
      break;
    }
    return i;
  };

  for (const idx of removeIndices) {
    const obj = objects[idx];
    let start = obj.start;
    let end = obj.end + 1; // exclusive

    // Prefer removing trailing comma
    let after = skipWsAndCommentsForward(end);
    if (arrayText[after] === ',') {
      after++;
      after = skipWsAndCommentsForward(after);
      end = after;
    } else {
      // No trailing comma: try remove preceding comma
      let before = skipWsAndCommentsBackward(start - 1);
      if (arrayText[before] === ',') {
        start = before;
      }
    }

    ranges.push({ start, end });
  }

  // sort desc for safe application
  ranges.sort((a, b) => b.start - a.start);
  return ranges;
}

function applyRanges(text, ranges, offsetBase = 0) {
  let out = text;
  for (const r of ranges) {
    out = out.slice(0, r.start + offsetBase) + out.slice(r.end + offsetBase);
  }
  return out;
}

function main() {
  const apply = process.argv.includes('--apply');
  const constantsPath = path.join(ROOT, 'app/drug-catalog/constants.ts');
  const constantsText = readText(constantsPath);

  const importsMap = parseImportsMap(constantsText);
  const spreadOrder = parseAllMedsRawSpreadOrder(constantsText);

  const seen = new Set();
  const duplicates = [];

  const perFileRemovals = new Map();

  for (const exportName of spreadOrder) {
    const importPath = importsMap.get(exportName);
    if (!importPath) continue;

    const filePath = path.join(ROOT, importPath.replace(/^\.\//, '') + '.ts');
    if (!fs.existsSync(filePath)) continue;

    const fileText = readText(filePath);
    const range = findExportedArrayRange(fileText, exportName);
    if (!range) continue;

    const arrayText = fileText.slice(range.start + 1, range.end); // inner
    const objects = scanTopLevelObjects(arrayText);

    const removeIndices = [];

    for (let idx = 0; idx < objects.length; idx++) {
      const o = objects[idx];
      const objText = arrayText.slice(o.start, o.end + 1);
      const meta = extractMedMetaFromObjectText(objText);

      if (!meta.name || meta.price == null) continue;
      const key = `${normalizeNameForKey(meta.name)}|${meta.price}`;
      if (seen.has(key)) {
        removeIndices.push(idx);
        duplicates.push({ key, name: meta.name, price: meta.price, id: meta.id, file: filePath, exportName });
      } else {
        seen.add(key);
      }
    }

    if (removeIndices.length) {
      perFileRemovals.set(filePath, { exportName, range, arrayText, objects, removeIndices });
    }
  }

  const report = {
    removed: duplicates,
    removedCount: duplicates.length,
    generatedAt: new Date().toISOString(),
  };

  const reportPath = path.join(ROOT, 'scripts', 'removed_duplicates_report.json');
  writeText(reportPath, JSON.stringify(report, null, 2));

  console.log(`Found duplicates by (name+price): ${duplicates.length}`);
  console.log(`Report: ${path.relative(ROOT, reportPath)}`);

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to modify files.');
    return;
  }

  let changedFiles = 0;
  for (const [filePath, info] of perFileRemovals.entries()) {
    const fileText = readText(filePath);
    const range = findExportedArrayRange(fileText, info.exportName);
    if (!range) continue;

    const inner = fileText.slice(range.start + 1, range.end);
    const objects = scanTopLevelObjects(inner);

    // Recompute removal ranges against current inner text
    const removalRanges = computeRemovalRanges(inner, objects, info.removeIndices);
    if (!removalRanges.length) continue;

    const newInner = applyRanges(inner, removalRanges, 0);
    const newFileText = fileText.slice(0, range.start + 1) + newInner + fileText.slice(range.end);

    if (newFileText !== fileText) {
      writeText(filePath, newFileText);
      changedFiles++;
      console.log(`Updated: ${path.relative(ROOT, filePath)} (removed ${info.removeIndices.length})`);
    }
  }

  console.log(`Done. Changed files: ${changedFiles}`);
}

main();
