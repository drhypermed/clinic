// ─────────────────────────────────────────────────────────────────────────────
// صفحة "الإعلان والحجز العام" للطبيب (AdvertisementAndPublicPage)
// ─────────────────────────────────────────────────────────────────────────────
// الصفحة دي فيها قسمين للطبيب في شاشة واحدة:
//   1) BookingSectionPublic: إعدادات فورم الحجز العام (اللي المرضى بيدخلوه)
//      - نسخ رابط الحجز العام
//      - إضافة/حذف مواعيد متاحة
//      - إعدادات عنوان الفورم وبيانات التواصل
//   2) DoctorAdvertisementPage: صفحة الإعلان التعريفي بالطبيب (اللي هتظهر
//      في الدليل العام للمرضى)
//
// السبب في الجمع: كلاهما جزء من "ظهور الطبيب للجمهور" — منطقياً مرتبطين.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BookingSectionPublic } from '../appointments/BookingSectionPublic';
import { DoctorAdvertisementPage } from './doctor-advertisement/DoctorAdvertisementPage';
import { useBookingSectionControls } from '../appointments/appointments-view/useBookingSectionControls';
import { toLocalDateStr } from '../appointments/utils';
import type { DoctorAdvertisementPageProps } from './doctor-advertisement/types';

interface AdvertisementAndPublicPageProps extends DoctorAdvertisementPageProps {
  bookingSecret: string | null;
  onBookingSecretReady?: (secret: string) => void;
}

export const AdvertisementAndPublicPage: React.FC<AdvertisementAndPublicPageProps> = ({
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
  bookingSecret,
  onBookingSecretReady,
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const currentDayStr = toLocalDateStr(new Date());

  const {
    publicBookingLink,
    publicSectionOpen,
    togglePublicSection,
    publicSlots,
    publicSlotDateStr,
    setPublicSlotDateStr,
    publicSlotTimeStr,
    setPublicSlotTimeStr,
    publicLinkCopied,
    copyPublicLink,
    publicSlotAdding,
    addPublicSlot,
    removePublicSlot,
    publicFormTitle,
    setPublicFormTitle,
    publicFormContactInfo,
    setPublicFormContactInfo,
    publicFormSaving,
    savePublicFormSettings,
    isPublicSettingsSaved,
    publicSlotTodayStr,
    publicTimeMin,
  } = useBookingSectionControls({
    userId,
    bookingSecret,
    onBookingSecretReady,
    currentDayStr,
  });

  return (
    <div className="px-3 pt-5 pb-3 sm:px-5 sm:pt-6 sm:pb-4 space-y-3" dir="rtl">
      {userId && (
        <div className="dh-stagger-1"><BookingSectionPublic
          publicBookingLink={publicBookingLink}
          isOpen={publicSectionOpen}
          onToggleOpen={togglePublicSection}
          publicLinkCopied={publicLinkCopied}
          onCopyPublicLink={copyPublicLink}
          publicFormTitle={publicFormTitle}
          onPublicFormTitleChange={setPublicFormTitle}
          publicFormContactInfo={publicFormContactInfo}
          onPublicFormContactInfoChange={setPublicFormContactInfo}
          publicFormSaving={publicFormSaving}
          onSavePublicFormSettings={savePublicFormSettings}
          isSaved={isPublicSettingsSaved}
          publicSlotDateStr={publicSlotDateStr}
          onPublicSlotDateStrChange={setPublicSlotDateStr}
          publicSlotTimeStr={publicSlotTimeStr}
          onPublicSlotTimeStrChange={setPublicSlotTimeStr}
          publicSlotTodayStr={publicSlotTodayStr}
          publicTimeMin={publicTimeMin}
          publicSlotAdding={publicSlotAdding}
          onAddPublicSlot={addPublicSlot}
          publicSlots={publicSlots}
          onRemovePublicSlot={removePublicSlot}
        /></div>
      )}
      <div className="dh-stagger-2"><DoctorAdvertisementPage
        doctorId={doctorId}
        doctorName={doctorName}
        doctorSpecialty={doctorSpecialty}
        profileImage={profileImage}
      /></div>
    </div>
  );
};
