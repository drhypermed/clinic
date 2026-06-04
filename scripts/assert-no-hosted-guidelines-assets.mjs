import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const blockedTargets = [
  'public/guidelines-sources',
  'public/guidelines-search/full-text-index.json',
];

const existing = blockedTargets
  .map((target) => path.resolve(workspace, target))
  .filter((target) => fs.existsSync(target));

if (existing.length > 0) {
  const relativePaths = existing.map((target) => path.relative(workspace, target).replace(/\\/g, '/'));
  console.error([
    'Refusing to build because large guideline assets are inside public/.',
    '',
    ...relativePaths.map((target) => `- ${target}`),
    '',
    'Keep PDFs in guidelines-sources/ and upload them to Firebase Storage instead:',
    '  npm run upload:guideline-pdfs',
  ].join('\n'));
  process.exit(1);
}
