/**
 * صفحة إدارة إعلان الطبيب (Doctor Advertisement Management Page):
 * - الحقول العامة عن الطبيب (اسم، درجة علمية، تخصصات دقيقة، خدمات، معلومات).
 * - فروع العيادة (حتى 5 فروع) — كل فرع بعنوانه ومواعيده وأسعاره وخدماته وصوره.
 * - روابط السوشيال (عالمية لكل الفروع).
 * - حفظ كمسودة / نشر / معاينة.
 */
import React from 'react';

import { LivePreviewModal } from './LivePreviewModal';
import { ImageCropModal } from './ImageCropModal';
import { DoctorAdHeader } from './DoctorAdHeader';
import { DoctorAdPreviewButton } from './DoctorAdPreviewButton';
import { DoctorAdInfoSection } from './DoctorAdInfoSection';
import { DoctorAdBranchesSection } from './DoctorAdBranchesSection';
import { DoctorAdSocialLinksSection, createSocialLinkDraft } from './DoctorAdSocialLinksSection';
import { DoctorAdActionsBar } from './DoctorAdActionsBar';
import { normalizeScheduleRows } from './utils';
import { useDoctorAdvertisementController } from './useDoctorAdvertisementController';
import type { DoctorAdvertisementPageProps } from '../../../types';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';

export const DoctorAdvertisementPage: React.FC<DoctorAdvertisementPageProps> = (props) => {
  const {
    loading, saving, message, error, showPreview, setShowPreview, profileImage,
    adDoctorName, setAdDoctorName, doctorSpecialty, academicDegree, setAcademicDegree,
    yearsExperience, setYearsExperience, subSpecialties, setSubSpecialties,
    featuredServicesSummary, setFeaturedServicesSummary, workplace, setWorkplace,
    extraInfo, setExtraInfo, socialLinks, setSocialLinks,

    // الفروع
    branches, activeBranchId, setActiveBranchId, canAddBranch,
    addBranch, removeBranch, renameBranch, updateBranchField,
    addScheduleRow, removeScheduleRow, updateScheduleRow,
    addServiceRow, removeServiceRow, updateServiceRow,
    removeBranchImage,

    // صور (رفع وقص)
    deletingImageIndex, addImageFromFile,
    pendingCropImage, crop, zoom, cropAspect, uploadingImage,
    setCrop, setZoom, onCropComplete, handleCancelCrop,
    handleSaveCroppedImage, handleSaveOriginalImage,

    // معاينة/حفظ
    previewData, isPublished, saveAd,
  } = useDoctorAdvertisementController(props);

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل بيانات الإعلان" />;
  }

  // عرض رسالة خطأ داخل الصفحة (بنستخدمها في الفروع عشان نبلغ المستخدم
  // بأخطاء صغيرة زي "مينفعش تحذف آخر فرع"). بنعتمد على setError
  // اللي موجود في الـcontroller — نمرّره كـ prop للقسم.
  // setError مش في return؛ نستخدم حيلة مؤقتة: نعيد-تغليف setMessage.
  // إيه أبسط: نمرر setError مباشرةً. لكنها مش مُصدَّرة — فنعيد كتابة:
  // (سنستخدم window.alert للخطأ البسيط — أبسط من setState خارجي هنا).
  const handleInlineError = (msg: string) => {
    // استخدام alert مبدئياً؛ يمكن تحسينه لاحقاً برسالة toast
    window.alert(msg);
  };

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

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 font-bold">{error}</div>}

      {/* المعلومات العامة عن الطبيب */}
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

      {/* فروع العيادة المتعددة */}
      <DoctorAdBranchesSection
        branches={branches}
        activeBranchId={activeBranchId}
        canAddBranch={canAddBranch}
        onSetActiveBranchId={setActiveBranchId}
        onAddBranch={addBranch}
        onRemoveBranch={removeBranch}
        onRenameBranch={renameBranch}
        onUpdateBranchField={updateBranchField}
        onAddServiceRow={addServiceRow}
        onUpdateServiceRow={updateServiceRow}
        onRemoveServiceRow={removeServiceRow}
        onAddScheduleRow={addScheduleRow}
        onUpdateScheduleRow={updateScheduleRow}
        onRemoveScheduleRow={removeScheduleRow}
        deletingImageIndex={deletingImageIndex}
        onAddImageFromFile={addImageFromFile}
        onRemoveBranchImage={removeBranchImage}
        onInlineError={handleInlineError}
      />

      {/* السوشيال — قسم عالمي (مش لكل فرع) */}
      <DoctorAdSocialLinksSection
        socialLinks={socialLinks}
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
          setSocialLinks((prev) => [...prev, createSocialLinkDraft()]);
        }}
      />

      <LivePreviewModal
        showPreview={showPreview}
        onClose={() => setShowPreview(false)}
        profileImage={profileImage}
        previewData={previewData}
        imageUrls={previewData.imageUrls || []}
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
        onSaveDraft={() => { void saveAd(false); }}
        onPublish={() => { void saveAd(true); }}
      />

      {/* زرار المعاينه اتنقل هنا تحت خالص — بعد كل المحتوى وأزرار الحفظ/النشر */}
      <DoctorAdPreviewButton onClick={() => setShowPreview(true)} />
    </div>
  );
};
