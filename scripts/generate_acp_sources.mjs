import fs from 'node:fs';
import path from 'node:path';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const sourceDir = path.resolve('guidelines-sources/_structured/full-text/ACP');
const rawDir = path.resolve('guidelines-sources/ACP');
const outputFile = path.resolve('components/guidelines/data/acp2026/sources.ts');

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const walkJsonFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
};

/**
 * Extracts the publication year from the date line (e.g. "17 April 2026" → 2026).
 */
const extractYearFromText = (rawTxtPath) => {
  if (!fs.existsSync(rawTxtPath)) return null;
  const lines = fs.readFileSync(rawTxtPath, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const datePattern = /^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
  for (const line of lines.slice(0, 10)) {
    const m = line.match(datePattern);
    if (m) return m[2]; // return the year
  }
  return null;
};

/**
 * Extracts the full guideline title from the raw text file content.
 * The title is typically on line 3 in the format:
 * "Full Title of the GuidelineFREE" or "Full Title of the Guideline"
 * We strip the "FREE" suffix and any author info appended.
 */
const extractTitleFromText = (rawTxtPath) => {
  if (!fs.existsSync(rawTxtPath)) return null;
  const lines = fs.readFileSync(rawTxtPath, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const skipPatterns = /^(Clinical Guidelines|Visual Guideline|Related Features|Evidence Review|Full text|PDF\/EPUB|Contents|Abstract|Share|Comments|References|Figures|Tables|Media|Information|Metrics|View More|Open in Viewer|Download|Crossref|PubMed|Google Scholar|Link|Go to Citation|Eligible for CME|Publication:|Authors:|Volume|https?:\/\/)/i;
  const datePattern = /^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i;

  let title = null;
  for (const line of lines.slice(0, 20)) {
    if (skipPatterns.test(line)) continue;
    if (datePattern.test(line)) continue;
    if (line.length < 20) continue;
    title = line;
    break;
  }

  if (!title) return null;

  // Strip the "FREE" suffix at the end
  title = title.replace(/FREE\s*$/, '').trim();

  // Strip anything after "Authors:" or ORCID pattern (0000-...)
  title = title.replace(/\s*Authors?:.*$/i, '').trim();
  title = title.replace(/\s*\d{4}-\d{4}-\d{4}-\d{4}.*$/, '').trim();

  return title;
};

const jsonFiles = walkJsonFiles(sourceDir);
const sources = [];

for (const filepath of jsonFiles) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (data.status !== 'extracted') continue;

  const sourcePath = data.sourcePath;
  const sha256 = data.sha256;
  const pageCount = data.pageCount;
  const textChars = data.textChars;
  const chunks = data.chunks || [];

  // Find the matching raw .txt file to extract real title and year
  const rawTxtPath = path.join(rawDir, sourcePath.replace(/^ACP\//, '').replace(/\.json$/, '.txt'));
  const extractedTitle = extractTitleFromText(rawTxtPath);
  const extractedYear = extractYearFromText(rawTxtPath);

  // Fallback: clean the filename-based title if we can't extract from content
  const filenameFallback = path.basename(sourcePath, path.extname(sourcePath))
    .replace(/^\[.*?\]\s*-\s*/, '');

  const baseTitle = extractedTitle || filenameFallback;

  // Prepend year if available and not already in title
  const year = extractedYear || '';
  const title = year ? `(${year}) ${baseTitle}` : baseTitle;

  const fileId = 'acp-' + slugify(baseTitle).slice(0, 64);

  // Extract topic directory
  const parts = sourcePath.split('/');
  const folderTopic = parts[1] || 'General';

  sources.push({
    id: fileId,
    folderTitle: `ACP Guidelines / ${folderTopic}`,
    folderTopicId: `acp-folder-${slugify(folderTopic)}`,
    fileTopicId: `acp-file-${fileId}`,
    title: title,
    fileType: 'Full guideline',
    pageCount: pageCount,
    textChars: textChars,
    chunkCount: chunks.length,
    citation: `American College of Physicians (ACP). ${title}.`,
    url: 'https://www.acponline.org/clinical-information/clinical-guidelines-recommendations',
    localFile: sourcePath,
    structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace('.txt', '.json')}`,
    rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath}`,
    sha256: sha256,
  });
}

// Sort sources by folderTitle then title
sources.sort((a, b) => a.folderTitle.localeCompare(b.folderTitle) || a.title.localeCompare(b.title));

let out = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
out += 'export const ACP_SOURCES: GuidelineSource[] = [\n';
for (const s of sources) {
  out += '  {\n';
  for (const [k, v] of Object.entries(s)) {
    if (typeof v === 'string') {
      out += `    "${k}": "${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",\n`;
    } else {
      out += `    "${k}": ${v},\n`;
    }
  }
  out += '  },\n';
}
out += '];\n';

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`Generated ${sources.length} sources in ${outputFile}`);

// Print all titles to verify
console.log('\nAll titles extracted:');
sources.forEach((s, i) => console.log(` ${i + 1}. [${s.folderTitle.split(' / ')[1]}] ${s.title}`));
