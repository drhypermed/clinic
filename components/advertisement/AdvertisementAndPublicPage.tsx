// ─────────────────────────────────────────────────────────────────────────────
// صفحة "الإعلان" للطبيب (AdvertisementAndPublicPage)
// ─────────────────────────────────────────────────────────────────────────────
// الصفحة دي بقت مخصصة فقط للإعلان التعريفي بالطبيب (DoctorAdvertisementPage)
// اللي هيظهر في الدليل العام للمرضى.
//
// ملحوظة: قسم "رابط الفورم العام للجمهور" (BookingSectionPublic) اتنقل لصفحة
// المواعيد فوق نموذج "حجز موعد" عشان مكانه الطبيعي هناك مع بقية أدوات الحجز،
// وده بيخلي صفحة الإعلان دي تركز على غرض واحد فقط.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { DoctorAdvertisementPage } from './doctor-advertisement/DoctorAdvertisementPage';
import type { DoctorAdvertisementPageProps } from './doctor-advertisement/types';

export const AdvertisementAndPublicPage: React.FC<DoctorAdvertisementPageProps> = ({
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
}) => {
  return (
    <div className="px-3 pt-5 pb-3 sm:px-5 sm:pt-6 sm:pb-4 space-y-3" dir="rtl">
      {/* صفحة الإعلان التعريفي بالطبيب */}
      <div className="dh-stagger-1"><DoctorAdvertisementPage
        doctorId={doctorId}
        doctorName={doctorName}
        doctorSpecialty={doctorSpecialty}
        profileImage={profileImage}
      /></div>
    </div>
  );
};
