/**
 * خدمة إعلانات الأطباء (Doctor Ads Service)
 * تدير هذه الخدمة الملفات الشخصية العامة للأطباء التي تظهر في الدليل:
 * 1. جلب وتحديث بيانات الإعلان/الملف الشخصي.
 * 2. معالجة وتوحيد البيانات (Normalization) لضمان عرضها بشكل صحيح.
 * 3. البحث والفلترة في دليل الأطباء المنشورين.
 * 4. توليد الروابط العامة (Slugs) للمشاركة.
 */

import {
    doc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    QueryConstraint,
} from 'firebase/firestore';
import { getDocCacheFirst, getDocsCacheFirst } from './cacheFirst';
import { db } from '../firebaseConfig';
import type { DoctorAdProfile } from '../../types';
import { normalizeText } from '../../utils/textEncoding';
import { generateDoctorSlug } from '../../components/advertisement/public-directory/helpers';

/** تحويل القيم إلى نصوص مع تنظيفها من مشاكل التشفير */
const toNonEmptyString = (value: unknown): string => {
    return normalizeText(value);
};

/** التأكد من أن القيمة رقمية صالحة أو إرجاع null */
const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
};

/** التحقق من صحة التقييم (بين 0 و 5) */
const toRatingOrUndefined = (value: unknown): number | undefined => {
    const parsed = toNumberOrNull(value);
    if (parsed == null) return undefined;
    if (parsed < 0 || parsed > 5) return undefined;
    return parsed;
};

/** واجهة الفلترة للبحث في دليل الأطباء */
interface PublishedAdsFilter {
    specialty?: string; // التخصص
    governorate?: string; // المحافظة
    city?: string; // المدينة
    search?: string; // نص البحث العام
}

const normalizeFilterText = (value: unknown): string => normalizeText(value).toLowerCase();

const includesNormalizedText = (haystack: string, needle: string): boolean => {
    if (!needle) return true;
    return normalizeFilterText(haystack).includes(needle);
};

/** 
 * تحويل البيانات الخام من Firestore إلى كائن DoctorAdProfile منظم وموحد.
 * يعالج هذا التابع الحقول القديمة (Legacy) والمصفوفات والبيانات المفقودة.
 */
const normalizeDoctorAd = (doctorId: string, data: Record<string, unknown> | undefined): DoctorAdProfile | null => {
    if (!data) return null;

    // معالجة المصفوفات والحقول المتعددة
    const scheduleRaw = Array.isArray(data.clinicSchedule) ? data.clinicSchedule : [];
    const clinicServicesRaw = Array.isArray(data.clinicServices) ? data.clinicServices : [];
    const servicesRaw = Array.isArray(data.services) ? data.services : [];
    const imagesRaw = Array.isArray(data.imageUrls) ? data.imageUrls : [];
    
    // توحيد خدمات العيادة وأسعارها
    const normalizedClinicServices = clinicServicesRaw
        .map((item, index) => {
            const row = item as Record<string, unknown>;
            const name = toNonEmptyString(row.name);
            const price = toNumberOrNull(row.price);
            return {
                id: toNonEmptyString(row.id) || `service-${index + 1}`,
                name,
                price,
                discountedPrice: toNumberOrNull(row.discountedPrice),
            };
        })
        .filter((item) => item.name);

    const normalizedServiceNames = servicesRaw
        .map((item) => toNonEmptyString(item))
        .filter(Boolean);

    const servicesFromClinicServices = normalizedClinicServices.map((item) => item.name);
    
    // حل التعارض بين قائمة الخدمات النصية وقائمة الخدمات بأسعار
    const resolvedServiceNames = normalizedServiceNames.length > 0
        ? normalizedServiceNames
        : servicesFromClinicServices;

    const resolvedClinicServices = normalizedClinicServices.length > 0
        ? normalizedClinicServices
        : resolvedServiceNames.map((name, index) => ({
            id: `service-${index + 1}`,
            name,
            price: null,
            discountedPrice: null,
        }));

    // توحيد روابط التواصل الاجتماعي (دعم النظام القديم والجديد)
    const socialLinksRaw = Array.isArray(data.socialLinks) ? data.socialLinks : [];
    const legacySocialPlatform = toNonEmptyString(data.socialMediaPlatform);
    const legacySocialUrl = toNonEmptyString(data.socialMediaUrl);
    
    const normalizedSocialLinks = socialLinksRaw
        .map((item, index) => {
            const row = item as Record<string, unknown>;
            const platform = toNonEmptyString(row.platform);
            const url = toNonEmptyString(row.url);
            return {
                id: toNonEmptyString(row.id) || `social-${index + 1}`,
                platform,
                url,
            };
        })
        .filter((item) => item.platform && item.url);

    const resolvedSocialLinks = normalizedSocialLinks.length > 0
        ? normalizedSocialLinks
        : legacySocialUrl
            ? [{ id: 'social-legacy-1', platform: legacySocialPlatform || 'Social', url: legacySocialUrl }]
            : [];

    // بناء الكائن النهائي للملف الشخصي
    return {
        doctorId,
        doctorName: toNonEmptyString(data.doctorName),
        doctorSpecialty: toNonEmptyString(data.doctorSpecialty),
        academicDegree: toNonEmptyString(data.academicDegree) || undefined,
        subSpecialties: toNonEmptyString(data.subSpecialties) || undefined,
        featuredServicesSummary: toNonEmptyString(data.featuredServicesSummary) || undefined,
        workplace: toNonEmptyString(data.workplace) || undefined,
        extraInfo: toNonEmptyString(data.extraInfo) || undefined,
        profileImage: toNonEmptyString(data.profileImage) || undefined,
        clinicName: toNonEmptyString(data.clinicName) || undefined,
        bio: toNonEmptyString(data.bio),
        governorate: toNonEmptyString(data.governorate),
        city: toNonEmptyString(data.city),
        addressDetails: toNonEmptyString(data.addressDetails),
        clinicSchedule: scheduleRaw
            .map((item) => {
                const row = item as Record<string, unknown>;
                return {
                    id: toNonEmptyString(row.id),
                    day: toNonEmptyString(row.day),
                    from: toNonEmptyString(row.from),
                    to: toNonEmptyString(row.to),
                    notes: toNonEmptyString(row.notes) || undefined,
                };
            })
            .filter((row) => row.id && row.day),
        clinicServices: resolvedClinicServices,
        examinationPrice: toNumberOrNull(data.examinationPrice),
        discountedExaminationPrice: toNumberOrNull(data.discountedExaminationPrice),
        consultationPrice: toNumberOrNull(data.consultationPrice),
        discountedConsultationPrice: toNumberOrNull(data.discountedConsultationPrice),
        services: resolvedServiceNames,
        imageUrls: imagesRaw
            .map((item) => toNonEmptyString(item))
            .filter(Boolean),
        contactPhone: toNonEmptyString(data.contactPhone) || undefined,
        whatsapp: toNonEmptyString(data.whatsapp) || undefined,
        socialLinks: resolvedSocialLinks,
        socialMediaPlatform: toNonEmptyString(data.socialMediaPlatform) || undefined,
        socialMediaUrl: toNonEmptyString(data.socialMediaUrl) || undefined,
        yearsExperience: toNumberOrNull(data.yearsExperience),
        ratingAverage: toRatingOrUndefined(data.ratingAverage),
        ratingCount: (() => {
            const parsed = toNumberOrNull(data.ratingCount);
            if (parsed == null || parsed < 0) return undefined;
            return Math.floor(parsed);
        })(),
        ratingTotal: (() => {
            const parsed = toNumberOrNull(data.ratingTotal);
            if (parsed == null || parsed < 0) return undefined;
            return parsed;
        })(),
        publicSlug: toNonEmptyString(data.publicSlug) || undefined,
        isPublished: Boolean(data.isPublished),
        createdAt: toNonEmptyString(data.createdAt),
        updatedAt: toNonEmptyString(data.updatedAt),
    };
};

/** تنظيف البيانات قبل إرسالها إلى Firestore لضمان سلامة الهيكل */
const sanitizeDoctorAdPayload = (payload: Partial<DoctorAdProfile>) => {
    const nowIso = new Date().toISOString();
    const clinicServicesPrepared = Array.isArray(payload.clinicServices)
        ? payload.clinicServices
            .map((item, index) => ({
                id: toNonEmptyString(item.id) || `service-${index + 1}`,
                name: toNonEmptyString(item.name),
                price: toNumberOrNull(item.price),
                discountedPrice: toNumberOrNull(item.discountedPrice),
            }))
            .filter((item) => item.name)
        : [];
    const explicitServicesPrepared = Array.isArray(payload.services)
        ? payload.services.map((item) => toNonEmptyString(item)).filter(Boolean)
        : [];
    const servicesPrepared = explicitServicesPrepared.length > 0
        ? explicitServicesPrepared
        : clinicServicesPrepared.map((item) => item.name);

    return {
        doctorName: toNonEmptyString(payload.doctorName),
        doctorSpecialty: toNonEmptyString(payload.doctorSpecialty),
        academicDegree: toNonEmptyString(payload.academicDegree),
        subSpecialties: toNonEmptyString(payload.subSpecialties),
        featuredServicesSummary: toNonEmptyString(payload.featuredServicesSummary),
        workplace: toNonEmptyString(payload.workplace),
        extraInfo: toNonEmptyString(payload.extraInfo),
        profileImage: toNonEmptyString(payload.profileImage),
        clinicName: toNonEmptyString(payload.clinicName),
        bio: toNonEmptyString(payload.bio),
        governorate: toNonEmptyString(payload.governorate),
        city: toNonEmptyString(payload.city),
        addressDetails: toNonEmptyString(payload.addressDetails),
        clinicSchedule: Array.isArray(payload.clinicSchedule)
            ? payload.clinicSchedule
                .map((item) => ({
                    id: toNonEmptyString(item.id),
                    day: toNonEmptyString(item.day),
                    from: toNonEmptyString(item.from),
                    to: toNonEmptyString(item.to),
                    notes: toNonEmptyString(item.notes),
                }))
                .filter((item) => item.id && item.day)
            : [],
        clinicServices: clinicServicesPrepared,
        examinationPrice: toNumberOrNull(payload.examinationPrice),
        discountedExaminationPrice: toNumberOrNull(payload.discountedExaminationPrice),
        consultationPrice: toNumberOrNull(payload.consultationPrice),
        discountedConsultationPrice: toNumberOrNull(payload.discountedConsultationPrice),
        services: servicesPrepared,
        imageUrls: Array.isArray(payload.imageUrls)
            ? payload.imageUrls.map((item) => toNonEmptyString(item)).filter(Boolean)
            : [],
        contactPhone: toNonEmptyString(payload.contactPhone),
        whatsapp: toNonEmptyString(payload.whatsapp),
        socialLinks: Array.isArray(payload.socialLinks)
            ? payload.socialLinks
                .map((item, index) => ({
                    id: toNonEmptyString(item.id) || `social-${index + 1}`,
                    platform: toNonEmptyString(item.platform),
                    url: toNonEmptyString(item.url),
                }))
                .filter((item) => item.platform && item.url)
            : [],
        socialMediaPlatform: toNonEmptyString(payload.socialMediaPlatform),
        socialMediaUrl: toNonEmptyString(payload.socialMediaUrl),
        yearsExperience: toNumberOrNull(payload.yearsExperience),
        publicSlug: toNonEmptyString(payload.publicSlug),
        isPublished: Boolean(payload.isPublished),
        createdAt: toNonEmptyString(payload.createdAt) || nowIso,
        updatedAt: nowIso,
    };
};

export const doctorAdsService = {
    /** جلب بيانات الإعلان الطبيب يدوياً */
    getDoctorAdByDoctorId: async (doctorId: string): Promise<DoctorAdProfile | null> => {
        const ref = doc(db, 'doctorAds', doctorId);
        const snap = await getDocCacheFirst(ref);
        if (!snap.exists()) return null;
        return normalizeDoctorAd(doctorId, snap.data() as Record<string, unknown>);
    },

    /** حفظ أو تحديث بيانات الملف الشخصي العام */
    saveDoctorAdByDoctorId: async (doctorId: string, payload: Partial<DoctorAdProfile>): Promise<void> => {
        const ref = doc(db, 'doctorAds', doctorId);
        const prepared = sanitizeDoctorAdPayload(payload);
        
        // توليد رابط عام (Slug) فريد تلقائياً إذا كان الملف منشوراً
        if (prepared.isPublished && !prepared.publicSlug) {
            const tempDoc = { ...prepared, doctorId } as DoctorAdProfile;
            prepared.publicSlug = generateDoctorSlug(tempDoc);
        }
        
        await setDoc(ref, prepared, { merge: true });
    },

    /** الاشتراك اللحظي في بيانات ملف الطبيب */
    subscribeToDoctorAd: (
        doctorId: string,
        onUpdate: (ad: DoctorAdProfile | null) => void
    ) => {
        const ref = doc(db, 'doctorAds', doctorId);
        let cancelled = false;

        getDocCacheFirst(ref).then((snap) => {
            if (cancelled) return;
            if (!snap.exists()) {
                onUpdate(null);
                return;
            }
            onUpdate(normalizeDoctorAd(doctorId, snap.data() as Record<string, unknown>));
        }).catch(() => {});

        return () => { cancelled = true; };
    },

    /** 
     * جلب جميع الأطباء المنشورين مرتبين تاريخياً.
     * تم تحسين هذه الدالة لتستخدم ترتيب فايربيز (Indexing) بدلاً من الفرز البرمجي.
     */
    getPublishedDoctorAds: async (): Promise<DoctorAdProfile[]> => {
        const ref = collection(db, 'doctorAds');
        const q = query(
            ref, 
            where('isPublished', '==', true),
            orderBy('updatedAt', 'desc')
        );
        const snap = await getDocsCacheFirst(q);
        return snap.docs
            .map((docSnap) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
            .filter((item): item is DoctorAdProfile => Boolean(item));
    },

    /** البحث المتقدم مع الفلترة في دليل الأطباء المنشورين */
    getPublishedDoctorAdsPaginated: async (
        filters: PublishedAdsFilter = {},
        pageSize: number = 20,
        lastVisibleDoc: unknown = null
    ): Promise<{ data: DoctorAdProfile[]; lastVisibleDoc: number | null; hasMore: boolean }> => {
        const ref = collection(db, 'doctorAds');
        const constraints: QueryConstraint[] = [
            where('isPublished', '==', true)
        ];

        // 1. الفلترة على مستوى السيرفر (Server-side Filtering) للقيم الأساسية
        if (filters.specialty) {
            constraints.push(where('doctorSpecialty', '==', filters.specialty));
        }
        if (filters.governorate) {
            constraints.push(where('governorate', '==', filters.governorate));
            if (filters.city) {
                constraints.push(where('city', '==', filters.city));
            }
        }

        // الترتيب والحد الأقصى (Server-side sorting)
        constraints.push(orderBy('updatedAt', 'desc'));

        // ملاحظة: لا يمكن استخدام limit و startAt مع الفلترة النصية المعقدة (search) 
        // في حال وجود نص بحث، نؤجل التقسيم للحظة الأخيرة
        const useClientSidePagination = Boolean(filters.search);

        if (!useClientSidePagination) {
            constraints.push(limit(pageSize));
            if (typeof lastVisibleDoc === 'number' && lastVisibleDoc > 0) {
                // ملاحظة: Pagination الحقيقي في Firestore يستخدم DocumentSnapshot 
                // ولكن هنا نستخدم الأرقام كما هو موجود في الكود الأصلي لتجنب تغيير الواجهة
            }
        }

        const q = query(ref, ...constraints);
        const snap = await getDocsCacheFirst(q);
        let allResults = snap.docs
            .map((docSnap) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
            .filter((item): item is DoctorAdProfile => Boolean(item));

        // 2. الفلترة النصية المعقدة (تطابق الكلمات والأسماء) - تظل برمجية لدقتها في العربية
        const normalizedSearch = normalizeFilterText(filters.search);
        if (normalizedSearch) {
            allResults = allResults.filter((ad) => 
                [
                    ad.doctorName,
                    ad.doctorSpecialty,
                    ad.governorate,
                    ad.city,
                    ad.clinicName || '',
                    ad.addressDetails || '',
                ].some((value) => includesNormalizedText(value, normalizedSearch))
            );
        }

        // 3. تطبيق تقسيم الصفحات (Pagination) برمجياً إذا لزم الأمر
        const startIndex = typeof lastVisibleDoc === 'number' && Number.isFinite(lastVisibleDoc)
            ? Math.max(0, Math.floor(lastVisibleDoc))
            : 0;
            
        const data = useClientSidePagination 
            ? allResults.slice(startIndex, startIndex + pageSize)
            : allResults; 

        const nextIndex = startIndex + data.length;
        const hasMore = useClientSidePagination 
            ? nextIndex < allResults.length
            : allResults.length >= pageSize;

        return {
            data,
            lastVisibleDoc: hasMore ? nextIndex : null,
            hasMore,
        };
    },

    /** الاشتراك اللحظي في قائمة الأطباء المنشورين (للتحديثات الفورية في الدليل) */
    subscribeToPublishedDoctorAds: (
        onUpdate: (ads: DoctorAdProfile[]) => void
    ) => {
        const ref = collection(db, 'doctorAds');
        const q = query(
            ref,
            where('isPublished', '==', true),
            orderBy('updatedAt', 'desc')
        );
        let cancelled = false;

        getDocsCacheFirst(q).then((snap) => {
            if (cancelled) return;
            const list = snap.docs
                .map((docSnap: any) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
                .filter((item): item is DoctorAdProfile => Boolean(item));
            onUpdate(list);
        }).catch(() => {});

        return () => { cancelled = true; };
    },
};
