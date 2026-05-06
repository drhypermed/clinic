#!/usr/bin/env node
/**
 * أداة تقدير تكلفة الذكاء الاصطناعي (Gemini 2.5 Flash)
 *
 * الفكرة:
 *   - كل ميزة في التطبيق ليها استخدام مختلف للـ AI (input + output + thinking)
 *   - السعر يختلف حسب thinkingBudget: لو > 0 يستخدم سعر "with thinking" (أغلى ~8×)
 *   - الـ utilization = نسبة استهلاك الطبيب من الحد اليومي (0.4 = 40%)
 *
 * التشغيل:
 *   node scripts/estimate-ai-cost.mjs
 *
 * عدّل الـ scenarios في آخر الملف للسيناريوهات اللي تهمك.
 *
 * ⚠️ الأرقام تقديرية — تأكد من الأسعار الحالية على Google Cloud Pricing.
 */

// ─────────────────────────────────────────────────────────────────────────────
// أسعار Gemini 2.5 Flash (USD لكل مليون توكن)
// المصدر: Google Cloud Pricing — تأكد من الأسعار الحالية
// ─────────────────────────────────────────────────────────────────────────────
const PRICING = {
  // بدون thinking (الإضافة السريعة + الترجمة)
  withoutThinking: {
    input: 0.075, // $0.075 لكل مليون input token
    output: 0.30, // $0.30 لكل مليون output token
  },
  // مع thinking (التحليل + التداخلات + الكلى + الحمل/الرضاعة)
  // الـ output بيشمل الـ thinking tokens (أغلى ~8×)
  withThinking: {
    input: 0.30, // $0.30 لكل مليون input token
    output: 2.50, // $2.50 لكل مليون output token (مع thinking)
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// تعريف الميزات: كل ميزة بحجمها الفعلي من الكود + حدودها اليومية
// الأرقام مأخوذة من فحص:
//   - services/geminiCaseAnalysisService.ts
//   - services/geminiRxService.ts
//   - services/geminiDrugInteractionsService.ts
//   - services/geminiPregnancySafetyService.ts
//   - services/geminiDrugToolsService.ts
//   - services/account-type-controls/defaults.ts (الحدود اليومية)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = {
  caseAnalysis: {
    name: 'التحليل الذكي',
    inputTokens: 1600,    // system prompt (~1067) + patient data (~533)
    outputTokens: 500,    // JSON response تقريباً
    thinkingBudget: 1000, // من geminiCaseAnalysisService.ts:383
    daily: { free: 2, premium: 50, proMax: 50 },
  },
  quickAdd: {
    name: 'الإضافة السريعة',
    inputTokens: 350,     // prompt مختصر (ترجمة فقط)
    outputTokens: 300,
    thinkingBudget: 0,    // من geminiRxService.ts:335 — رخيصة
    daily: { free: 5, premium: 100, proMax: 200 },
  },
  drugInteractions: {
    name: 'فحص التداخلات الدوائية',
    inputTokens: 1000,    // system prompt (~833) + drug list (~167)
    outputTokens: 400,
    thinkingBudget: 1000, // من geminiDrugInteractionsService.ts:264
    daily: { free: 10, premium: 100, proMax: 200 },
  },
  pregnancySafety: {
    name: 'فحص الحمل والرضاعة',
    inputTokens: 1050,    // system prompt (~933) + drug data (~117)
    outputTokens: 300,
    thinkingBudget: 1000, // من geminiPregnancySafetyService.ts:321
    daily: { free: 10, premium: 100, proMax: 200 },
  },
  renalCalculator: {
    name: 'حاسبة جرعات الكلى',
    inputTokens: 950,     // system prompt (~867) + patient data (~83)
    outputTokens: 250,
    thinkingBudget: 1500, // من geminiDrugToolsService.ts:134 — الأعلى
    daily: { free: 10, premium: 100, proMax: 200 },
  },
  medicalReport: {
    name: 'التقرير الطبي',
    inputTokens: 1200,    // تقدير: شبيه بالتحليل الذكي
    outputTokens: 800,    // التقرير أطول من التحليل
    thinkingBudget: 1000, // افتراض: شبيه بالتحليل
    daily: { free: 3, premium: 80, proMax: 80 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// حساب تكلفة الاستدعاء الواحد لميزة
// ─────────────────────────────────────────────────────────────────────────────
function costPerCall(feature) {
  // لو فيه thinking budget، السعر أعلى والـ output يشمل thinking tokens
  const useThinking = feature.thinkingBudget > 0;
  const pricing = useThinking ? PRICING.withThinking : PRICING.withoutThinking;

  // الـ output الفعلي = المحتوى الناتج + thinking tokens (لو موجودة)
  const totalOutputTokens = feature.outputTokens + feature.thinkingBudget;

  const inputCost = (feature.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (totalOutputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

// ─────────────────────────────────────────────────────────────────────────────
// تكلفة طبيب واحد شهرياً لباقة معينة بنسبة استهلاك معينة
//   tier: 'free' | 'premium' | 'proMax'
//   utilization: نسبة استهلاك الطبيب من حدوده اليومية (0.0 - 1.0)
//   workDays: أيام العمل في الشهر (افتراضي 30 — أيام تقويمية)
// ─────────────────────────────────────────────────────────────────────────────
function monthlyDoctorCost(tier, utilization = 1.0, workDays = 30) {
  let total = 0;
  const breakdown = {};

  for (const [key, feature] of Object.entries(FEATURES)) {
    const dailyCalls = feature.daily[tier] * utilization;
    const monthlyCalls = dailyCalls * workDays;
    const featureCost = monthlyCalls * costPerCall(feature);
    total += featureCost;
    breakdown[feature.name] = featureCost;
  }

  return { total, breakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// تكلفة المنصة الكاملة لـ N طبيب موزّعين على الباقات
//   subscription: سعر اشتراك الباقات المدفوعة (USD/طبيب/شهر)
//                  المجاني لا يدفع (= 0)
//   cachingDiscount: نسبة التوفير الفعلية من الـ caching (0.0 - 1.0)
// ─────────────────────────────────────────────────────────────────────────────
function platformCost({
  totalDoctors,
  freeRatio = 0.5,
  premiumRatio = 0.4,
  proMaxRatio = 0.1,
  utilization = 0.4,
  workDays = 30,
  subscriptionUsd = 10,
  premiumPriceUsd = null, // لو null، يستخدم subscriptionUsd
  proMaxPriceUsd = null, // لو null، يستخدم subscriptionUsd
  cachingDiscount = 0.5, // الـ caching الموجود يوفر ~50% فعلياً
}) {
  const freeDoctors = Math.round(totalDoctors * freeRatio);
  const premiumDoctors = Math.round(totalDoctors * premiumRatio);
  const proMaxDoctors = Math.round(totalDoctors * proMaxRatio);

  // التكلفة الخام (بدون caching)
  const rawFreeCost = freeDoctors * monthlyDoctorCost('free', utilization, workDays).total;
  const rawPremiumCost = premiumDoctors * monthlyDoctorCost('premium', utilization, workDays).total;
  const rawProMaxCost = proMaxDoctors * monthlyDoctorCost('proMax', utilization, workDays).total;
  const rawTotal = rawFreeCost + rawPremiumCost + rawProMaxCost;

  // التكلفة الفعلية بعد الـ caching
  const actualCost = rawTotal * (1 - cachingDiscount);

  // الإيراد (المجاني = 0، الباقات المدفوعة)
  const premiumPrice = premiumPriceUsd ?? subscriptionUsd;
  const proMaxPrice = proMaxPriceUsd ?? subscriptionUsd;
  const revenue = premiumDoctors * premiumPrice + proMaxDoctors * proMaxPrice;

  const profit = revenue - actualCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    rawCostUsd: rawTotal,
    actualCostUsd: actualCost,
    revenueUsd: revenue,
    profitUsd: profit,
    marginPct: margin,
    freeCost: rawFreeCost * (1 - cachingDiscount),
    premiumCost: rawPremiumCost * (1 - cachingDiscount),
    proMaxCost: rawProMaxCost * (1 - cachingDiscount),
    counts: { free: freeDoctors, premium: premiumDoctors, proMax: proMaxDoctors },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// طباعة جدول التكلفة لكل ميزة + كل باقة
// ─────────────────────────────────────────────────────────────────────────────
function printPerCallTable() {
  console.log('\n📊 تكلفة الاستدعاء الواحد لكل ميزة (USD):\n');
  console.log('| الميزة                  | input | output+think | thinking | تكلفة/استدعاء |');
  console.log('|------------------------|-------|--------------|----------|---------------|');
  for (const feature of Object.values(FEATURES)) {
    const cost = costPerCall(feature);
    const out = feature.outputTokens + feature.thinkingBudget;
    console.log(
      `| ${feature.name.padEnd(22)} | ${String(feature.inputTokens).padStart(5)} | ${String(out).padStart(12)} | ${feature.thinkingBudget > 0 ? '✅' : '❌'}      | $${cost.toFixed(6)}    |`
    );
  }
}

function printPerDoctorTable(utilization) {
  console.log(`\n👨‍⚕️ تكلفة طبيب واحد شهرياً (استهلاك ${(utilization * 100).toFixed(0)}% من الحدود):\n`);
  console.log('| الباقة      | تكلفة شهرية (USD) | جنيه (USD × 50) |');
  console.log('|-------------|-------------------|-----------------|');
  for (const tier of ['free', 'premium', 'proMax']) {
    const { total } = monthlyDoctorCost(tier, utilization);
    const tierName = { free: 'مجاني', premium: 'برو', proMax: 'برو ماكس' }[tier];
    console.log(`| ${tierName.padEnd(11)} | $${total.toFixed(2).padStart(16)} | ${(total * 50).toFixed(0).padStart(15)} |`);
  }
}

function printPlatformScenario(scenario) {
  const result = platformCost(scenario);
  const utilPct = `${(scenario.utilization * 100).toFixed(0)}%`;
  const subPrice = scenario.subscriptionUsd ?? 10;
  console.log(`\n🌐 ${scenario.totalDoctors} طبيب — استهلاك ${utilPct} — اشتراك $${subPrice}/شهر`);
  console.log(`   توزيع: ${result.counts.free} مجاني | ${result.counts.premium} برو | ${result.counts.proMax} برو ماكس`);
  console.log(`   التكلفة (بعد caching ~50%): $${result.actualCostUsd.toFixed(0)} (${(result.actualCostUsd * 50).toFixed(0)} جنيه)`);
  console.log(`   الإيراد:                    $${result.revenueUsd.toFixed(0)} (${(result.revenueUsd * 50).toFixed(0)} جنيه)`);
  const profitSign = result.profitUsd >= 0 ? '✅ ربح:' : '❌ خسارة:';
  console.log(`   ${profitSign}                       $${Math.abs(result.profitUsd).toFixed(0)} (${(Math.abs(result.profitUsd) * 50).toFixed(0)} جنيه) — هامش ${result.marginPct.toFixed(0)}%`);
}

// ─────────────────────────────────────────────────────────────────────────────
// تشغيل التقرير الكامل
// ─────────────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log('  تقدير تكلفة Gemini AI — Dr Hyper Clinic');
console.log('  الموديل: gemini-2.5-flash');
console.log('═══════════════════════════════════════════════════════════════');

printPerCallTable();
printPerDoctorTable(0.4); // 40% استهلاك (واقعي)
printPerDoctorTable(1.0); // 100% استهلاك (سقف نظري)

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  السيناريوهات المنصة (1000 طبيب — اشتراك $10/شهر)');
console.log('═══════════════════════════════════════════════════════════════');

// السيناريوهات الأساسية: 1000 طبيب، اشتراك $10
const baseScenario = {
  totalDoctors: 1000,
  freeRatio: 0.5,
  premiumRatio: 0.4,
  proMaxRatio: 0.1,
  subscriptionUsd: 10,
  cachingDiscount: 0.5, // الـ caching الموجود يوفر ~50%
};

// 3 مستويات استهلاك
printPlatformScenario({ ...baseScenario, utilization: 0.3 }); // محافظ
printPlatformScenario({ ...baseScenario, utilization: 0.5 }); // واقعي
printPlatformScenario({ ...baseScenario, utilization: 1.0 }); // أسوأ حالة

// scenarios للنمو
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  النمو (استهلاك 50% — اشتراك $10/شهر)');
console.log('═══════════════════════════════════════════════════════════════');

for (const n of [500, 1000, 2500, 5000, 10000]) {
  printPlatformScenario({ ...baseScenario, totalDoctors: n, utilization: 0.5 });
}

// مقارنة أسعار الاشتراك المختلفة
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  مقارنة أسعار الاشتراك (1000 طبيب — استهلاك 50%)');
console.log('═══════════════════════════════════════════════════════════════');

for (const price of [10, 15, 20, 25, 30]) {
  printPlatformScenario({ ...baseScenario, subscriptionUsd: price, utilization: 0.5 });
}

// تحليل break-even عند $10 — كم نسبة استهلاك تخلي التطبيق ربحان؟
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Break-even عند اشتراك $10/شهر — أي استهلاك يخلي التطبيق ربحان؟');
console.log('═══════════════════════════════════════════════════════════════');

for (const util of [0.1, 0.2, 0.3, 0.4, 0.5]) {
  printPlatformScenario({ ...baseScenario, utilization: util });
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  ملاحظات:');
console.log('  - الأرقام تقديرية بناءً على فحص الكود في 2026-05');
console.log('  - السعر مع thinking أغلى 8× من بدون thinking');
console.log('  - 4 ميزات بـ thinking: التحليل/التداخلات/الكلى/الحمل');
console.log('  - 2 ميزات بدون thinking: الإضافة السريعة/الترجمة');
console.log('  - cachingDiscount = 50% (الـ caching الموجود في الكود)');
console.log('  - المجاني لا يدفع، المدفوعون = برو + برو ماكس');
console.log('═══════════════════════════════════════════════════════════════\n');
