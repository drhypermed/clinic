// سكربت يبحث عن الـexports غير المستخدمة في أي مكان
// المنهج: لكل ملف، نستخرج كل أسماء الـexports، ثم نفحص هل أي ملف آخر يستوردها
// لا نستخدم AST كامل — regex-based بـ false-negative safety (نتسامح أكثر مما نهمل)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// المجلدات اللي نفحصها (مصادر التطبيق)
const SOURCE_DIRS = ['app', 'components', 'services', 'hooks', 'utils', 'contexts'];

// مجلدات نعتبرها consumers بس (مش نفحص ملفاتها للأورفان، لكن استدعاءاتها بتعتبر "استخدام")
const CONSUMER_ONLY_DIRS = ['scripts', 'tests', 'functions'];

// نضيف entry points + root files (App, index, types) لأنهم بيستوردوا من html/build
const ENTRY_FILES_GLOBS = ['App.tsx', 'index.tsx', 'types.ts'];

// نتجاهل الملفات/المجلدات دي تماماً عشان مش نخش false positives
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.claude\/worktrees/,
  /dist\//,
  /coverage\//,
];

// extensions نفحصها
const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

/** قراءة كل الملفات */
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (IGNORE_PATTERNS.some((p) => p.test(full))) continue;
    if (entry.isDirectory()) {
      walkDir(full, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SOURCE_EXT.has(ext)) fileList.push(full);
    }
  }
  return fileList;
}

/** استخراج أسماء الـexports من ملف */
function extractExports(content) {
  const exports = new Set();

  // export const NAME / export let NAME / export var NAME / export function NAME / export class NAME
  const namedRegex = /export\s+(?:const|let|var|function\s*\*?|async\s+function\s*\*?|class|enum|interface|type)\s+([A-Za-z_$][\w$]*)/g;
  let match;
  while ((match = namedRegex.exec(content)) !== null) {
    exports.add(match[1]);
  }

  // export { A, B as C, D }
  const groupRegex = /export\s*\{([^}]+)\}(?!\s*from)/g;
  while ((match = groupRegex.exec(content)) !== null) {
    const parts = match[1].split(',');
    for (const part of parts) {
      const cleaned = part.trim();
      if (!cleaned) continue;
      const asMatch = cleaned.match(/\b(\w+)\s+as\s+(\w+)/);
      if (asMatch) exports.add(asMatch[2]);
      else {
        const name = cleaned.match(/^(\w+)/);
        if (name) exports.add(name[1]);
      }
    }
  }

  // export { A } from './foo' — re-export
  const reExportRegex = /export\s*\{([^}]+)\}\s*from/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    const parts = match[1].split(',');
    for (const part of parts) {
      const cleaned = part.trim();
      if (!cleaned) continue;
      const asMatch = cleaned.match(/\b(\w+)\s+as\s+(\w+)/);
      if (asMatch) exports.add(asMatch[2]);
      else {
        const name = cleaned.match(/^(\w+)/);
        if (name) exports.add(name[1]);
      }
    }
  }

  return exports;
}

/** فحص هل ملف فيه default export */
function hasDefaultExport(content) {
  return /^\s*export\s+default\b/m.test(content);
}

const allFiles = [];
for (const dir of SOURCE_DIRS) {
  walkDir(path.join(ROOT, dir), allFiles);
}
// ضيف entry files من الجذر
for (const f of ENTRY_FILES_GLOBS) {
  const full = path.join(ROOT, f);
  if (fs.existsSync(full)) allFiles.push(full);
}

// consumer files: ملفات بنعتبر استدعاءاتها استخداماً صحيحاً (لكن مش source للأورفان)
const consumerFiles = [];
for (const dir of CONSUMER_ONLY_DIRS) {
  walkDir(path.join(ROOT, dir), consumerFiles);
}
// ضيف ملفات root files تانية (vite.config, firebase-messaging-sw, etc.)
const ROOT_CONSUMER_FILES = ['vite.config.ts', 'firebase-messaging-sw.js', 'service-worker.ts'];
for (const f of ROOT_CONSUMER_FILES) {
  const full = path.join(ROOT, f);
  if (fs.existsSync(full)) consumerFiles.push(full);
}

console.log(`[deadExports] scanning ${allFiles.length} source files + ${consumerFiles.length} consumer files...`);

// جمع كل الـexports من ملفات المصدر
const exportMap = new Map(); // symbolName -> [{file, hasDefault}]
const fileContents = new Map();

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  fileContents.set(file, content);
  const exports = extractExports(content);
  for (const exp of exports) {
    if (!exportMap.has(exp)) exportMap.set(exp, []);
    exportMap.get(exp).push(file);
  }
}

// نقرأ محتوى ملفات الـconsumers (لكن مش نستخرج منها exports)
for (const file of consumerFiles) {
  const content = fs.readFileSync(file, 'utf8');
  fileContents.set(file, content);
}

console.log(`[deadExports] found ${exportMap.size} unique exported symbols`);

// لكل symbol، نعد usages في كل الملفات (ما عدا الملف اللي معرّف فيه)
const unusedExports = []; // {symbol, file}

const allSearchFiles = [...allFiles, ...consumerFiles];
for (const [symbol, files] of exportMap.entries()) {
  for (const definingFile of files) {
    // كلمة boundary + استثناء الملف نفسه
    const wordRegex = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    let usedElsewhere = false;
    let externalUseCount = 0;
    let externalUseFiles = new Set();
    for (const otherFile of allSearchFiles) {
      if (otherFile === definingFile) continue;
      const otherContent = fileContents.get(otherFile);
      if (!otherContent) continue;
      const matches = otherContent.match(wordRegex);
      if (matches && matches.length > 0) {
        externalUseCount += matches.length;
        externalUseFiles.add(otherFile);
        if (externalUseFiles.size >= 1) {
          usedElsewhere = true;
        }
      }
    }
    if (!usedElsewhere) {
      // في الملف نفسه، نشوف هل الـsymbol مستخدم داخلياً برضو
      const definingContent = fileContents.get(definingFile);
      const allMatches = definingContent.match(wordRegex);
      const internalUseCount = allMatches ? allMatches.length : 0;
      // لو معرّف 1 مرة بس → fully unused
      unusedExports.push({ symbol, file: path.relative(ROOT, definingFile), internalUseCount });
    }
  }
}

// رتّب أبجدياً حسب الملف
unusedExports.sort((a, b) => a.file.localeCompare(b.file) || a.symbol.localeCompare(b.symbol));

console.log(`\n[deadExports] potentially unused exports: ${unusedExports.length}\n`);
for (const item of unusedExports) {
  console.log(`  ${item.file}  →  ${item.symbol}  (internal uses: ${item.internalUseCount})`);
}

// كمان نفحص هل في ملفات orphan (مفيش حد بيعمل import لها)
console.log(`\n[deadExports] checking orphan files...\n`);
const orphans = [];
for (const file of allFiles) {
  const relPath = path.relative(ROOT, file).replace(/\\/g, '/');
  const baseName = path.basename(file, path.extname(file));
  // نتجاهل entry files
  if (['App', 'index'].includes(baseName) && path.dirname(relPath) === '.') continue;
  if (baseName === 'types' && path.dirname(relPath) === '.') continue;

  let imported = false;
  const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // نفحص import paths في كل الملفات (مصدر + consumer)
  for (const otherFile of allSearchFiles) {
    if (otherFile === file) continue;
    const otherContent = fileContents.get(otherFile);
    if (!otherContent) continue;
    // فحص 1: static import أو dynamic import('./baseName')
    const importRegex = new RegExp(`(?:import|from)\\s*\\(?\\s*['"\`][^'"\`]*?\\/${escapedBase}(?:['"\`]|/|\\.[a-z]{1,4}['"\`])`, 'g');
    if (importRegex.test(otherContent)) {
      imported = true;
      break;
    }
    // برضو نفحص index.ts pattern (import './folder' → folder/index.ts)
    if (baseName === 'index') {
      const dirName = path.basename(path.dirname(file));
      const folderImportRegex = new RegExp(`(?:import|from)\\s*\\(?\\s*['"\`][^'"\`]*?\\/${dirName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      if (folderImportRegex.test(otherContent)) {
        imported = true;
        break;
      }
    }
  }
  if (!imported) {
    orphans.push(relPath);
  }
}

console.log(`[deadExports] potentially orphan files: ${orphans.length}`);
for (const f of orphans) {
  console.log(`  ${f}`);
}
