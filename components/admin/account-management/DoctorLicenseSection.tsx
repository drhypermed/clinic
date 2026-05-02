// ─────────────────────────────────────────────────────────────────────────────
// قسم صورة الترخيص داخل بطاقة الطبيب (DoctorLicenseSection)
// ─────────────────────────────────────────────────────────────────────────────
// المسؤولية:
//   1. عرض صورة الترخيص لو موجوده في Firestore (المسار العادي للحسابات الجديدة).
//   2. لو الحقل verificationDocUrl فاضي، نحاول استرداد الصورة من Storage تلقائياً
//      (للحسابات القديمة اللي ضاع لها الـURL لأي سبب).
//   3. عرض الحالات الثلاث: الصورة، حالة البحث، عدم وجود.
//
// تم فصلها عن DoctorAccountCard عشان تظل ملف الكارت تحت 500 سطر،
// والمنطق ده مستقل وقابل لإعادة الاستخدام لو احتجناه في شاشه أخرى.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaFileLines, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';
import { findDoctorLicenseInStorage, persistRecoveredLicenseUrl } from './findDoctorLicenseInStorage';

interface DoctorLicenseSectionProps {
  doctorId: string;
  /** الـURL المحفوظ في Firestore — لو فاضي بنحاول الاسترداد. */
  firestoreLicenseUrl?: string;
  /** هل الكارت متفتح؟ — البحث ما يبدأش غير لو الكارت متفتح (cost-saving). */
  isExpanded: boolean;
}

export const DoctorLicenseSection: React.FC<DoctorLicenseSectionProps> = ({
  doctorId,
  firestoreLicenseUrl,
  isExpanded,
}) => {
  // ── حالة الاسترداد من Storage ──
  // recoveredLicenseUrl: الـURL اللي لقيناه في Storage (لو لقينا)
  // isRecovering: شغّال البحث حالياً
  // recoveryAttempted: هل حاولنا قبل كده — يمنع تكرار البحث في نفس الجلسه
  const [recoveredLicenseUrl, setRecoveredLicenseUrl] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  useEffect(() => {
    // شروط التشغيل: الكارت متفتح + مفيش URL في Firestore + ما حاولناش قبل كده
    if (!isExpanded) return;
    if (firestoreLicenseUrl) return;
    if (recoveryAttempted) return;

    let cancelled = false;
    setIsRecovering(true);
    setRecoveryAttempted(true);

    findDoctorLicenseInStorage(doctorId)
      .then((url) => {
        if (cancelled) return;
        if (url) {
          setRecoveredLicenseUrl(url);
          // إصلاح دائم: نحفظ الرابط في Firestore عشان المرة الجاية فورية
          void persistRecoveredLicenseUrl(doctorId, url);
        }
      })
      .finally(() => {
        if (!cancelled) setIsRecovering(false);
      });

    return () => { cancelled = true; };
  }, [isExpanded, doctorId, firestoreLicenseUrl, recoveryAttempted]);

  // الرابط النهائي اللي بنعرضه — Firestore لو موجود، أو الـStorage الـrecovery
  const effectiveUrl = firestoreLicenseUrl || recoveredLicenseUrl;
  // علامة بصرية لو الصورة جت من الاسترداد (للشفافية مع الأدمن)
  const isRecovered = !firestoreLicenseUrl && Boolean(recoveredLicenseUrl);

  // الصورة موجودة (من Firestore أو من Storage) — اعرضها كلينك يفتح كاملة
  if (effectiveUrl) {
    return (
      <a
        href={effectiveUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3 transition hover:bg-brand-100/80 hover:shadow-sm sm:flex-row sm:items-center"
      >
        {/* تصميم متجاوب: */}
        {/*   • موبايل (<640px): الصورة بعرض الكارت كامل + ارتفاع 160px مع object-contain */}
        {/*     — الأدمن يشوف المستند كله بدون ضغط، والتسمية تنزل تحتها. */}
        {/*   • شاشات أكبر (≥640px): مصغّرة 80×80 + تسمية + سهم. */}
        <img
          src={effectiveUrl}
          alt="الكارنيه أو الترخيص"
          loading="lazy"
          className="h-40 w-full shrink-0 rounded-lg border border-brand-200 bg-white object-contain sm:h-20 sm:w-20 sm:object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-black text-brand-700">
            <FaFileLines className="w-3.5 h-3.5 shrink-0" /> صورة الترخيص
            {isRecovered && (
              <span className="rounded-full border border-success-200 bg-success-50 px-1.5 py-0.5 text-[9px] font-black text-success-700">
                مُسترَدّة
              </span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-brand-500">
            اضغط لفتح المستند بحجم كامل في نافذة جديدة
          </p>
        </div>
        {/* السهم: يبان فقط على شاشات ≥640px لأن الموبايل الصورة فوق والنص تحت */}
        <FaArrowLeft className="hidden w-3.5 h-3.5 shrink-0 text-brand-400 transition-transform group-hover:-translate-x-1 sm:block" />
      </a>
    );
  }

  // حالة البحث — مفيش URL في Firestore والاسترداد من Storage جاري
  if (isRecovering) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
        <FaSpinner className="w-3.5 h-3.5 shrink-0 animate-spin text-slate-500" />
        <span className="text-xs font-bold text-slate-600">جاري البحث عن صورة الترخيص في الأرشيف…</span>
      </div>
    );
  }

  // لا في Firestore ولا في Storage — صورة فعلاً غير موجودة
  return (
    <div className="flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50/60 px-3 py-2.5 sm:items-center">
      <FaTriangleExclamation className="mt-0.5 w-3.5 h-3.5 shrink-0 text-warning-500 sm:mt-0" />
      <span className="text-xs font-bold leading-relaxed text-warning-700">
        لا توجد صورة ترخيص لهذا الحساب — سيُطلب من الطبيب رفعها عند تسجيل دخوله القادم.
      </span>
    </div>
  );
};
