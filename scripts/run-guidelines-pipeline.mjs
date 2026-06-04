import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valuesFor = (prefix) => args.filter((arg) => arg.startsWith(prefix));

const onlyArgs = valuesFor('--only=');
const dryRun = has('--dry-run');
const cloud = has('--cloud');
const extract = has('--extract') || has('--all');
const index = has('--index') || has('--all') || (!extract && !cloud);
const audit = has('--audit') || has('--all') || (!extract && !cloud);
const migrate = has('--migrate') || has('--all');
const embed = has('--embed') || has('--all');
const uploadPdfs = has('--upload-pdfs') || has('--all');

const run = (label, script, extraArgs = []) => {
  console.log(`\n[guidelines:pipeline] ${label}`);
  const result = spawnSync(process.execPath, [script, ...extraArgs], {
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
};

const guardedCloudRun = (label, script, extraArgs = []) => {
  if (!cloud) {
    console.log(`\n[guidelines:pipeline] skipped ${label}; pass --cloud to write Firebase/Storage state.`);
    return;
  }
  run(label, script, extraArgs);
};

try {
  if (extract) {
    run('extract PDFs into structured full text', 'scripts/extract-guidelines-corpus.mjs', onlyArgs);
  }

  if (index) {
    run('build generated full-text search index', 'scripts/build-guidelines-chat-index.mjs');
  }

  if (audit) {
    run('audit local guideline pipeline', 'scripts/audit-guidelines-pipeline.mjs', ['--fail-on-issues']);
  }

  if (migrate) {
    guardedCloudRun(
      dryRun ? 'dry-run canonical Firestore migration' : 'canonical Firestore migration',
      'scripts/migrate-guidelines-canonical.mjs',
      [...onlyArgs, ...(dryRun ? ['--dry-run'] : [])],
    );
  }

  if (embed) {
    guardedCloudRun('embed guideline chunks', 'scripts/embed-guideline-chunks.mjs', onlyArgs);
  }

  if (uploadPdfs) {
    guardedCloudRun('upload guideline PDFs to Storage', 'scripts/upload-guideline-pdfs-storage.mjs', onlyArgs);
  }

  console.log('\n[guidelines:pipeline] done');
} catch (error) {
  console.error('\n[guidelines:pipeline] failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
