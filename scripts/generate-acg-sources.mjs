import fs from 'node:fs';
import path from 'node:path';

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sourceDir = path.resolve('guidelines-sources/_structured/full-text/ACG');
const outputFile = path.resolve('components/guidelines/data/acg2026/sources.ts');

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const walkJsonFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkJsonFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) files.push(fullPath);
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const sources = [];
for (const filepath of walkJsonFiles(sourceDir)) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (data.status !== 'extracted') continue;

  const sourcePath = String(data.sourcePath || '').replace(/\\/g, '/');
  const parts = sourcePath.split('/');
  const category = parts.length > 2 ? parts[1] : 'ACG Guidelines';
  const filename = path.posix.basename(sourcePath);
  const title = path.posix.basename(filename, path.posix.extname(filename));
  const fileId = `acg-${slugify(category)}-${slugify(title)}`.slice(0, 100);
  const folderId = `acg-folder-${slugify(category)}`.slice(0, 90);

  sources.push({
    id: fileId,
    folderTitle: category,
    folderTopicId: folderId,
    fileTopicId: `acg-file-${fileId}`.slice(0, 120),
    title,
    fileType: 'Full guideline',
    pageCount: data.pageCount,
    textChars: data.textChars,
    chunkCount: Array.isArray(data.chunks) ? data.chunks.length : 0,
    citation: `American College of Gastroenterology. ${title}.`,
    url: 'https://gi.org/guidelines/',
    localFile: sourcePath,
    structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace(/\.pdf$/i, '.json')}`,
    rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath.replace(/\.pdf$/i, '.txt')}`,
    sha256: data.sha256,
  });
}

sources.sort((a, b) => a.folderTitle.localeCompare(b.folderTitle) || a.title.localeCompare(b.title));

let out = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
out += 'export const ACG_SOURCES: GuidelineSource[] = ';
out += JSON.stringify(sources, null, 2);
out += ';\n';

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`Generated ${sources.length} sources in ${outputFile}`);
