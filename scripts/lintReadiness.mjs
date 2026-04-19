import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOTS = ['app', 'components', 'contexts', 'hooks', 'services', 'utils', 'functions/src'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORED_DIRS = new Set([
  '.firebase',
  '.git',
  '.sixth',
  'build',
  'dist',
  'drugs_backup',
  'jscpd_out',
  'node_modules',
]);

const BASELINE_PATH = path.join('scripts', 'readiness', 'consoleBaseline.json');
const CONSOLE_METHODS = ['debug', 'info', 'log', 'warn', 'error'];
const CONSOLE_PATTERN = /\bconsole\.(debug|info|log|warn|error)\b/g;

export const createEmptyConsoleCounts = () => ({
  debug: 0,
  info: 0,
  log: 0,
  warn: 0,
  error: 0,
});

export const countConsoleCallsInSource = (sourceCode) => {
  const counts = createEmptyConsoleCounts();
  let match = CONSOLE_PATTERN.exec(sourceCode);

  while (match) {
    const method = match[1];
    if (method in counts) {
      counts[method] += 1;
    }
    match = CONSOLE_PATTERN.exec(sourceCode);
  }

  CONSOLE_PATTERN.lastIndex = 0;
  return counts;
};

const sumCounts = (left, right) => ({
  debug: left.debug + right.debug,
  info: left.info + right.info,
  log: left.log + right.log,
  warn: left.warn + right.warn,
  error: left.error + right.error,
});

const isIgnoredDirectory = (dirName) => IGNORED_DIRS.has(dirName);
const shouldIncludeFile = (relativePath) => SOURCE_EXTENSIONS.has(path.extname(relativePath));

const walkSources = async (absoluteDirPath, relativeDirPath, collector) => {
  const entries = await readdir(absoluteDirPath, { withFileTypes: true });

  for (const entry of entries) {
    const nextRelativePath = relativeDirPath ? path.join(relativeDirPath, entry.name) : entry.name;
    const nextAbsolutePath = path.join(absoluteDirPath, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDirectory(entry.name)) {
        continue;
      }
      await walkSources(nextAbsolutePath, nextRelativePath, collector);
      continue;
    }

    if (!entry.isFile() || !shouldIncludeFile(nextRelativePath)) {
      continue;
    }

    const sourceCode = await readFile(nextAbsolutePath, 'utf8');
    const counts = countConsoleCallsInSource(sourceCode);
    const total = Object.values(counts).reduce((acc, value) => acc + value, 0);

    if (total === 0) {
      continue;
    }

    collector.push({
      path: nextRelativePath.replace(/\\/g, '/'),
      total,
      counts,
    });
  }
};

export const collectConsoleUsage = async ({ cwd = process.cwd(), roots = SOURCE_ROOTS } = {}) => {
  const files = [];
  let totals = createEmptyConsoleCounts();

  for (const root of roots) {
    const absoluteRoot = path.resolve(cwd, root);
    try {
      await walkSources(absoluteRoot, root, files);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  files.sort((a, b) => b.total - a.total || a.path.localeCompare(b.path));
  for (const file of files) {
    totals = sumCounts(totals, file.counts);
  }

  return {
    files,
    totals,
  };
};

const parseArgs = (argv) => {
  const args = new Map();
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) {
      return;
    }

    const [key, value] = arg.slice(2).split('=');
    args.set(key, value ?? 'true');
  });
  return args;
};

const isTruthyArg = (value) => String(value ?? '').toLowerCase() === 'true';

const formatCounts = (counts) =>
  CONSOLE_METHODS.map((method) => `${method}:${String(counts[method]).padStart(3, ' ')}`).join('  ');

const compareAgainstBaseline = (currentCounts, baselineCounts) => {
  const regressions = [];

  for (const method of CONSOLE_METHODS) {
    const current = Number(currentCounts[method] || 0);
    const baseline = Number(baselineCounts?.[method] || 0);

    if (current > baseline) {
      regressions.push({ method, current, baseline });
    }
  }

  return regressions;
};

const readJsonIfExists = async (absolutePath) => {
  try {
    const raw = await readFile(absolutePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const ensureConsoleFilterInstalled = async (cwd) => {
  const indexFile = path.resolve(cwd, 'index.tsx');
  const content = await readFile(indexFile, 'utf8');
  // نقبل إما static import أو dynamic import — dynamic بنستخدمه لتأجيل
  // التحميل وتسريع boot بدون ما نخسر الحماية.
  const hasStaticImport = content.includes("import { installConsoleProductionFilter } from './utils/installConsoleProductionFilter';");
  const hasDynamicImport = content.includes("import('./utils/installConsoleProductionFilter')");
  const hasImport = hasStaticImport || hasDynamicImport;
  const hasCall = content.includes('installConsoleProductionFilter();');
  return hasImport && hasCall;
};

const writeBaseline = async (cwd, totals) => {
  const absoluteBaselinePath = path.resolve(cwd, BASELINE_PATH);
  await mkdir(path.dirname(absoluteBaselinePath), { recursive: true });

  const payload = {
    generatedAt: new Date().toISOString(),
    counts: totals,
  };

  await writeFile(absoluteBaselinePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return absoluteBaselinePath;
};

const runCli = async () => {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const usage = await collectConsoleUsage({ cwd });
  const writeBaselineFlag = isTruthyArg(args.get('write-baseline'));
  const absoluteBaselinePath = path.resolve(cwd, BASELINE_PATH);

  console.log(`[lintReadiness] files with console calls: ${usage.files.length}`);
  console.log(`[lintReadiness] totals -> ${formatCounts(usage.totals)}`);

  const topFiles = usage.files.slice(0, 15);
  console.log('[lintReadiness] top files by console usage:');
  if (topFiles.length === 0) {
    console.log('  (none)');
  } else {
    topFiles.forEach((file) => {
      console.log(`  ${String(file.total).padStart(3, ' ')}  ${file.path}  ${formatCounts(file.counts)}`);
    });
  }

  const hasFilter = await ensureConsoleFilterInstalled(cwd);
  if (!hasFilter) {
    console.error('[lintReadiness] production console filter is not registered in index.tsx.');
    process.exitCode = 1;
  }

  if (writeBaselineFlag) {
    const baselinePath = await writeBaseline(cwd, usage.totals);
    console.log(`[lintReadiness] baseline updated at ${baselinePath}`);
    return;
  }

  const baselinePayload = await readJsonIfExists(absoluteBaselinePath);
  if (!baselinePayload) {
    console.warn('[lintReadiness] baseline file not found. Run `npm run lint:readiness -- --write-baseline` to create one.');
    return;
  }

  const baselineCounts = baselinePayload.counts || {};
  const regressions = compareAgainstBaseline(usage.totals, baselineCounts);

  if (regressions.length > 0) {
    console.error('[lintReadiness] console usage regression detected:');
    regressions.forEach((item) => {
      console.error(`  ${item.method}: current=${item.current}, baseline=${item.baseline}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log('[lintReadiness] console usage is within baseline limits.');
};

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  runCli().catch((error) => {
    console.error('[lintReadiness] unexpected failure:', error);
    process.exitCode = 1;
  });
}

