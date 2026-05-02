// ─────────────────────────────────────────────────────────────────────────────
// AdminAccessToggle — زر الطبيب للسماح/المنع للأدمن من تعديل شاشاته
// ─────────────────────────────────────────────────────────────────────────────
// زرّان في تطبيق الطبيب:
//   • داخل تبويب "إعدادات الطباعه" — لتصميم الروشته (`allowAdminPrescriptionEdit`)
//   • داخل صفحه الإعلان — لتصميم الإعلان (`allowAdminAdEdit`)
//
// الافتراضي: مفتوح (الأدمن مسموحله يساعد). الطبيب يقدر يقفله بضغطه واحده.
// قيمة الحقل في `users/{uid}`: undefined أو true = مفتوح، false = مقفول.
//
// قواعد Firestore بترفض كتابه الأدمن لو الحقل false — فالقفل حقيقي مش UI فقط.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';

// الحقل اللي بيتحكّم فيه — الكومبوننت بيستعمل واحد منهم حسب الشاشه.
type AdminAccessField = 'allowAdminPrescriptionEdit' | 'allowAdminAdEdit';

interface AdminAccessToggleProps {
  // الحقل المستهدَف على مستند الطبيب (بيتحدد حسب الشاشة)
  field: AdminAccessField;
  // عنوان للزر (شرح بسيط للطبيب)
  title: string;
  // وصف صغير تحت العنوان
  description: string;
}

export const AdminAccessToggle: React.FC<AdminAccessToggleProps> = ({
  field,
  title,
  description,
}) => {
  // الحالة الحالية (مفتوح/مقفول) + علامة جاري التحميل/الحفظ
  const [enabled, setEnabled] = useState<boolean>(true); // الافتراضي مفتوح حتى يتحمّل الواقع
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    // قراءه الحاله الحاليه — مرّه واحده عند فتح الصفحه (مش subscription
    // لأن الطبيب نفسه هو اللي بيغيّرها من نفس الجهاز عاده)
    getDoc(doc(db, 'users', userId))
      .then((snap) => {
        if (cancelled) return;
        const value = snap.exists() ? (snap.data() as Record<string, unknown>)[field] : undefined;
        // undefined = الافتراضي (مفتوح). false = مقفول. أي حاجه تانيه = مفتوح.
        setEnabled(value !== false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[AdminAccessToggle] read failed:', err);
        // فشل القراءه — نخلّي الزر مفتوح (لأنه الافتراضي)
        setEnabled(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, field]);

  const handleToggle = async () => {
    if (!userId || saving) return;
    const next = !enabled;
    setSaving(true);
    setError(null);
    // تفاؤل: نعدّل الحاله محلّياً قبل الحفظ — لو فشل الحفظ، نرجّع.
    setEnabled(next);
    try {
      // merge:true عشان مانكتبش الحقول التانيه. الحقول المحميّه
      // (accountType / verificationStatus / إلخ) مش بتتغير لأننا
      // بنكتب حقل واحد بس، فالـrule `doesNotChangeProtectedUserFields`
      // بتعدّي.
      await setDoc(doc(db, 'users', userId), { [field]: next }, { merge: true });
    } catch (err) {
      console.error('[AdminAccessToggle] save failed:', err);
      setEnabled(!next); // رجوع للحالة السابقة
      setError('تعذّر الحفظ — حاول مرة تانية');
    } finally {
      setSaving(false);
    }
  };

  if (!userId) return null;

  // ألوان الحالة: أخضر فاتح لمّا مفتوح، رمادي لمّا مقفول
  const stateLabel = enabled ? 'مسموح' : 'مقفول';
  const stateColor = enabled
    ? 'bg-success-100 text-success-800 border-success-300'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 my-4"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">{description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${stateColor} whitespace-nowrap`}>
          {stateLabel}
        </span>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading || saving}
        className={`mt-2 w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled
            ? 'bg-slate-700 text-white hover:bg-slate-800'
            : 'bg-success-600 text-white hover:bg-success-700'
        }`}
      >
        {loading
          ? 'جاري التحميل...'
          : saving
            ? 'جاري الحفظ...'
            : enabled
              ? 'منع الإدارة من التعديل'
              : 'السماح للإدارة بالتعديل'}
      </button>

      {error && (
        <p className="mt-2 text-xs text-danger-700 font-bold">{error}</p>
      )}
    </div>
  );
};
