/**
 * صفحة إدارة إعلان الطبيب (Doctor Advertisement Management Page):
 * - الحقول العامة عن الطبيب (اسم، درجة علمية، تخصصات دقيقة، خدمات، معلومات).
 * - فروع العيادة (العدد حسب باقة الطبيب) — كل فرع بعنوانه ومواعيده وأسعاره وخدماته وصوره.
 * - روابط السوشيال (عالمية لكل الفروع).
 * - حفظ كمسودة / نشر / معاينة.
 */
import React from 'react';
import { createPortal } from 'react-dom';

import { LivePreviewModal } from './LivePreviewModal';
import { ImageCropModal } from './ImageCropModal';
import { DoctorAdPreviewButton } from './DoctorAdPreviewButton';
import { DoctorAdInfoSection } from './DoctorAdInfoSection';
import { DoctorAdBranchesSection } from './DoctorAdBranchesSection';
import { DoctorAdSocialLinksSection, createSocialLinkDraft } from './DoctorAdSocialLinksSection';
import { DoctorAdActionsBar } from './DoctorAdActionsBar';
import { normalizeScheduleRows } from './utils';
import { useDoctorAdvertisementController } from './useDoctorAdvertisementController';
import type { DoctorAdvertisementPageProps } from '../../../types';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { AdminAccessToggle } from '../../shared/AdminAccessToggle';
import { auth } from '../../../services/firebaseConfig';

export const DoctorAdvertisementPage: React.FC<DoctorAdvertisementPageProps> = (props) => {
  const {
    loading, saving, message, error, showPreview, setShowPreview, profileImage,
    adDoctorName, setAdDoctorName, doctorSpecialty, academicDegree, setAcademicDegree,
    yearsExperience, setYearsExperience, subSpecialties, setSubSpecialties,
    featuredServicesSummary, setFeaturedServicesSummary, workplace, setWorkplace,
    extraInfo, setExtraInfo, socialLinks, setSocialLinks,

    // الفروع
    branches, activeBranchId, setActiveBranchId, canAddBranch, maxBranchesForPlan,
    addBranch, removeBranch, renameBranch, updateBranchField,
    addScheduleRow, removeScheduleRow, updateScheduleRow,
    addServiceRow, removeServiceRow, updateServiceRow,
    removeBranchImage,

    // صور (رفع وقص)
    deletingImageIndex, addImageFromFile,
    pendingCropImage, crop, zoom, cropAspect, uploadingImage,
    setCrop, setZoom, onCropComplete, handleCancelCrop,
    handleSaveCroppedImage,

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
      {/* رسالة التنبيه المركزية: نجاح (أخضر) أو خطأ (أحمر) — بتظهر في نص الشاشة
          بعد الضغط على "نشر" أو "تحديث" أو لو حصل خطأ.
          بنعمل Portal لـdocument.body عشان نهرب من أي عنصر أب عنده
          transform/animation (زي dh-stagger-1) — العناصر دي بتكسر position:fixed
          وبتخلّي التنبيه يظهر فوق الصفحه بدل ما يظهر في نص الشاشه. */}
      {(message || error) && createPortal(
        <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center px-4">
          <div
            className={`max-w-md w-full text-white rounded-2xl shadow-2xl px-5 py-4 text-center font-black border ${
              error
                ? 'bg-danger-600/95 border-danger-300'
                : 'bg-success-600/95 border-success-300'
            }`}
          >
            {error || message}
          </div>
        </div>,
        document.body
      )}

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
        maxBranches={maxBranchesForPlan}
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
      />

      <DoctorAdActionsBar
        saving={saving}
        isPublished={isPublished}
        onSaveDraft={() => { void saveAd(false); }}
        onPublish={() => { void saveAd(true); }}
      />

      {/* زرار المعاينه اتنقل هنا تحت خالص — بعد كل المحتوى وأزرار الحفظ/النشر */}
      <DoctorAdPreviewButton onClick={() => setShowPreview(true)} />

      {/* زر إذن الأدمن — يظهر للطبيب بس. لمّا الأدمن بيساعد، الـauth.uid مختلف
          عن doctorId، فبنخفي الزر علشان الأدمن مايقدرش يقفل وصول نفسه. */}
      {auth.currentUser?.uid && auth.currentUser.uid === props.doctorId && (
        <AdminAccessToggle
          field="allowAdminAdEdit"
          title="السماح للإدارة بمساعدتك في تصميم الإعلان"
          description="لمّا تكون مفعّلة، فريق الإدارة يقدر يفتح صفحة إعلانك ويعدّلها معاك. الإدارة مش بتشوف بياناتك التانية (المرضى، التقارير، المالية) — الحماية مفروضة من قواعد التطبيق."
        />
      )}
    </div>
  );
};
