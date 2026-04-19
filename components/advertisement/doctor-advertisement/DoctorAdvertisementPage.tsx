/**
 * صفحة إدارة إعلان الطبيب (Doctor Advertisement Management Page):
 * الواجهة المركزية التي تتيح للطبيب بناء ملفه الشخصي العام الذي سيظهر في دليل الأطباء.
 * تنظم الصفحة من خلال أقسام (Header, Info, Contact, Pricing, Schedule, Images) لسهولة الإدارة.
 */
import React from 'react';

import { DAYS_OF_WEEK, GOVERNORATES } from '../constants';
import { LivePreviewModal } from './LivePreviewModal';
import { ImageCropModal } from './ImageCropModal';
import { DoctorAdHeader } from './DoctorAdHeader';
import { DoctorAdPreviewButton } from './DoctorAdPreviewButton';
import { DoctorAdInfoSection } from './DoctorAdInfoSection';
import { DoctorAdContactSection } from './DoctorAdContactSection';
import { DoctorAdPricingServicesSection } from './DoctorAdPricingServicesSection';
import { DoctorAdScheduleSection } from './DoctorAdScheduleSection';
import { DoctorAdImagesSection } from './DoctorAdImagesSection';
import { DoctorAdActionsBar } from './DoctorAdActionsBar';
import { createSocialId, formatTimeWithPeriod, isCustomCityValue, normalizeScheduleRows, toNumber } from './utils';
import { useDoctorAdvertisementController } from './useDoctorAdvertisementController';
import type { DoctorAdvertisementPageProps } from '../../../types';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';

export const DoctorAdvertisementPage: React.FC<DoctorAdvertisementPageProps> = (props) => {
  const {
    loading,
    saving,
    message,
    error,
    showPreview,
    setShowPreview,
    profileImage,
    adDoctorName,
    setAdDoctorName,
    doctorSpecialty,
    academicDegree,
    setAcademicDegree,
    yearsExperience,
    setYearsExperience,
    subSpecialties,
    setSubSpecialties,
    featuredServicesSummary,
    setFeaturedServicesSummary,
    workplace,
    setWorkplace,
    extraInfo,
    setExtraInfo,
    governorate,
    setGovernorate,
    city,
    setCity,
    otherCity,
    setOtherCity,
    addressDetails,
    setAddressDetails,
    contactPhone,
    setContactPhone,
    whatsapp,
    setWhatsapp,
    socialLinks,
    setSocialLinks,
    cityOptions,
    examinationPrice,
    setExaminationPrice,
    discountedExaminationPrice,
    setDiscountedExaminationPrice,
    consultationPrice,
    setConsultationPrice,
    discountedConsultationPrice,
    setDiscountedConsultationPrice,
    clinicServices,
    updateClinicService,
    addClinicServiceRow,
    removeClinicService,
    clinicSchedule,
    newScheduleDay,
    setNewScheduleDay,
    newScheduleFrom,
    setNewScheduleFrom,
    newScheduleTo,
    setNewScheduleTo,
    newScheduleNotes,
    setNewScheduleNotes,
    addScheduleRow,
    removeScheduleRow,
    imageUrls,
    deletingImageIndex,
    addImageFromFile,
    removeImage,
    pendingCropImage,
    crop,
    zoom,
    cropAspect,
    uploadingImage,
    setCrop,
    setZoom,
    onCropComplete,
    handleCancelCrop,
    handleSaveCroppedImage,
    handleSaveOriginalImage,
    previewData,
    isPublished,
    saveAd,
  } = useDoctorAdvertisementController(props);

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل بيانات الإعلان" />;
  }

  return (
    <div className="space-y-5" dir="rtl">
      {message && (
        <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-emerald-600/95 text-white rounded-2xl border border-emerald-300 shadow-2xl px-5 py-4 text-center font-black">
            {message}
          </div>
        </div>
      )}

      <DoctorAdHeader adDoctorName={adDoctorName} doctorSpecialty={doctorSpecialty} academicDegree={academicDegree} />
      <DoctorAdPreviewButton onClick={() => setShowPreview(true)} />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 font-bold">{error}</div>}

      <DoctorAdInfoSection
        adDoctorName={adDoctorName}
        yearsExperience={yearsExperience}
        academicDegree={academicDegree}
        subSpecialties={subSpecialties}
        featuredServicesSummary={featuredServicesSummary}
        workplace={workplace}
        extraInfo={extraInfo}
        onDoctorNameChange={setAdDoctorName}
        onYearsExperienceChange={setYearsExperience}
        onAcademicDegreeChange={setAcademicDegree}
        onSubSpecialtiesChange={setSubSpecialties}
        onFeaturedServicesSummaryChange={setFeaturedServicesSummary}
        onWorkplaceChange={setWorkplace}
        onExtraInfoChange={setExtraInfo}
      />

      <DoctorAdContactSection
        governorate={governorate}
        city={city}
        otherCity={otherCity}
        addressDetails={addressDetails}
        contactPhone={contactPhone}
        whatsapp={whatsapp}
        socialLinks={socialLinks}
        governorates={GOVERNORATES}
        cityOptions={cityOptions}
        isCustomCityValue={isCustomCityValue}
        onGovernorateChange={(value) => {
          setGovernorate(value);
          setCity('');
          setOtherCity('');
        }}
        onCityChange={setCity}
        onOtherCityChange={setOtherCity}
        onAddressDetailsChange={setAddressDetails}
        onContactPhoneChange={setContactPhone}
        onWhatsappChange={setWhatsapp}
        onSocialPlatformChange={(id, value) => {
          setSocialLinks((prev) => prev.map((item) => (item.id === id ? { ...item, platform: value } : item)));
        }}
        onSocialUrlChange={(id, value) => {
          setSocialLinks((prev) => prev.map((item) => (item.id === id ? { ...item, url: value } : item)));
        }}
        onSocialRemove={(id) => {
          setSocialLinks((prev) => prev.filter((item) => item.id !== id));
        }}
        onSocialAdd={() => {
          setSocialLinks((prev) => [...prev, { id: createSocialId(), platform: '', url: '' }]);
        }}
      />

      <DoctorAdPricingServicesSection
        examinationPrice={examinationPrice}
        discountedExaminationPrice={discountedExaminationPrice}
        consultationPrice={consultationPrice}
        discountedConsultationPrice={discountedConsultationPrice}
        clinicServices={clinicServices}
        onExaminationPriceChange={setExaminationPrice}
        onDiscountedExaminationPriceChange={setDiscountedExaminationPrice}
        onConsultationPriceChange={setConsultationPrice}
        onDiscountedConsultationPriceChange={setDiscountedConsultationPrice}
        onServiceNameChange={(serviceId, value) => updateClinicService(serviceId, { name: value })}
        onServicePriceChange={(serviceId, value) => updateClinicService(serviceId, { price: toNumber(value) })}
        onServiceDiscountedPriceChange={(serviceId, value) => updateClinicService(serviceId, { discountedPrice: toNumber(value) })}
        onRemoveService={removeClinicService}
        onAddService={addClinicServiceRow}
      />

      <DoctorAdScheduleSection
        clinicSchedule={clinicSchedule}
        newScheduleDay={newScheduleDay}
        newScheduleFrom={newScheduleFrom}
        newScheduleTo={newScheduleTo}
        newScheduleNotes={newScheduleNotes}
        daysOfWeek={DAYS_OF_WEEK}
        formatTimeWithPeriod={formatTimeWithPeriod}
        onNewScheduleDayChange={setNewScheduleDay}
        onNewScheduleFromChange={setNewScheduleFrom}
        onNewScheduleToChange={setNewScheduleTo}
        onNewScheduleNotesChange={setNewScheduleNotes}
        onAddScheduleRow={addScheduleRow}
        onRemoveScheduleRow={removeScheduleRow}
      />

      <DoctorAdImagesSection
        imageUrls={imageUrls}
        deletingImageIndex={deletingImageIndex}
        onAddImageFromFile={addImageFromFile}
        onRemoveImage={removeImage}
      />

      <LivePreviewModal
        showPreview={showPreview}
        onClose={() => setShowPreview(false)}
        profileImage={profileImage}
        previewData={previewData}
        imageUrls={imageUrls}
        normalizeScheduleRows={normalizeScheduleRows}
      />

      <ImageCropModal
        pendingCropImage={pendingCropImage}
        crop={crop}
        zoom={zoom}
        aspect={cropAspect}
        uploading={uploadingImage}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        onCancel={handleCancelCrop}
        onSaveEdited={handleSaveCroppedImage}
        onSaveOriginal={handleSaveOriginalImage}
      />

      <DoctorAdActionsBar
        saving={saving}
        isPublished={isPublished}
        onSaveDraft={() => {
          void saveAd(false);
        }}
        onPublish={() => {
          void saveAd(true);
        }}
      />
    </div>
  );
};
