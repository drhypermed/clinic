import React from 'react';
import { createPortal } from 'react-dom';
import { DoctorProfileModal } from '../modals/DoctorProfileModal';
import { ReadyPrescriptionsModal } from '../prescription/ReadyPrescriptionsModal';
import { SaveReadyPrescriptionModal } from './SaveReadyPrescriptionModal';
import { SecretaryEntryNotification } from '../appointments/SecretaryEntryNotification';
import { NewAppointmentToast } from '../appointments/NewAppointmentToast';
import { SmartQuotaNoticeModal } from './SmartQuotaNoticeModal';
import type { NewAppointmentToastData, SecretaryEntryRequestData } from './hooks/useMainAppAppointments';
import type { PrescriptionItem, ReadyPrescription } from '../../types';

/**
 * مكون الطبقات العائمة للتطبيق (Main App Overlays Component)
 * هذا المكون هو المسؤول عن عرض جميع المكونات التي تظهر فوق الواجهة الرئيسية (Modals, Toasts, Portals).
 * بدلاً من وضع كافة الـ Modals داخل الكود المباشر لـ MainApp، تم تجميعها هنا لتحسين تنظيم الملفات وتسهيل الصيانة.
 */

interface MainAppOverlaysProps {
  user: any;
  // الملف الشخصي
  showProfileModal: boolean;
  setShowProfileModal: (open: boolean) => void;
  doctorName: string;
  doctorSpecialty: string;
  profileImage?: string;
  onNameUpdate: (name: string) => Promise<void>;
  onSpecialtyUpdate: (specialty: string) => Promise<void>;
  onProfileImageUpdate: (base64: string) => Promise<void>;
  // الروشتات الجاهزة
  showReadyPrescriptionsModal: boolean;
  setShowReadyPrescriptionsModal: (open: boolean) => void;
  readyPrescriptions: ReadyPrescription[];
  handleApplyReadyPrescription: (preset: ReadyPrescription, e?: React.MouseEvent<any>, options?: { medicationsMode?: 'merge' | 'replace'; adviceMode?: 'merge' | 'replace'; labsMode?: 'merge' | 'replace' }) => void;
  handleUpdateReadyPrescription: (id: string, payload: { name: string; rxItems: PrescriptionItem[]; generalAdvice: string[]; labInvestigations: string[] }) => Promise<boolean>;
  handleCreateReadyPrescription: (payload: { name: string; rxItems: PrescriptionItem[]; generalAdvice: string[]; labInvestigations: string[] }) => Promise<boolean>;
  handleDeleteReadyPrescription: (id: string) => Promise<boolean>;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
  // حفظ الروشتة الجاهزة
  showSaveReadyPrescriptionModal: boolean;
  isClosingReadyPrescriptionModal: boolean;
  isSavingReadyPrescription: boolean;
  readyPrescriptionName: string;
  setReadyPrescriptionName: (name: string) => void;
  setShowSaveReadyPrescriptionModal: (open: boolean) => void;
  handleConfirmSaveReadyPrescription: () => void;
  // أخطاء وتنبيهات
  settingsError: string | null;
  secretaryEntryRequest: SecretaryEntryRequestData | null;
  bookingSecret: string | null;
  onApproveSecretaryEntry: () => Promise<void>;
  onRejectSecretaryEntry: () => Promise<void>;
  newAppointmentToast: NewAppointmentToastData | null;
  setNewAppointmentToast: (value: NewAppointmentToastData | null) => void;
  smartQuotaModalOpen: boolean;
  smartQuotaNotice: { message: string; whatsappNumber?: string; whatsappUrl?: string } | null;
  dismissSmartQuotaNotice: () => void;
}

export const MainAppOverlays: React.FC<MainAppOverlaysProps> = ({
  user, showProfileModal, setShowProfileModal, doctorName, doctorSpecialty, profileImage, onNameUpdate, onSpecialtyUpdate, onProfileImageUpdate,
  showReadyPrescriptionsModal, setShowReadyPrescriptionsModal, readyPrescriptions, handleApplyReadyPrescription, handleUpdateReadyPrescription, handleCreateReadyPrescription, handleDeleteReadyPrescription, rxItems, generalAdvice, labInvestigations,
  showSaveReadyPrescriptionModal, isClosingReadyPrescriptionModal, isSavingReadyPrescription, readyPrescriptionName, setReadyPrescriptionName, setShowSaveReadyPrescriptionModal, handleConfirmSaveReadyPrescription,
  settingsError, secretaryEntryRequest, bookingSecret, onApproveSecretaryEntry, onRejectSecretaryEntry, newAppointmentToast, setNewAppointmentToast, smartQuotaModalOpen, smartQuotaNotice, dismissSmartQuotaNotice,
}) => {
  return (
    <>
      {/* 1. نافذة الملف الشخصي للطبيب */}
      {user && createPortal(
        <DoctorProfileModal
          isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}
          userId={user.uid} currentName={doctorName} currentSpecialty={doctorSpecialty}
          currentWhatsApp="" currentEmail={user.email || ''} currentProfileImage={profileImage}
          onNameUpdate={onNameUpdate} onSpecialtyUpdate={onSpecialtyUpdate} onProfileImageUpdate={onProfileImageUpdate}
        />,
        document.body
      )}

      {/* 2. نافذة اختيار وإدارة الروشتات الجاهزة */}
      {createPortal(
        <ReadyPrescriptionsModal
          isOpen={showReadyPrescriptionsModal} onClose={() => setShowReadyPrescriptionsModal(false)}
          presets={readyPrescriptions}
          onApply={(preset, options) => {
            handleApplyReadyPrescription(preset, undefined, options);
            setShowReadyPrescriptionsModal(false);
          }}
          onUpdate={handleUpdateReadyPrescription} onCreate={handleCreateReadyPrescription} onDelete={handleDeleteReadyPrescription}
          currentRxItems={rxItems} currentGeneralAdvice={generalAdvice} currentLabInvestigations={labInvestigations}
        />,
        document.body
      )}

      {/* 3. نافذة حفظ الروشتة الحالية كروشتة جاهزة جديدة */}
      {createPortal(
        <SaveReadyPrescriptionModal
          isOpen={showSaveReadyPrescriptionModal} isClosing={isClosingReadyPrescriptionModal} isSaving={isSavingReadyPrescription}
          readyPrescriptionName={readyPrescriptionName} onNameChange={setReadyPrescriptionName}
          onClose={() => setShowSaveReadyPrescriptionModal(false)} onConfirm={handleConfirmSaveReadyPrescription}
        />,
        document.body
      )}

      {/* 4. تنبيه خطأ تحميل الإعدادات من السحابة */}
      {settingsError && (
        <div className="fixed bottom-4 left-4 z-50 bg-red-50 border-l-4 border-red-700 p-4 rounded shadow-lg max-w-md" dir="ltr">
          <p className="font-bold">Settings Load Error:</p>
          <p>{settingsError}</p>
        </div>
      )}

      {/* 5. تنبيهات السكرتارية (Portals) - تظهر عند طلب السكرتارية الدخول للنظام */}
      {secretaryEntryRequest && bookingSecret && createPortal(
        <SecretaryEntryNotification request={secretaryEntryRequest} onApprove={onApproveSecretaryEntry} onReject={onRejectSecretaryEntry} />,
        document.body
      )}

      {/* 6. تنبيه حجز موعد جديد */}
      {newAppointmentToast && createPortal(
        <NewAppointmentToast toast={newAppointmentToast} onClose={() => setNewAppointmentToast(null)} />,
        document.body
      )}

      {/* 7. نافذة تنبيه "نفاذ رصيد الذكاء الاصطناعي" (Quota Notice) */}
      {createPortal(
        <SmartQuotaNoticeModal notice={smartQuotaModalOpen ? smartQuotaNotice : null} onClose={dismissSmartQuotaNotice} />,
        document.body
      )}
    </>
  );
};
