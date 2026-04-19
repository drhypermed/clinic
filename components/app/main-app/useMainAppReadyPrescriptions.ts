// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة الروشتات الجاهزة في الواجهة الرئيسية (useMainAppReadyPrescriptions)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف الـ state الخاص بمودالات الروشتات الجاهزة:
//   • المودال اللي بيعرض قائمة الروشتات الجاهزة للاستدعاء
//   • مودال حفظ روشتة جديدة (عنوان افتراضي من التشخيص/الشكوى/اسم المريض)
//   • منطق التعامل مع smartQuotaModal (يقفل تلقائياً لو الأدمن طلع Quota modal)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

interface UseMainAppReadyPrescriptionsParams {
  /** يستخدم في توليد اسم افتراضي للروشتة عند الحفظ (التشخيص أولاً). */
  diagnosisEn: string;
  /** الاختيار الثاني لاسم الروشتة لو مفيش تشخيص. */
  complaintEn: string;
  /** الاختيار الأخير لاسم الروشتة: "روشتة {اسم المريض}". */
  patientName: string;
  /** الدالة اللي بتبعت الروشتة للحفظ — بترجع true لو نجح. */
  handleSaveReadyPrescription: (name: string) => Promise<boolean>;
  /** هل مودال تنبيه الـ Quota مفتوح (نقفل المودال بتاعنا لو فتح). */
  smartQuotaModalOpen: boolean;
}

export const useMainAppReadyPrescriptions = ({
  diagnosisEn,
  complaintEn,
  patientName,
  handleSaveReadyPrescription,
  smartQuotaModalOpen,
}: UseMainAppReadyPrescriptionsParams) => {
  const [showReadyPrescriptionsModal, setShowReadyPrescriptionsModal] = useState(false);
  const [showSaveReadyPrescriptionModal, setShowSaveReadyPrescriptionModal] = useState(false);
  const [readyPrescriptionName, setReadyPrescriptionName] = useState('');
  const [isSavingReadyPrescription, setIsSavingReadyPrescription] = useState(false);
  const [isClosingReadyPrescriptionModal, setIsClosingReadyPrescriptionModal] = useState(false);

  /**
   * فتح مودال حفظ الروشتة مع تسمية افتراضية ذكية:
   *   1) التشخيص (لو موجود) — الأكثر وصفاً
   *   2) الشكوى الرئيسية
   *   3) "روشتة {اسم المريض}"
   *   4) فاضي
   */
  const openSaveReadyPrescriptionModal = () => {
    const defaultName = diagnosisEn?.trim()
      || complaintEn?.trim()
      || (patientName ? `روشتة ${patientName}` : '');
    setReadyPrescriptionName(defaultName);
    setShowSaveReadyPrescriptionModal(true);
  };

  /** تأكيد الحفظ: يحفظ ويقفل المودال فقط لو الحفظ نجح. */
  const handleConfirmSaveReadyPrescription = async () => {
    if (isSavingReadyPrescription) return;
    setIsSavingReadyPrescription(true);
    const saved = await handleSaveReadyPrescription(readyPrescriptionName);
    setIsSavingReadyPrescription(false);
    if (saved) {
      setShowSaveReadyPrescriptionModal(false);
      setReadyPrescriptionName('');
    }
  };

  /**
   * لو ظهر مودال تحذير الـ Quota أثناء فتح مودال الحفظ، نقفل مودال الحفظ
   * بشكل متدرج (مع animation قفل) عشان الـ Quota modal يبقى في المقدمة.
   */
  useEffect(() => {
    if (smartQuotaModalOpen && showSaveReadyPrescriptionModal) {
      setIsClosingReadyPrescriptionModal(true);
      const timer = setTimeout(() => {
        setShowSaveReadyPrescriptionModal(false);
        setIsClosingReadyPrescriptionModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [smartQuotaModalOpen, showSaveReadyPrescriptionModal]);

  return {
    showReadyPrescriptionsModal,
    setShowReadyPrescriptionsModal,
    showSaveReadyPrescriptionModal,
    setShowSaveReadyPrescriptionModal,
    readyPrescriptionName,
    setReadyPrescriptionName,
    isSavingReadyPrescription,
    isClosingReadyPrescriptionModal,
    openSaveReadyPrescriptionModal,
    handleConfirmSaveReadyPrescription,
  };
};
