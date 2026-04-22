// ─────────────────────────────────────────────────────────────────────────────
// وحدة تحكم صفحة إعلان الطبيب (Doctor Advertisement Controller)
// ─────────────────────────────────────────────────────────────────────────────
// الهدف: hook شامل لصفحة إعلان الطبيب يدير:
//   • حقول عالمية عن الطبيب (اسم، تخصص، سيرة، سوشيال، خبرة، حالة نشر)
//   • فروع الطبيب المتعددة (branches[]) — كل فرع له عنوانه ومواعيده وأسعاره
//     وخدماته وصوره المستقلة (عن طريق useDoctorAdBranches).
//   • رفع/قص/حذف صور الفرع النشط.
//   • التحميل من Firestore مع ترحيل البيانات القديمة (قبل تعدد الفروع)
//     لفرع واحد افتراضي.
//   • الحفظ في Firestore مع كتابة branches[] + نسخ أول فرع للحقول القديمة
//     عشان التوافق مع أي كود قديم.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DoctorAdProfile } from '../../../types';
import { DoctorSocialLink } from './types';
import { firestoreService } from '../../../services/firestore';
import {
  deleteDoctorAdImageByUrl, uploadDoctorAdImageBase64, uploadDoctorAdImageFile,
} from '../../../services/storageService';
import { getRectCroppedImg } from '../../../utils/rectCropImage';
import {
  mapDoctorAdActionError, safeDocId, sanitizeSocialLinks, sanitizeSocialUrl,
  sanitizeMultilineInput, sanitizeTextInput,
} from './securityUtils';
import {
  MAX_IMAGES_PER_BRANCH, MAX_IMAGE_SIZE_BYTES,
  createSocialId, fileToDataUrl, getImageAspect,
  migrateLegacyFieldsToBranch, normalizeBranch,
} from './utils';
import type { DoctorAdvertisementPageProps } from '../../../types';
import {
  buildDoctorAdPreviewData,
  isDoctorAdImageOwnedByDoctor,
  validateDoctorAdBeforeSave,
} from './useDoctorAdvertisementController.helpers';
import { useDoctorAdBranches } from './useDoctorAdBranches';

export const useDoctorAdvertisementController = ({
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
}: DoctorAdvertisementPageProps) => {
  const safeDoctorId = useMemo(() => safeDocId(doctorId), [doctorId]);

  // ─── حالة عامة للصفحة ───
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // ─── الحقول العالمية للطبيب (برا الفروع) ───
  const [adDoctorName, setAdDoctorName] = useState(doctorName || '');
  const [academicDegree, setAcademicDegree] = useState('');
  const [subSpecialties, setSubSpecialties] = useState('');
  const [featuredServicesSummary, setFeaturedServicesSummary] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [socialLinks, setSocialLinks] = useState<DoctorSocialLink[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');

  // ─── فروع الطبيب (كل فرع بمعلوماته المستقلة) ───
  const branchesApi = useDoctorAdBranches();
  const { branches, activeBranchId, activeBranch } = branchesApi;

  // ─── حالة رفع الصور (مشتركة — كل صورة بتروح للفرع النشط) ───
  const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(4 / 3);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  // نتذكر كل الصور اللي اتحفظت في Firestore — عشان بعد Save نقدر نحذف من
  // الـStorage الصور اللي شالها الطبيب من أي فرع.
  const [persistedImageUrls, setPersistedImageUrls] = useState<string[]>([]);

  // ─── إخفاء رسالة النجاح أوتوماتيك بعد ثواني ───
  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => setMessage(''), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  // ─── مزامنة اسم الطبيب من البروب لما البروب يتغير فقط ───
  useEffect(() => {
    if (doctorName.trim()) {
      setAdDoctorName(doctorName);
    }
  }, [doctorName]);

  // ─── بناء بيانات المعاينة (تشمل كل الفروع) ───
  const previewData = useMemo(
    (): DoctorAdProfile =>
      buildDoctorAdPreviewData({
        safeDoctorId: safeDoctorId || '',
        doctorId,
        doctorName,
        doctorSpecialty,
        profileImage,
        adDoctorName,
        academicDegree,
        subSpecialties,
        featuredServicesSummary,
        workplace,
        extraInfo,
        branches,
        socialLinks,
        yearsExperience,
        isPublished,
      }),
    [
      adDoctorName, academicDegree, branches, doctorId, doctorName, doctorSpecialty,
      extraInfo, featuredServicesSummary, isPublished, profileImage, safeDoctorId,
      socialLinks, subSpecialties, workplace, yearsExperience,
    ]
  );

  // ─── تحميل الإعلان من Firestore + ترحيل البيانات القديمة ───
  useEffect(() => {
    if (!safeDoctorId) {
      setLoading(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    firestoreService
      .getDoctorAdByDoctorId(safeDoctorId)
      .then((ad) => {
        if (cancelled || !ad) return;
        // الحقول العالمية
        setAdDoctorName(ad.doctorName || doctorName || '');
        setAcademicDegree(ad.academicDegree || '');
        setSubSpecialties(ad.subSpecialties || '');
        setFeaturedServicesSummary(ad.featuredServicesSummary || '');
        setWorkplace(ad.workplace || '');
        setExtraInfo(ad.extraInfo || ad.bio || '');
        setYearsExperience(ad.yearsExperience != null ? String(ad.yearsExperience) : '');

        // السوشيال (نفس المنطق القديم)
        if (Array.isArray(ad.socialLinks) && ad.socialLinks.length > 0) {
          setSocialLinks(sanitizeSocialLinks(
            ad.socialLinks.map((item, index) => ({
              id: item.id || `social-${index + 1}`,
              platform: item.platform || '',
              url: item.url || '',
            }))
          ));
        } else if (ad.socialMediaUrl) {
          setSocialLinks(sanitizeSocialLinks([
            { id: createSocialId(), platform: ad.socialMediaPlatform || 'Social', url: ad.socialMediaUrl },
          ]));
        } else {
          setSocialLinks([]);
        }

        // الفروع: لو المستند فيه branches جاهز، نستخدمه. غير كده
        // نبني فرع واحد من الحقول القديمة (top-level) اللي كانت بتستخدم
        // قبل ما ندعم تعدد الفروع.
        const loadedBranches = Array.isArray(ad.branches) && ad.branches.length > 0
          ? ad.branches.map((b, idx) => normalizeBranch(b, `فرع ${idx + 1}`))
          : [migrateLegacyFieldsToBranch(ad)];
        branchesApi.setBranches(loadedBranches);
        branchesApi.setActiveBranchId(loadedBranches[0]?.id || '');

        // تتبع كل الصور المحفوظة (عبر كل الفروع) — نحتاجها لحذف Storage بعد Save
        const allPersistedImages = loadedBranches.flatMap((b) => b.imageUrls);
        setPersistedImageUrls(allPersistedImages);

        setIsPublished(Boolean(ad.isPublished));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeDoctorId]);

  // ═════════════════════════════════════════════════════════════════════════
  // رفع الصور للفرع النشط
  // ═════════════════════════════════════════════════════════════════════════
  const addImageFromFile = async (file: File) => {
    if (!safeDoctorId) { setLoading(true); return; }
    if (!activeBranch) { setError('لا يوجد فرع محدد لرفع الصورة عليه.'); return; }
    if (!file.type.startsWith('image/')) { setError('يرجى اختيار ملف صورة صالح.'); return; }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { setError('حجم الصورة يجب ألا يتجاوز 10 ميجابايت.'); return; }
    if (activeBranch.imageUrls.length >= MAX_IMAGES_PER_BRANCH) {
      setError(`يمكن رفع ${MAX_IMAGES_PER_BRANCH} صور كحد أقصى لكل فرع.`);
      return;
    }
    try {
      const originalDataUrl = await fileToDataUrl(file);
      setPendingCropImage(originalDataUrl);
      setPendingOriginalFile(file);
      const aspect = await getImageAspect(originalDataUrl);
      setCropAspect(aspect);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError('');
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    }
  };

  const onCropComplete = useCallback(
    (
      _croppedArea: { x: number; y: number; width: number; height: number },
      croppedPixels: { x: number; y: number; width: number; height: number }
    ) => { setCroppedAreaPixels(croppedPixels); },
    []
  );

  const handleCancelCrop = () => {
    setPendingCropImage(null);
    setPendingOriginalFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropAspect(4 / 3);
    setCroppedAreaPixels(null);
  };

  const handleSaveOriginalImage = async () => {
    if (!safeDoctorId || !pendingOriginalFile || !activeBranch) return;
    setUploadingImage(true);
    try {
      const cloudUrl = await uploadDoctorAdImageFile(safeDoctorId, pendingOriginalFile);
      branchesApi.appendBranchImage(activeBranch.id, cloudUrl);
      setError('');
      handleCancelCrop();
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCroppedImage = async () => {
    if (!safeDoctorId || !pendingCropImage || !activeBranch) return;
    setUploadingImage(true);
    try {
      const dataUrl = croppedAreaPixels
        ? await getRectCroppedImg(pendingCropImage, croppedAreaPixels)
        : pendingCropImage;
      const cloudUrl = await uploadDoctorAdImageBase64(safeDoctorId, dataUrl);
      branchesApi.appendBranchImage(activeBranch.id, cloudUrl);
      setError('');
      handleCancelCrop();
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setUploadingImage(false);
    }
  };

  // حذف صورة من فرع معيّن: نشيلها من الـstate ونحذفها من Storage لو ملكنا
  const removeBranchImage = async (branchId: string, imageIndex: number) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    const targetUrl = branch.imageUrls[imageIndex];
    if (!targetUrl) return;
    setDeletingImageIndex(imageIndex);
    try {
      if (safeDoctorId && isDoctorAdImageOwnedByDoctor(targetUrl, safeDoctorId)) {
        await deleteDoctorAdImageByUrl(targetUrl);
      }
      branchesApi.removeBranchImage(branchId, imageIndex);
      setError('');
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setDeletingImageIndex(null);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // الحفظ
  // ═════════════════════════════════════════════════════════════════════════
  const validateBeforeSave = () =>
    validateDoctorAdBeforeSave({
      adDoctorName,
      doctorSpecialty,
      branches,
      socialLinks,
    });

  const saveAd = async (publishValue: boolean) => {
    if (!safeDoctorId) { setLoading(true); return; }
    setError('');
    setMessage('');
    const validationError = validateBeforeSave();
    if (validationError) { setError(validationError); return; }

    // نطهر كل فرع ونرمي الخدمات الفاضية
    const normalizedBranches = branches.map((b) => ({
      id: b.id,
      name: sanitizeTextInput(b.name, 80) || 'فرع',
      governorate: sanitizeTextInput(b.governorate, 120),
      city: sanitizeTextInput(b.city, 120),
      addressDetails: sanitizeMultilineInput(b.addressDetails, 800),
      contactPhone: sanitizeTextInput(b.contactPhone, 40),
      whatsapp: sanitizeTextInput(b.whatsapp, 40),
      clinicSchedule: b.clinicSchedule,
      clinicServices: b.clinicServices
        .map((s) => ({
          id: s.id,
          name: sanitizeTextInput(s.name, 160),
          price: s.price,
          discountedPrice: s.discountedPrice ?? null,
        }))
        .filter((s) => s.name),
      examinationPrice: b.examinationPrice,
      discountedExaminationPrice: b.discountedExaminationPrice,
      consultationPrice: b.consultationPrice,
      discountedConsultationPrice: b.discountedConsultationPrice,
      imageUrls: b.imageUrls,
    }));

    const normalizedSocialLinks = sanitizeSocialLinks(socialLinks);
    const primary = normalizedBranches[0];

    const payload: Partial<DoctorAdProfile> = {
      // الحقول العالمية
      doctorName: sanitizeTextInput(adDoctorName, 160),
      doctorSpecialty: sanitizeTextInput(doctorSpecialty, 160),
      academicDegree: sanitizeTextInput(academicDegree, 400),
      subSpecialties: sanitizeMultilineInput(subSpecialties, 1200),
      featuredServicesSummary: sanitizeMultilineInput(featuredServicesSummary, 1200),
      workplace: sanitizeMultilineInput(workplace, 800),
      extraInfo: sanitizeMultilineInput(extraInfo, 1500),
      profileImage: profileImage || '',
      clinicName: '',
      bio: sanitizeMultilineInput(extraInfo, 1500),
      socialLinks: normalizedSocialLinks,
      socialMediaPlatform: sanitizeTextInput(normalizedSocialLinks[0]?.platform, 80),
      socialMediaUrl: sanitizeSocialUrl(normalizedSocialLinks[0]?.url),
      yearsExperience: (() => { const n = Number(yearsExperience); return Number.isFinite(n) && n >= 0 ? n : null; })(),
      isPublished: publishValue,

      // الفروع (المصدر الحقيقي الجديد)
      branches: normalizedBranches,

      // نسخ أول فرع للحقول القديمة (Legacy) عشان أي كود قديم لسه يقرأها
      governorate: primary?.governorate || '',
      city: primary?.city || '',
      addressDetails: primary?.addressDetails || '',
      contactPhone: primary?.contactPhone || '',
      whatsapp: primary?.whatsapp || '',
      clinicSchedule: primary?.clinicSchedule || [],
      clinicServices: primary?.clinicServices || [],
      examinationPrice: primary?.examinationPrice ?? null,
      discountedExaminationPrice: primary?.discountedExaminationPrice ?? null,
      consultationPrice: primary?.consultationPrice ?? null,
      discountedConsultationPrice: primary?.discountedConsultationPrice ?? null,
      services: (primary?.clinicServices || []).map((s) => s.name),
      imageUrls: primary?.imageUrls || [],
    };

    setSaving(true);
    try {
      await firestoreService.saveDoctorAdByDoctorId(safeDoctorId, payload);
      // حذف من Storage أي صورة كانت موجودة قبل الحفظ ومش موجودة دلوقتي في أي فرع
      const currentImages = normalizedBranches.flatMap((b) => b.imageUrls);
      const removedFromAd = persistedImageUrls.filter((url) => !currentImages.includes(url));
      const removableUrls = removedFromAd.filter((url) => isDoctorAdImageOwnedByDoctor(url, safeDoctorId));
      if (removableUrls.length > 0) {
        await Promise.all(removableUrls.map((url) => deleteDoctorAdImageByUrl(url)));
      }
      setPersistedImageUrls(currentImages);
      setIsPublished(publishValue);
      setMessage(publishValue ? '✅ تم تحديث الإعلان المنشور بنجاح.' : '✅ تم حفظ الإعلان كمسودة.');
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setSaving(false);
    }
  };

  return {
    // عام
    loading, saving, message, error, showPreview, setShowPreview, profileImage,
    // حقول الطبيب العالمية
    adDoctorName, setAdDoctorName, doctorSpecialty, academicDegree, setAcademicDegree,
    yearsExperience, setYearsExperience, subSpecialties, setSubSpecialties,
    featuredServicesSummary, setFeaturedServicesSummary, workplace, setWorkplace,
    extraInfo, setExtraInfo, socialLinks, setSocialLinks,
    // الفروع + CRUD (نفتح الـAPI كله من الـhook)
    branches, activeBranchId, activeBranch,
    setActiveBranchId: branchesApi.setActiveBranchId,
    canAddBranch: branchesApi.canAddBranch,
    addBranch: branchesApi.addBranch,
    removeBranch: branchesApi.removeBranch,
    renameBranch: branchesApi.renameBranch,
    updateBranchField: branchesApi.updateBranchField,
    addScheduleRow: branchesApi.addScheduleRow,
    removeScheduleRow: branchesApi.removeScheduleRow,
    updateScheduleRow: branchesApi.updateScheduleRow,
    addServiceRow: branchesApi.addServiceRow,
    removeServiceRow: branchesApi.removeServiceRow,
    updateServiceRow: branchesApi.updateServiceRow,
    removeBranchImage,
    // صور (رفع وقص)
    deletingImageIndex, addImageFromFile,
    pendingCropImage, crop, zoom, cropAspect, uploadingImage, setCrop, setZoom,
    onCropComplete, handleCancelCrop, handleSaveCroppedImage, handleSaveOriginalImage,
    // معاينة وحفظ ونشر
    previewData, isPublished, saveAd,
  };
};
