// ─────────────────────────────────────────────────────────────────────────────
// AdminPrescriptionEditFrame — الأدمن يعدّل تصميم روشتة طبيب معين
// ─────────────────────────────────────────────────────────────────────────────
// الفكرة: بنعيد استخدام نفس مكوّن `PrescriptionSettingsPage` اللي الطبيب
// بيستعمله — بس بنحمّل ونحفظ في مستند الطبيب المستهدف بدل مستند الأدمن.
// كده الأدمن بيشوف نفس الواجهة بالظبط من غير تكرار كود.
//
// تعدد الفروع: لو الطبيب عنده أكتر من فرع، الأدمن بيختار فرع من dropdown
// قبل ما يبدأ التعديل. كل فرع له تصميم روشتته الخاص (المستندات
// `prescription` للفرع الرئيسي، `prescription-{branchId}` للفروع التانية).
//
// قواعد Firestore بتسمح للأدمن بقراءة الفروع + كتابة مستندات تصميم الروشتة فقط
// — مش هيقدر يدخل على ملفات المرضى أو التقارير المالية.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { PrescriptionSettingsPage } from '../../prescription-settings';
import { prescriptionSettingsService } from '../../../services/prescriptionSettingsService';
import type { PrescriptionSettings } from '../../../types';
import { LoadingText } from '../../ui/LoadingText';
import type { DoctorBranchOption } from './useResolveDoctorByEmail';

interface AdminPrescriptionEditFrameProps {
  // الطبيب المستهدف (UID + اسم للعرض في الترويسه)
  targetUserId: string;
  targetDoctorName: string;
  targetDoctorEmail: string;
  // قائمة فروع الطبيب — الأدمن بيختار فرع لتعديل تصميم روشتته
  branches: DoctorBranchOption[];
  // الرجوع لقائمة الاختيار (تصميم/إعلان)
  onBack: () => void;
}

// تحويل branch id لـ branchId المُمرّر للـservice. الـservice بيستعمل
// undefined للفرع الرئيسي ('main') عشان مفتاح المستند يبقى 'prescription'
// مش 'prescription-main' (توافق مع البيانات القديمة).
const toServiceBranchId = (branchId: string): string | undefined => {
  return branchId === 'main' ? undefined : branchId;
};

export const AdminPrescriptionEditFrame: React.FC<AdminPrescriptionEditFrameProps> = ({
  targetUserId,
  targetDoctorName,
  targetDoctorEmail,
  branches,
  onBack,
}) => {
  // الفرع المختار حالياً — افتراضياً أول فرع (دايماً الفرع الرئيسي بعد الـsort)
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id || 'main',
  );
  // إعدادات الروشتة الخاصة بالطبيب + الفرع المستهدف
  const [settings, setSettings] = useState<PrescriptionSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // تحميل الإعدادات لمّا يتغيّر الطبيب أو الفرع
  useEffect(() => {
    let cancelled = false;
    setSettings(null);
    setLoadError(null);

    prescriptionSettingsService
      .getSettings(targetUserId, toServiceBranchId(selectedBranchId))
      .then((loaded) => {
        if (cancelled) return;
        setSettings(loaded);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[AdminPrescriptionEditFrame] load failed:', err);
        setLoadError('تعذّر تحميل تصميم الروشتة لهذا الطبيب');
      });

    return () => { cancelled = true; };
  }, [targetUserId, selectedBranchId]);

  // الحفظ: بيكتب في المستند الخاص بالفرع المختار
  // قواعد Firestore بتتأكد إن الأدمن مسموحله يكتب في prescription* فقط
  // وإن الطبيب ميكونش قافل إذن المساعدة
  const handleSave = async (next: PrescriptionSettings) => {
    await prescriptionSettingsService.saveSettings(
      targetUserId,
      next,
      toServiceBranchId(selectedBranchId),
    );
  };

  if (loadError) {
    return (
      <div className="rounded-2xl border border-danger-300 bg-danger-50 p-4 text-danger-700" dir="rtl">
        <p className="font-bold">{loadError}</p>
        <p className="text-sm mt-2">
          يمكن إن الطبيب قفل إذن مساعدة الإدارة في تصميم روشتته. اطلب منه يفعّل الزر من تبويب "إعدادات الطباعة" داخل صفحة تصميم الروشتة.
        </p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 rounded-lg bg-danger-600 text-white font-bold"
        >
          رجوع
        </button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6" dir="rtl">
        <LoadingText>جاري تحميل تصميم الروشتة</LoadingText>
      </div>
    );
  }

  // فيه أكتر من فرع؟ نعرض dropdown اختيار الفرع
  const showBranchSelector = branches.length > 1;

  return (
    <div dir="rtl">
      {/* شريط تعريفي + اختيار الفرع + زر رجوع */}
      <div className="mb-3 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-warning-800">
            تعدّل الآن تصميم روشتة الطبيب: <span className="text-warning-900">{targetDoctorName || targetDoctorEmail}</span>
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800 whitespace-nowrap"
          >
            رجوع
          </button>
        </div>

        {showBranchSelector && (
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-bold text-warning-800 whitespace-nowrap">
              الفرع:
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="rounded-lg border border-warning-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-warning-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <span className="text-xs text-warning-700">
              (كل فرع له تصميم روشتة مستقل)
            </span>
          </div>
        )}
      </div>

      {/* key=selectedBranchId مهم: تبديل الفرع بيعمل remount كامل، فالـlocalSettings
          داخل usePrescriptionSettingsForm بتبدأ من البيانات الصحيحه للفرع الجديد.
          من غير الـkey ده، لو الأدمن عنده تعديلات في فرع وبدّل لفرع تاني، ممكن
          الـedits القديمه تتكتب بالغلط في المستند بتاع الفرع الجديد. */}
      <PrescriptionSettingsPage
        key={selectedBranchId}
        settings={settings}
        onSave={handleSave}
        isAdminImpersonation
      />
    </div>
  );
};
