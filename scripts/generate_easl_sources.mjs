import fs from 'node:fs';
import path from 'node:path';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const sourceDir = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\guidelines-sources\\_structured\\full-text\\EASL';
const outputFile = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\components\\guidelines\\data\\easl2026\\sources.ts';

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
  
  const filename = path.basename(sourcePath);
  const title = path.basename(filename, path.extname(filename));
  const fileId = "easl-" + slugify(title).slice(0, 60);
  
  sources.push({
    id: fileId,
    folderTitle: "EASL Guidelines",
    folderTopicId: "easl-folder-guidelines",
    fileTopicId: "easl-file-" + fileId,
    title: title,
    fileType: "Full guideline",
    pageCount: pageCount,
    textChars: textChars,
    chunkCount: chunks.length,
    citation: `EASL. ${title}.`,
    url: "https://easl.eu/publications/clinical-practice-guidelines/",
    localFile: sourcePath,
    structuredTextPath: `guidelines-sources/_structured/full-text/${sourcePath.replace('.pdf', '.json')}`,
    rawTextPath: `guidelines-sources/_extracted/full-text/${sourcePath.replace('.pdf', '.txt')}`,
    sha256: sha256
  });
}

let out = "import type { GuidelineSource } from '../../guidelinesData';\n\n";
out += "export const EASL_SOURCES: GuidelineSource[] = [\n";
for (const s of sources) {
  out += "  {\n";
  for (const [k, v] of Object.entries(s)) {
    if (typeof v === 'string') {
      out += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    } else {
      out += `    "${k}": ${v},\n`;
    }
  }
  out += "  },\n";
}
out += "];\n";

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`Generated ${sources.length} sources in ${outputFile}`);
