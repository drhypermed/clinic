import fs from 'node:fs';
import path from 'node:path';

const structuredRoot = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\guidelines-sources\\_structured\\full-text';
const rawRoot = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\guidelines-sources\\_extracted\\full-text';

const structuredEASL = path.join(structuredRoot, 'EASL');
const rawEASL = path.join(rawRoot, 'EASL');

fs.mkdirSync(structuredEASL, { recursive: true });
fs.mkdirSync(rawEASL, { recursive: true });

for (const entry of fs.readdirSync(structuredRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.json')) {
    const jsonPath = path.join(structuredRoot, entry.name);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Fix sourcePath
    data.sourcePath = `EASL/${entry.name.replace('.json', '.pdf')}`;
    fs.writeFileSync(path.join(structuredEASL, entry.name), JSON.stringify(data, null, 2), 'utf8');
    fs.unlinkSync(jsonPath);
  }
}

for (const entry of fs.readdirSync(rawRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.txt')) {
    fs.renameSync(path.join(rawRoot, entry.name), path.join(rawEASL, entry.name));
  }
}
console.log('Fixed paths and moved files to EASL directory.');
