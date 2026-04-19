// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة العلامات الحيوية للسكرتارية (useMainAppSecretaryVitals)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف كل المنطق الخاص بتعريفات وقيم العلامات الحيوية اللي بتدخلها السكرتارية
// قبل ما المريض يدخل للطبيب. بيوفر:
//
//   • prescriptionSecretaryFieldDefinitions:
//     قائمة الحقول المكوّنة (العلامات الحيوية + المربعات المخصصة)
//
//   • appointmentSecretaryCustomValues + updateAppointmentSecretaryCustomValue:
//     قيم المربعات المخصصة للموعد الحالي (تُعدّل لحظياً في الروشتة)
//
//   • mapAppointmentSecretaryCustomValues:
//     تحويل قيم السكرتارية المحفوظة للمواعيد إلى القيم المعروضة
//
//   • handleSyncSecretaryVitalsVisibility:
//     مزامنة إعدادات ظهور/إخفاء العلامات مع Firestore (بـ booking secret)
//
// لما الموعد يتبدل، القيم المخصصة بترجع فاضية تلقائياً (effect داخلي).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ClinicAppointment,
  PrescriptionSettings,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../types';
import { firestoreService } from '../../../services/firestore';
import {
  buildSecretaryVitalFieldDefinitions,
  buildSecretaryVisibilityByFieldDefinitions,
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
  toSecretaryCustomFieldId,
} from '../../../utils/secretaryVitals';

interface UseMainAppSecretaryVitalsParams {
  userId: string;
  activeBranchId: string | null;
  bookingSecret: string | null;
  setBookingSecret: (secret: string) => void;
  /** إعدادات الروشتة — نجيب منها الـ vitals و customBoxes */
  prescriptionSettings: PrescriptionSettings | null | undefined;
  /** الموعد المفتوح حالياً — نستخدمه لريست القيم لما يتبدل */
  openedAppointmentContext: ClinicAppointment | null;
}

export const useMainAppSecretaryVitals = ({
  userId,
  activeBranchId,
  bookingSecret,
  setBookingSecret,
  prescriptionSettings,
  openedAppointmentContext,
}: UseMainAppSecretaryVitalsParams) => {
  // القيم المخصصة للموعد الحالي (مفاتيح = customBoxId، قيم = النص المدخل)
  const [appointmentSecretaryCustomValues, setAppointmentSecretaryCustomValues] = useState<Record<string, string>>({});

  // بناء تعريفات الحقول من إعدادات الروشتة (memoized عشان ما نعيدش الحساب بلا داعي)
  const prescriptionSecretaryFieldDefinitions = useMemo(
    () => buildSecretaryVitalFieldDefinitions(
      prescriptionSettings?.vitals,
      prescriptionSettings?.customBoxes,
    ),
    [prescriptionSettings?.customBoxes, prescriptionSettings?.vitals]
  );

  /** تحديث قيمة مربع مخصص — لو القيمة فاضية نحذف المفتاح بدل ما نخزن فاضي. */
  const updateAppointmentSecretaryCustomValue = useCallback((boxId: string, nextValue: string) => {
    const normalizedBoxId = String(boxId || '').trim();
    if (!normalizedBoxId) return;
    const normalizedValue = String(nextValue || '').trim();
    setAppointmentSecretaryCustomValues((prev) => {
      const next = { ...prev };
      if (normalizedValue) {
        next[normalizedBoxId] = normalizedValue;
      } else {
        delete next[normalizedBoxId];
      }
      return next;
    });
  }, []);

  /**
   * تحويل قيم السكرتارية المحفوظة (اللي جاية من بيانات الموعد) لشكل
   * { boxId: value }. المفاتيح ممكن تكون بأشكال مختلفة من الإصدارات القديمة،
   * فبنجرب ثلاث أشكال ممكنة.
   */
  const mapAppointmentSecretaryCustomValues = useCallback(
    (secretaryVitals: ClinicAppointment['secretaryVitals'] | undefined): Record<string, string> => {
      const source = secretaryVitals || {};
      const result: Record<string, string> = {};
      const configuredBoxes = Array.isArray(prescriptionSettings?.customBoxes)
        ? prescriptionSettings.customBoxes
        : [];

      configuredBoxes.forEach((box) => {
        const boxId = String(box?.id || '').trim();
        if (!boxId) return;
        const fieldId = toSecretaryCustomFieldId(boxId);
        // ترتيب المحاولات: custom:X → X → X بدون prefix
        const rawValue =
          source[fieldId]
          ?? source[boxId]
          ?? source[String(fieldId || '').replace(/^custom:/, '')];
        const normalizedValue = String(rawValue || '').trim();
        if (normalizedValue) {
          result[boxId] = normalizedValue;
        }
      });

      return result;
    },
    [prescriptionSettings?.customBoxes]
  );

  // لما الموعد يتقفل، نفرغ القيم المحلية
  useEffect(() => {
    if (openedAppointmentContext) return;
    setAppointmentSecretaryCustomValues({});
  }, [openedAppointmentContext]);

  /**
   * مزامنة إعدادات ظهور/إخفاء العلامات الحيوية مع Firestore لاستخدامها
   * في فورم السكرتارية. يضمن وجود booking secret قبل الحفظ.
   */
  const handleSyncSecretaryVitalsVisibility = useCallback(
    async (
      visibility: SecretaryVitalsVisibility,
      fields: SecretaryVitalFieldDefinition[],
      resolvedSecret?: string
    ) => {
      if (!userId) return;

      const normalizedFields = normalizeSecretaryVitalFieldDefinitions(
        fields,
        prescriptionSecretaryFieldDefinitions
      );
      const normalizedVisibility = buildSecretaryVisibilityByFieldDefinitions(
        normalizedFields,
        normalizeSecretaryVitalsVisibility(visibility)
      );

      // لو مفيش secret، نولد واحد جديد ونخزنه
      let secretToSync = String(resolvedSecret || bookingSecret || '').trim();
      if (!secretToSync) {
        secretToSync = await firestoreService.getOrCreateBookingSecret(userId);
        setBookingSecret(secretToSync);
      }

      await firestoreService.setBookingSecretaryVitalsVisibility(
        userId,
        secretToSync,
        normalizedVisibility,
        normalizedFields,
        activeBranchId,
      );
    },
    [
      activeBranchId,
      bookingSecret,
      prescriptionSecretaryFieldDefinitions,
      setBookingSecret,
      userId,
    ]
  );

  return {
    prescriptionSecretaryFieldDefinitions,
    appointmentSecretaryCustomValues,
    setAppointmentSecretaryCustomValues,
    updateAppointmentSecretaryCustomValue,
    mapAppointmentSecretaryCustomValues,
    handleSyncSecretaryVitalsVisibility,
  };
};
