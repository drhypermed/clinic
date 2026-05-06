#!/usr/bin/env node
/**
 * Wrapper آمن لـ`firebase deploy` بيرد "n" تلقائياً على أي prompt تفاعلي.
 *
 * المشكلة: `firebase deploy --only firestore` بيسأل أحياناً
 * "Would you like to delete these field overrides? (y/N)" — لو الـCI/الأدمن
 * مش متابع، السؤال بيوقف الـdeploy. الـSafe answer دايماً = N (مش بنحذف
 * field overrides زي TTL على expiresAt من غير ما نراجع).
 *
 * الحل: بنشغّل firebase deploy ونـpipe له stdin = "n\n" متكرر، فأي prompt
 * بيتجاوب بـn تلقائياً.
 *
 * الاستخدام:
 *   node scripts/deploy/firebaseDeploy.mjs --only firestore:rules
 *   node scripts/deploy/firebaseDeploy.mjs --only functions
 *
 * ⚠️ ممنوع نستخدم --force — ده بيرد "y" على الكل ويحذف field overrides فعلاً.
 */

import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

// ─ كل arg بعد اسم السكريبت بيتمرر زي ما هو لـfirebase ─
const passthroughArgs = process.argv.slice(2);

// firebase موجود في PATH (مثبّت globally أو via npx). على Windows اسمه firebase.cmd.
// `shell: true` بيخلي Node يلاقيه أيًا كان النظام.
const firebaseCmd = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';

console.log(`[deploy] running: ${firebaseCmd} deploy ${passthroughArgs.join(' ')}`);
console.log('[deploy] auto-answering "n" to any interactive prompt (safe default).');

const child = spawn(firebaseCmd, ['deploy', ...passthroughArgs], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: process.platform === 'win32',
});

// نـpipe ستريم لانهائي من "n\n" — أي prompt يطلب إجابة، بياخد "n" فوراً.
// Readable.from مع generator = طريقة نظيفة لإنشاء ستريم لانهائي بلا backpressure.
const answerStream = Readable.from(
  (function* () {
    while (true) yield 'n\n';
  })(),
);
answerStream.pipe(child.stdin);

// لو الـchild قفل قبل الـpipe، تجنّب EPIPE error بإغلاق الـstream.
child.stdin.on('error', (err) => {
  if (err.code !== 'EPIPE') {
    console.error('[deploy] stdin error:', err);
  }
});

child.on('close', (code) => {
  answerStream.destroy();
  if (code === 0) {
    console.log('[deploy] ✅ done.');
  } else {
    console.error(`[deploy] ❌ firebase exited with code ${code}`);
  }
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('[deploy] failed to start firebase:', err.message);
  console.error('[deploy] هل firebase-tools متثبت؟ جرّب: npm i -g firebase-tools');
  process.exit(1);
});
