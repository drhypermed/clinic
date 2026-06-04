console.error([
  'sync:guideline-pdfs is disabled.',
  '',
  'PDFs should stay in guidelines-sources/ locally and be uploaded to Firebase Storage with:',
  '  npm run upload:guideline-pdfs',
  '',
  'Do not copy guideline PDFs into public/. Files in public/ are shipped with Firebase Hosting on every deploy.',
].join('\n'));

process.exit(1);
