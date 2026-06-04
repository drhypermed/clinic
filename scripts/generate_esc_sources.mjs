import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const sourceDir = path.resolve('guidelines-sources/_structured/full-text/ESC');
const outputFile = path.resolve('components/guidelines/data/esc2025/sources.ts');

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceDir, 'Source directory');
ensureInsideWorkspace(outputFile, 'Output file');

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
  return files.sort((a, b) => a.localeCompare(b));
};

const sources = [];

for (const filepath of walkJsonFiles(sourceDir)) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (data.status !== 'extracted') continue;

  const sourcePath = data.sourcePath;
  const title = path.basename(sourcePath, path.extname(sourcePath)).replace(/\s+/g, ' ').trim();
  const fileId = `esc-${slugify(title).slice(0, 60)}`;

  sources.push({
    id: fileId,
    folderTitle: 'ESC Guidelines',
    folderTopicId: 'esc-folder-guidelines',
    fileTopicId: `esc-file-${fileId}`,
    title,
    fileType: 'Full guideline',
    pageCount: data.pageCount,
    textChars: data.textChars,
    chunkCount: Array.isArray(data.chunks) ? data.chunks.length : 0,
    citation: `ESC. ${title}.`,
    url: 'https://www.escardio.org/Guidelines',
    localFile: sourcePath,
    structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace(/\.pdf$/i, '.json')}`,
    rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath.replace(/\.pdf$/i, '.txt')}`,
    sha256: data.sha256,
  });
}

sources.sort((a, b) => a.title.localeCompare(b.title));

let out = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
out += 'export const ESC_SOURCES: GuidelineSource[] = [\n';
for (const source of sources) {
  out += `  ${JSON.stringify(source, null, 2).replace(/\n/g, '\n  ')},\n`;
}
out += '];\n';

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`Generated ${sources.length} sources in ${path.relative(workspace, outputFile).replace(/\\/g, '/')}`);
