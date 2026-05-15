import { rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(rootDir, 'dist');
const relativeDist = relative(rootDir, distDir);

if (!relativeDist || relativeDist.startsWith('..') || relativeDist.includes(':')) {
  throw new Error(`Refusing to clean unexpected output directory: ${distDir}`);
}

rmSync(distDir, { recursive: true, force: true });
console.log(`Cleaned ${relativeDist}`);
