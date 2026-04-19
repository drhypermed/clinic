import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOTS = [
  'app',
  'components',
  'contexts',
  'hooks',
  'services',
  'styles',
  'utils',
  'functions/src',
];

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
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

const toIntegerArg = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const countLines = (content) => {
  if (!content) {
    return 0;
  }

  return content.split(/\r?\n/).length;
};

const shouldIncludeFile = (filePath) => CODE_EXTENSIONS.has(path.extname(filePath));

const isIgnoredDirectory = (directoryName) => IGNORED_DIRS.has(directoryName);

const walkDirectory = async (absoluteDirPath, relativeDirPath, collector) => {
  const entries = await readdir(absoluteDirPath, { withFileTypes: true });

  for (const entry of entries) {
    const nextRelativePath = relativeDirPath ? path.join(relativeDirPath, entry.name) : entry.name;
    const nextAbsolutePath = path.join(absoluteDirPath, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDirectory(entry.name)) {
        continue;
      }

      await walkDirectory(nextAbsolutePath, nextRelativePath, collector);
      continue;
    }

    if (!entry.isFile() || !shouldIncludeFile(nextRelativePath)) {
      continue;
    }

    const content = await readFile(nextAbsolutePath, 'utf8');
    collector.push({
      path: nextRelativePath.replace(/\\/g, '/'),
      lines: countLines(content),
    });
  }
};

export const buildLargeFileReport = async ({
  cwd = process.cwd(),
  roots = DEFAULT_ROOTS,
  warnLines = 500,
  failLines = 900,
  top = 20,
} = {}) => {
  const files = [];

  for (const root of roots) {
    const absoluteRoot = path.resolve(cwd, root);
    try {
      await walkDirectory(absoluteRoot, root, files);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  files.sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  const warnFiles = files.filter((file) => file.lines >= warnLines);
  const failFiles = files.filter((file) => file.lines >= failLines);
  const topFiles = files.slice(0, top);

  return {
    totalFiles: files.length,
    warnFiles,
    failFiles,
    topFiles,
    warnLines,
    failLines,
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

const printSection = (title, files) => {
  console.log(`\n${title}`);
  if (files.length === 0) {
    console.log('  (none)');
    return;
  }

  files.forEach((file) => {
    console.log(`  ${String(file.lines).padStart(4, ' ')}  ${file.path}`);
  });
};

const runCli = async () => {
  const args = parseArgs(process.argv.slice(2));
  const warnLines = toIntegerArg(args.get('warn-lines'), 500);
  const failLines = toIntegerArg(args.get('fail-lines'), 900);
  const top = toIntegerArg(args.get('top'), 20);

  const report = await buildLargeFileReport({
    warnLines,
    failLines,
    top,
  });

  console.log(`[auditLargeFiles] scanned ${report.totalFiles} files`);
  printSection(`[auditLargeFiles] top ${top} largest files`, report.topFiles);
  printSection(`[auditLargeFiles] files >= ${warnLines} lines`, report.warnFiles);
  printSection(`[auditLargeFiles] files >= ${failLines} lines (blocking)`, report.failFiles);

  if (report.failFiles.length > 0) {
    console.error(`[auditLargeFiles] found ${report.failFiles.length} files above blocking threshold ${failLines}.`);
    process.exitCode = 1;
  }
};

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  runCli().catch((error) => {
    console.error('[auditLargeFiles] unexpected failure:', error);
    process.exitCode = 1;
  });
}
