import fs from 'node:fs';
import path from 'node:path';

const schools = process.argv.slice(2).filter(Boolean);
if (schools.length === 0) {
  throw new Error('Pass one or more school names, for example: node scripts/generate-generic-school-sources.mjs ACR ASH');
}

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const titleFromSourcePath = (sourcePath) =>
  path.posix.basename(sourcePath, path.posix.extname(sourcePath)).replace(/\s+/g, ' ').trim();

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

for (const school of schools) {
  const sourceDir = path.resolve('guidelines-sources/_structured/full-text', school);
  const outputDir = path.resolve('components/guidelines/data', slugify(school));
  const outputFile = path.join(outputDir, 'sources.ts');
  fs.mkdirSync(outputDir, { recursive: true });

  const sources = [];
  for (const filepath of walkJsonFiles(sourceDir)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (data.status !== 'extracted') continue;

    const sourcePath = String(data.sourcePath || '').replace(/\\/g, '/');
    const parts = sourcePath.split('/');
    const folders = parts.slice(1, -1);
    const folderTitle = folders.length ? folders.join(' / ') : `${school} Guidelines`;
    const title = titleFromSourcePath(sourcePath);
    const id = `${slugify(school)}-${slugify(folderTitle)}-${slugify(title)}`.slice(0, 120);

    sources.push({
      id,
      folderTitle,
      folderTopicId: `${slugify(school)}-folder-${slugify(folderTitle)}`.slice(0, 100),
      fileTopicId: `${slugify(school)}-file-${id}`.slice(0, 140),
      title,
      fileType: 'Full guideline',
      pageCount: data.pageCount,
      textChars: data.textChars,
      chunkCount: Array.isArray(data.chunks) ? data.chunks.length : 0,
      citation: `${school}. ${title}.`,
      url: '',
      localFile: sourcePath,
      structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace(/\.pdf$/i, '.json')}`,
      rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath.replace(/\.pdf$/i, '.txt')}`,
      sha256: data.sha256,
    });
  }

  sources.sort((a, b) => a.folderTitle.localeCompare(b.folderTitle) || a.title.localeCompare(b.title));

  let output = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
  output += `export const ${school.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}_SOURCES: GuidelineSource[] = `;
  output += JSON.stringify(sources, null, 2);
  output += ';\n';
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Generated ${sources.length} ${school} sources in ${path.relative(process.cwd(), outputFile).replace(/\\/g, '/')}`);
}
