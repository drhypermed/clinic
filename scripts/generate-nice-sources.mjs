import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const sourceDir = path.resolve('guidelines-sources/_structured/full-text/NICE');
const outputFile = path.resolve('components/guidelines/data/nice/sources.ts');

const slugify = (value, max = 80) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .toLowerCase() || 'guideline';

const hashShort = (value) => crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 10);

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

const inferYear = (sourcePath) => Number(sourcePath.match(/\b(20\d{2})\b/)?.[1] || new Date().getFullYear());

const sourcesByYear = {};

for (const filepath of walkJsonFiles(sourceDir)) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (data.status !== 'extracted') continue;

  const sourcePath = data.sourcePath.replace(/\\/g, '/');
  const parts = sourcePath.split('/');
  const title = path.basename(sourcePath, path.extname(sourcePath)).replace(/\s+/g, ' ').trim();
  const folderTitle = parts.slice(1, -1).join(' / ') || 'NICE Guidelines';
  const year = inferYear(sourcePath);
  const id = `nice-${slugify(title)}-${hashShort(sourcePath)}`;

  const source = {
    id,
    folderTitle,
    folderTopicId: `nice-folder-${slugify(folderTitle)}-${hashShort(folderTitle)}`,
    fileTopicId: `nice-file-${id}`,
    title,
    fileType: 'NICE guidance',
    pageCount: data.pageCount,
    textChars: data.textChars,
    chunkCount: data.chunks?.length || 0,
    citation: `NICE. ${title}.`,
    url: 'https://www.nice.org.uk/guidance',
    localFile: sourcePath,
    structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace(/\.pdf$/i, '.json')}`,
    rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath.replace(/\.pdf$/i, '.txt')}`,
    sha256: data.sha256,
  };

  const key = String(year);
  sourcesByYear[key] ??= [];
  sourcesByYear[key].push(source);
}

for (const sources of Object.values(sourcesByYear)) {
  sources.sort((a, b) => (a.folderTitle + a.title).localeCompare(b.folderTitle + b.title));
}

const years = Object.keys(sourcesByYear).sort((a, b) => Number(b) - Number(a));
let output = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
output += 'export const NICE_SOURCES_BY_YEAR: Record<string, GuidelineSource[]> = {\n';
for (const year of years) {
  output += `  "${year}": ${JSON.stringify(sourcesByYear[year], null, 2).replace(/\n/g, '\n  ')},\n`;
}
output += '};\n';

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, 'utf8');

const total = Object.values(sourcesByYear).reduce((sum, sources) => sum + sources.length, 0);
console.log(`Generated ${total} NICE sources across ${years.length} years.`);
console.log(path.relative(workspace, outputFile).replace(/\\/g, '/'));
