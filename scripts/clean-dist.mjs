import { existsSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(rootDir, 'dist');
const relativeDist = relative(rootDir, distDir);

if (!relativeDist || relativeDist.startsWith('..') || relativeDist.includes(':')) {
  throw new Error(`Refusing to clean unexpected output directory: ${distDir}`);
}

rmSync(distDir, { recursive: true, force: true });
if (existsSync(distDir) && process.platform === 'win32') {
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      'Remove-Item -LiteralPath $env:TARGET_DIST -Recurse -Force',
    ],
    {
      env: { ...process.env, TARGET_DIST: distDir },
      stdio: 'inherit',
    },
  );
}
if (existsSync(distDir)) {
  throw new Error(`Failed to fully clean output directory: ${distDir}`);
}
console.log(`Cleaned ${relativeDist}`);
