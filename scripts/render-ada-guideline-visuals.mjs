import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const workspace = process.cwd();
const outputDir = path.resolve(process.argv[2] ?? 'public/guidelines/ada2025');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(outputDir, 'Output directory');
fs.mkdirSync(outputDir, { recursive: true });

const popplerBinCandidates = [
  process.env.POPPLER_BIN,
  path.join(
    process.env.LOCALAPPDATA ?? '',
    'Microsoft',
    'WinGet',
    'Packages',
    'oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe',
    'poppler-25.07.0',
    'Library',
    'bin',
  ),
].filter(Boolean);

const commandExists = (command) => {
  try {
    execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const resolvePopplerCommand = (name) => {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  if (commandExists(exe)) return exe;
  for (const candidate of popplerBinCandidates) {
    const fullPath = path.join(candidate, exe);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  throw new Error(`${name} was not found. Install Poppler or set POPPLER_BIN.`);
};

const pdftoppm = resolvePopplerCommand('pdftoppm');

const visuals = [
  {
    id: 'table-6-2-cgm-metrics',
    sourcePdf: 'guidelines-sources/ADA/2025/6. Glycemic Goals and Hypoglycemia Standards of Care in Diabetes 2025.pdf',
    page: 4,
    label: 'Table 6.2',
    title: 'CGM metrics for clinical care',
  },
  {
    id: 'table-6-8-dka-hhs-criteria',
    sourcePdf: 'guidelines-sources/ADA/2025/6. Glycemic Goals and Hypoglycemia Standards of Care in Diabetes 2025.pdf',
    page: 12,
    label: 'Table 6.8',
    title: 'Diagnostic criteria for DKA and HHS',
  },
  {
    id: 'figure-9-3-type-2-medication-algorithm',
    sourcePdf: 'guidelines-sources/ADA/2025/9. Pharmacologic Approaches to Glycemic Treatment.pdf',
    page: 10,
    label: 'Figure 9.3',
    title: 'Glucose-lowering medications in type 2 diabetes',
  },
  {
    id: 'table-9-2-glucose-lowering-medications',
    sourcePdf: 'guidelines-sources/ADA/2025/9. Pharmacologic Approaches to Glycemic Treatment.pdf',
    page: 11,
    label: 'Table 9.2',
    title: 'Features of medications for lowering glucose',
  },
  {
    id: 'table-13-1-older-adult-targets',
    sourcePdf: 'guidelines-sources/ADA/2025/13. Older Adults.pdf',
    page: 6,
    label: 'Table 13.1',
    title: 'Older adult glycemic goal framework',
  },
  {
    id: 'figure-13-2-insulin-simplification',
    sourcePdf: 'guidelines-sources/ADA/2025/13. Older Adults.pdf',
    page: 9,
    label: 'Figure 13.2',
    title: 'Algorithm to simplify insulin administration plans',
  },
  {
    id: 'table-15-2-pregnancy-glucose-goals',
    sourcePdf: 'guidelines-sources/ADA/2025/15. Management of Diabetes in Pregnancy.pdf',
    page: 5,
    label: 'Table 15.2',
    title: 'Blood glucose goals in pregnancies associated with diabetes',
  },
  {
    id: 'figure-16-1-dka-hhs-treatment-pathways',
    sourcePdf: 'guidelines-sources/ADA/2025/16. Diabetes Care in the Hospital.pdf',
    page: 9,
    label: 'Figure 16.1',
    title: 'Treatment pathways for DKA and HHS',
  },
];

const manifest = [];

for (const visual of visuals) {
  const pdfPath = path.resolve(visual.sourcePdf);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Missing source PDF: ${visual.sourcePdf}`);
  }

  const outputBase = path.join(outputDir, visual.id);
  const outputPath = `${outputBase}.png`;
  if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { force: true });

  execFileSync(
    pdftoppm,
    ['-r', '220', '-png', '-f', String(visual.page), '-l', String(visual.page), '-singlefile', pdfPath, outputBase],
    { cwd: workspace, stdio: 'ignore' },
  );

  const stat = fs.statSync(outputPath);
  manifest.push({
    ...visual,
    imageSrc: `/guidelines/ada2025/${visual.id}.png`,
    output: path.relative(workspace, outputPath).replace(/\\/g, '/'),
    bytes: stat.size,
  });
  console.log(`Rendered ${visual.label}: ${path.relative(workspace, outputPath)}`);
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Done. Rendered visuals: ${manifest.length}`);
