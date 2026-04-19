// ─────────────────────────────────────────────────────────────────────────────
// وحدة تحكم صفحة إعلان الطبيب (Doctor Advertisement Controller)
// ─────────────────────────────────────────────────────────────────────────────
// Hook شامل لصفحة إعلان الطبيب — بيدير كل الـ state والعمليات:
//   • تحميل بيانات الإعلان الحالية (ratings, imageUrls, schedule ...)
//   • إدارة حقول الإدخال (الاسم، البيو، العنوان، الخدمات، الجدول، السوشيال)
//   • اختيار/رفع/قصّ الصور (avatar + معرض)
//   • نشر/إلغاء نشر الإعلان في الدليل العام
//   • التحقق من صحة البيانات قبل الحفظ (validateDoctorAdBeforeSave)
//   • بناء بيانات المعاينة قبل النشر (buildDoctorAdPreviewData)
//
// المنطق الدقيق (التحقق والمعاينة) في ملف helpers منفصل لتقسيم المسؤوليات.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DoctorAdProfile, DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';
import { DoctorSocialLink } from './types';
import { firestoreService } from '../../../services/firestore';
import {
  deleteDoctorAdImageByUrl, uploadDoctorAdImageBase64, uploadDoctorAdImageFile, } from '../../../services/storageService';
import { CITIES_BY_GOVERNORATE } from '../constants';
import { getRectCroppedImg } from '../../../utils/rectCropImage';
import {
  mapDoctorAdActionError, safeDocId, sanitizeSocialLinks, sanitizeSocialUrl, sanitizeTextInput, } from './securityUtils';
import {
  createDefaultSchedule, createScheduleId, createServiceId, createSocialId, CUSTOM_CITY_OPTION, fileToDataUrl, getImageAspect, isCustomCityValue, LEGACY_CUSTOM_CITY_OPTION, MAX_IMAGE_SIZE_BYTES, normalizeScheduleRows, toNumber, } from './utils';
import type { DoctorAdvertisementPageProps } from '../../../types';
import {
  buildDoctorAdPreviewData,
  isDoctorAdImageOwnedByDoctor,
  validateDoctorAdBeforeSave,
} from './useDoctorAdvertisementController.helpers';
export const useDoctorAdvertisementController = ({
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
}: DoctorAdvertisementPageProps) => {
  const safeDoctorId = useMemo(() => safeDocId(doctorId), [doctorId]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adDoctorName, setAdDoctorName] = useState(doctorName || '');
  const [academicDegree, setAcademicDegree] = useState('');
  const [subSpecialties, setSubSpecialties] = useState('');
  const [featuredServicesSummary, setFeaturedServicesSummary] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [socialLinks, setSocialLinks] = useState<DoctorSocialLink[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [examinationPrice, setExaminationPrice] = useState('');
  const [discountedExaminationPrice, setDiscountedExaminationPrice] = useState('');
  const [consultationPrice, setConsultationPrice] = useState('');
  const [discountedConsultationPrice, setDiscountedConsultationPrice] = useState('');
  const [clinicServices, setClinicServices] = useState<DoctorClinicServiceRow[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [persistedImageUrls, setPersistedImageUrls] = useState<string[]>([]);
  const [clinicSchedule, setClinicSchedule] = useState<DoctorClinicScheduleRow[]>(createDefaultSchedule());
  const [newScheduleDay, setNewScheduleDay] = useState('');
  const [newScheduleFrom, setNewScheduleFrom] = useState('');
  const [newScheduleTo, setNewScheduleTo] = useState('');
  const [newScheduleNotes, setNewScheduleNotes] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(4 / 3);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const cityOptions = useMemo(() => {
    if (!governorate) return [];
    const rawOptions = CITIES_BY_GOVERNORATE[governorate] || [LEGACY_CUSTOM_CITY_OPTION];
    const normalized = rawOptions.map((option) =>
      option === LEGACY_CUSTOM_CITY_OPTION ? CUSTOM_CITY_OPTION : option
    );
    return Array.from(new Set(normalized));
  }, [governorate]);
  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => setMessage(''), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [message]);
  const previewData = useMemo(
    (): DoctorAdProfile =>
      buildDoctorAdPreviewData({
        safeDoctorId,
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
        governorate,
        city,
        otherCity,
        addressDetails,
        clinicSchedule,
        examinationPrice,
        discountedExaminationPrice,
        consultationPrice,
        discountedConsultationPrice,
        clinicServices,
        imageUrls,
        contactPhone,
        whatsapp,
        socialLinks,
        yearsExperience,
        isPublished,
        normalizeScheduleRows,
      }),
    [
    adDoctorName,
    addressDetails,
    academicDegree,
    city,
    clinicSchedule,
    clinicServices,
    consultationPrice,
    discountedConsultationPrice,
    discountedExaminationPrice,
    doctorId,
    doctorSpecialty,
    examinationPrice,
    extraInfo,
    featuredServicesSummary,
    governorate,
    imageUrls,
    isPublished,
    otherCity,
    profileImage,
    safeDoctorId,
    socialLinks,
    subSpecialties,
    whatsapp,
    contactPhone,
    workplace,
    yearsExperience,
    ]
  );
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
        setAdDoctorName(ad.doctorName || doctorName || '');
        setAcademicDegree(ad.academicDegree || '');
        setSubSpecialties(ad.subSpecialties || '');
        setFeaturedServicesSummary(ad.featuredServicesSummary || '');
        setWorkplace(ad.workplace || '');
        setExtraInfo(ad.extraInfo || ad.bio || '');
        setGovernorate(ad.governorate || '');
        const cities = ad.governorate ? CITIES_BY_GOVERNORATE[ad.governorate] || [LEGACY_CUSTOM_CITY_OPTION] : [];
        if (ad.city && cities.includes(ad.city)) {
          if (ad.city === LEGACY_CUSTOM_CITY_OPTION) {
            setCity(CUSTOM_CITY_OPTION);
            setOtherCity('');
          } else {
            setCity(ad.city);
            setOtherCity('');
          }
        } else if (ad.city) {
          setCity(CUSTOM_CITY_OPTION);
          setOtherCity(ad.city);
        }
        setAddressDetails(ad.addressDetails || '');
        setContactPhone(ad.contactPhone || '');
        setWhatsapp(ad.whatsapp || '');
        if (Array.isArray(ad.socialLinks) && ad.socialLinks.length > 0) {
          setSocialLinks(
            sanitizeSocialLinks(
              ad.socialLinks.map((item, index) => ({
                id: item.id || `social-${index + 1}`,
                platform: item.platform || '',
                url: item.url || '',
              }))
            )
          );
        } else if (ad.socialMediaUrl) {
          setSocialLinks(
            sanitizeSocialLinks([
              {
                id: createSocialId(),
                platform: ad.socialMediaPlatform || 'Social',
                url: ad.socialMediaUrl,
              },
            ])
          );
        } else {
          setSocialLinks([]);
        }
        setYearsExperience(ad.yearsExperience != null ? String(ad.yearsExperience) : '');
        setExaminationPrice(ad.examinationPrice != null ? String(ad.examinationPrice) : '');
        setDiscountedExaminationPrice(
          ad.discountedExaminationPrice != null ? String(ad.discountedExaminationPrice) : ''
        );
        setConsultationPrice(ad.consultationPrice != null ? String(ad.consultationPrice) : '');
        setDiscountedConsultationPrice(
          ad.discountedConsultationPrice != null ? String(ad.discountedConsultationPrice) : ''
        );
        if (Array.isArray(ad.clinicServices) && ad.clinicServices.length > 0) {
          setClinicServices(ad.clinicServices);
        } else if (Array.isArray(ad.services) && ad.services.length > 0) {
          setClinicServices(
            ad.services.map((name, index) => ({
              id: `legacy-${index + 1}`,
              name,
              price: null,
            }))
          );
        } else {
          setClinicServices([]);
        }
        const loadedImageUrls = Array.isArray(ad.imageUrls) ? ad.imageUrls : [];
        setImageUrls(loadedImageUrls);
        setPersistedImageUrls(loadedImageUrls);
        setClinicSchedule(normalizeScheduleRows(ad.clinicSchedule));
        setIsPublished(Boolean(ad.isPublished));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [safeDoctorId]);
  useEffect(() => {
    if (doctorName.trim() && doctorName !== adDoctorName) {
      setAdDoctorName(doctorName);
    }
  }, [adDoctorName, doctorName]);
  const addClinicServiceRow = () => {
    if (clinicServices.length >= 20) {
      setError('يمكن إضافة حتى 20 خدمة فقط.');
      return;
    }
    setClinicServices((prev) => [
      ...prev,
      {
        id: createServiceId(),
        name: '',
        price: null,
      },
    ]);
    setError('');
  };
  const updateClinicService = (serviceId: string, patch: Partial<DoctorClinicServiceRow>) => {
    setClinicServices((prev) =>
      prev.map((item) => (item.id === serviceId ? { ...item, ...patch } : item))
    );
  };
  const removeClinicService = (serviceId: string) => {
    setClinicServices((prev) => prev.filter((item) => item.id !== serviceId));
  };
  const addImageFromFile = async (file: File) => {
    if (!safeDoctorId) {
      setLoading(true);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('حجم الصورة يجب ألا يتجاوز 10 ميجابايت.');
      return;
    }
    if (imageUrls.length >= 6) {
      setError('يمكن رفع 6 صور كحد أقصى.');
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
    ) => {
      setCroppedAreaPixels(croppedPixels);
    },
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
    if (!safeDoctorId || !pendingOriginalFile) return;
    setUploadingImage(true);
    try {
      const cloudUrl = await uploadDoctorAdImageFile(safeDoctorId, pendingOriginalFile);
      setImageUrls((prev) => [...prev, cloudUrl]);
      setError('');
      handleCancelCrop();
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setUploadingImage(false);
    }
  };
  const handleSaveCroppedImage = async () => {
    if (!safeDoctorId || !pendingCropImage) return;
    setUploadingImage(true);
    try {
      if (croppedAreaPixels) {
        const cropped = await getRectCroppedImg(pendingCropImage, croppedAreaPixels);
        const cloudUrl = await uploadDoctorAdImageBase64(safeDoctorId, cropped);
        setImageUrls((prev) => [...prev, cloudUrl]);
      } else {
        const cloudUrl = await uploadDoctorAdImageBase64(safeDoctorId, pendingCropImage);
        setImageUrls((prev) => [...prev, cloudUrl]);
      }
      setError('');
      handleCancelCrop();
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setUploadingImage(false);
    }
  };
  const removeImage = async (index: number) => {
    const targetUrl = imageUrls[index];
    if (!targetUrl) return;
    setDeletingImageIndex(index);
    try {
      if (safeDoctorId && isDoctorAdImageOwnedByDoctor(targetUrl, safeDoctorId)) {
        await deleteDoctorAdImageByUrl(targetUrl);
      }
      setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
      setError('');
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setDeletingImageIndex(null);
    }
  };
  const addScheduleRow = () => {
    if (!newScheduleDay || !newScheduleFrom || !newScheduleTo) {
      setError('يرجى إدخال اليوم ووقت البداية والنهاية قبل إضافة الموعد.');
      return;
    }
    setClinicSchedule((prev) => [
      ...prev,
      {
        id: createScheduleId(),
        day: newScheduleDay,
        from: newScheduleFrom,
        to: newScheduleTo,
        notes: newScheduleNotes.trim(),
      },
    ]);
    setNewScheduleDay('');
    setNewScheduleFrom('');
    setNewScheduleTo('');
    setNewScheduleNotes('');
    setError('');
  };
  const removeScheduleRow = (id: string) => {
    setClinicSchedule((prev) => prev.filter((row) => row.id !== id));
  };
  const validateBeforeSave = () =>
    validateDoctorAdBeforeSave({
      adDoctorName,
      doctorSpecialty,
      governorate,
      city,
      otherCity,
      addressDetails,
      socialLinks,
      examinationPrice,
      discountedExaminationPrice,
      consultationPrice,
      discountedConsultationPrice,
      clinicServices,
    });
  const saveAd = async (publishValue: boolean) => {
    if (!safeDoctorId) {
      setLoading(true);
      return;
    }
    setError('');
    setMessage('');
    const validationError = validateBeforeSave();
    if (validationError) {
      setError(validationError);
      return;
    }
    const cityValue = isCustomCityValue(city) ? otherCity.trim() : city;
    const normalizedClinicServices = clinicServices
      .map((item) => ({
        id: item.id,
        name: sanitizeTextInput(item.name, 160),
        price: item.price,
        discountedPrice: item.discountedPrice ?? null,
      }))
      .filter((item) => item.name);
    const normalizedSchedule = normalizeScheduleRows(clinicSchedule);
    const normalizedSocialLinks = sanitizeSocialLinks(socialLinks);
    const payload: Partial<DoctorAdProfile> = {
      doctorName: sanitizeTextInput(adDoctorName, 160),
      doctorSpecialty: sanitizeTextInput(doctorSpecialty, 160),
      academicDegree: sanitizeTextInput(academicDegree, 400),
      subSpecialties: sanitizeTextInput(subSpecialties, 1200),
      featuredServicesSummary: sanitizeTextInput(featuredServicesSummary, 1200),
      workplace: sanitizeTextInput(workplace, 800),
      extraInfo: sanitizeTextInput(extraInfo, 1500),
      profileImage: profileImage || '',
      clinicName: '',
      bio: sanitizeTextInput(extraInfo, 1500),
      governorate: sanitizeTextInput(governorate, 120),
      city: sanitizeTextInput(cityValue, 120),
      addressDetails: sanitizeTextInput(addressDetails, 800),
      clinicSchedule: normalizedSchedule,
      examinationPrice: toNumber(examinationPrice),
      discountedExaminationPrice: toNumber(discountedExaminationPrice),
      consultationPrice: toNumber(consultationPrice),
      discountedConsultationPrice: toNumber(discountedConsultationPrice),
      clinicServices: normalizedClinicServices,
      services: normalizedClinicServices.map((item) => item.name),
      imageUrls,
      contactPhone: sanitizeTextInput(contactPhone, 40),
      whatsapp: sanitizeTextInput(whatsapp, 40),
      socialLinks: normalizedSocialLinks,
      socialMediaPlatform: sanitizeTextInput(normalizedSocialLinks[0]?.platform, 80),
      socialMediaUrl: sanitizeSocialUrl(normalizedSocialLinks[0]?.url),
      yearsExperience: toNumber(yearsExperience),
      isPublished: publishValue,
    };
    setSaving(true);
    try {
      await firestoreService.saveDoctorAdByDoctorId(safeDoctorId, payload);
      const removedFromAd = persistedImageUrls.filter((url) => !imageUrls.includes(url));
      const removableUrls = removedFromAd.filter((url) => isDoctorAdImageOwnedByDoctor(url, safeDoctorId));
      if (removableUrls.length > 0) {
        await Promise.all(removableUrls.map((url) => deleteDoctorAdImageByUrl(url)));
      }
      setPersistedImageUrls(imageUrls);
      setIsPublished(publishValue);
      setMessage(publishValue ? '✅ تم تحديث الإعلان المنشور بنجاح.' : '✅ تم حفظ الإعلان كمسودة.');
    } catch (err: unknown) {
      setError(mapDoctorAdActionError(err, 'تعذر تحميل بيانات الإعلان'));
    } finally {
      setSaving(false);
    }
  };
  return {
    loading, saving, message, error, showPreview, setShowPreview, profileImage,
    adDoctorName, setAdDoctorName, doctorSpecialty, academicDegree, setAcademicDegree,
    yearsExperience, setYearsExperience, subSpecialties, setSubSpecialties,
    featuredServicesSummary, setFeaturedServicesSummary, workplace, setWorkplace,
    extraInfo, setExtraInfo, governorate, setGovernorate, city, setCity, otherCity,
    setOtherCity, addressDetails, setAddressDetails, contactPhone, setContactPhone,
    whatsapp, setWhatsapp, socialLinks, setSocialLinks, cityOptions,
    examinationPrice, setExaminationPrice, discountedExaminationPrice,
    setDiscountedExaminationPrice, consultationPrice, setConsultationPrice,
    discountedConsultationPrice, setDiscountedConsultationPrice, clinicServices,
    updateClinicService, addClinicServiceRow, removeClinicService, clinicSchedule,
    newScheduleDay, setNewScheduleDay, newScheduleFrom, setNewScheduleFrom,
    newScheduleTo, setNewScheduleTo, newScheduleNotes, setNewScheduleNotes,
    addScheduleRow, removeScheduleRow, imageUrls, deletingImageIndex, addImageFromFile,
    removeImage, pendingCropImage, crop, zoom, cropAspect, uploadingImage, setCrop,
    setZoom, onCropComplete, handleCancelCrop, handleSaveCroppedImage,
    handleSaveOriginalImage, previewData, isPublished, saveAd,
  };
};

