import path from 'node:path';
import { chromium } from '@playwright/test';

const PROFILE_DIR = path.resolve('scratch/acog-auth-profile');
const START_URL = process.argv[2] || 'https://www.acog.org/login';

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1366, height: 900 },
  acceptDownloads: true,
  args: ['--start-maximized'],
});

const page = context.pages()[0] || await context.newPage();
await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 }).catch(() => undefined);

console.log('ACOG login browser is open.');
console.log('Log in manually, then close the browser window when finished.');

context.on('close', () => process.exit(0));
await new Promise(() => undefined);
