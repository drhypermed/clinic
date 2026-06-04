import fs from 'node:fs';
import path from 'node:path';

const pdfDir = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\guidelines-sources\\EASL';
const txtDir = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\guidelines-sources\\_extracted\\full-text\\EASL';

const pdfs = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith('.pdf'));

for (const pdf of pdfs) {
  if (/\b20\d{2}\b/.test(pdf)) {
    console.log(`Already has year: ${pdf}`);
    continue;
  }
  
  const txtPath = path.join(txtDir, pdf.replace('.pdf', '.txt'));
  if (!fs.existsSync(txtPath)) {
    console.log(`No text found for: ${pdf}`);
    continue;
  }
  
  const text = fs.readFileSync(txtPath, 'utf8').slice(0, 3000);
  const years = text.match(/\b(20\d{2})\b/g);
  
  if (years) {
    const validYears = years.map(Number).filter(y => y >= 2000 && y <= 2026);
    if (validYears.length > 0) {
      const maxYear = Math.max(...validYears);
      const newName = `${maxYear} ${pdf}`;
      fs.renameSync(path.join(pdfDir, pdf), path.join(pdfDir, newName));
      console.log(`Renamed: ${pdf} -> ${newName}`);
    } else {
      console.log(`No valid year found for: ${pdf}`);
    }
  } else {
    console.log(`No year found for: ${pdf}`);
  }
}
