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
    startAfter,
    documentId,
    QueryConstraint,
    getDoc,
    getDocs,
} from 'firebase/firestore';
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

const SEARCH_INDEX_TOKEN_LIMIT = 120;
const SEARCH_QUERY_TOKEN_LIMIT = 10;
const LEGACY_SEARCH_FALLBACK_LIMIT = 30;
const MAX_SEARCH_PREFIX_LENGTH = 14;
const MIN_SEARCH_TOKEN_LENGTH = 2;
const ARABIC_DIACRITICS_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const NON_SEARCH_TEXT_RE = /[^\p{L}\p{N}\s]+/gu;

const normalizeFilterText = (value: unknown): string => normalizeText(value).toLowerCase();

const normalizeDirectorySearchText = (value: unknown): string => {
    return normalizeFilterText(value)
        .replace(ARABIC_DIACRITICS_RE, '')
        .replace(/\u0640/g, '')
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(NON_SEARCH_TEXT_RE, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const pushUniqueSearchToken = (tokens: string[], token: string): void => {
    const normalized = token.trim();
    if (normalized.length < MIN_SEARCH_TOKEN_LENGTH || normalized === 'ال') return;
    if (!tokens.includes(normalized)) tokens.push(normalized);
};

const getSearchTermVariants = (term: string): string[] => {
    if (term.startsWith('ال') && term.length > 3) {
        return [term, term.slice(2)];
    }
    return [term];
};

const addSearchTermWithPrefixes = (tokens: string[], term: string): void => {
    getSearchTermVariants(term).forEach((variant) => {
        pushUniqueSearchToken(tokens, variant);
        const maxPrefixLength = Math.min(variant.length, MAX_SEARCH_PREFIX_LENGTH);
        for (let index = MIN_SEARCH_TOKEN_LENGTH; index <= maxPrefixLength; index += 1) {
            pushUniqueSearchToken(tokens, variant.slice(0, index));
        }
    });
};

const getDirectorySearchTerms = (value: unknown): string[] => {
    return normalizeDirectorySearchText(value)
        .split(' ')
        .map((item) => item.trim())
        .filter((item) => item.length >= MIN_SEARCH_TOKEN_LENGTH && item !== 'ال');
};

const addSearchValueTokens = (tokens: string[], value: unknown): void => {
    const normalized = normalizeDirectorySearchText(value);
    if (!normalized) return;

    if (normalized.length <= 60) {
        pushUniqueSearchToken(tokens, normalized);
    }

    const compact = normalized.replace(/\s+/g, '');
    if (compact !== normalized && compact.length <= 60) {
        pushUniqueSearchToken(tokens, compact);
    }

    getDirectorySearchTerms(normalized).forEach((term) => {
        addSearchTermWithPrefixes(tokens, term);
    });
};

const buildDoctorAdSearchTokens = (ad: Partial<DoctorAdProfile>): string[] => {
    const tokens: string[] = [];
    const values: unknown[] = [
        ad.doctorName,
        ad.doctorSpecialty,
        ad.academicDegree,
        ad.subSpecialties,
        ad.featuredServicesSummary,
        ad.workplace,
        ad.extraInfo,
        ad.clinicName,
        ad.bio,
        ad.governorate,
        ad.city,
        ad.addressDetails,
        ...(Array.isArray(ad.services) ? ad.services : []),
        ...(Array.isArray(ad.clinicServices) ? ad.clinicServices.map((item) => item.name) : []),
    ];

    if (Array.isArray(ad.branches)) {
        ad.branches.forEach((branch) => {
            values.push(
                branch.name,
                branch.governorate,
                branch.city,
                branch.addressDetails,
                branch.contactPhone,
                branch.whatsapp,
                ...(Array.isArray(branch.clinicServices) ? branch.clinicServices.map((item) => item.name) : []),
            );
        });
    }

    values.forEach((value) => {
        if (tokens.length < SEARCH_INDEX_TOKEN_LIMIT) {
            addSearchValueTokens(tokens, value);
        }
    });

    return tokens.slice(0, SEARCH_INDEX_TOKEN_LIMIT);
};

const buildSearchQueryTokens = (search: unknown): string[] => {
    const tokens: string[] = [];
    addSearchValueTokens(tokens, search);
    return tokens.slice(0, SEARCH_QUERY_TOKEN_LIMIT);
};

const buildDoctorAdSearchHaystack = (ad: DoctorAdProfile): string => {
    const values: unknown[] = [
        ad.doctorName,
        ad.doctorSpecialty,
        ad.academicDegree,
        ad.subSpecialties,
        ad.featuredServicesSummary,
        ad.workplace,
        ad.extraInfo,
        ad.clinicName,
        ad.bio,
        ad.governorate,
        ad.city,
        ad.addressDetails,
        ...(Array.isArray(ad.services) ? ad.services : []),
        ...(Array.isArray(ad.clinicServices) ? ad.clinicServices.map((item) => item.name) : []),
    ];

    if (Array.isArray(ad.branches)) {
        ad.branches.forEach((branch) => {
            values.push(
                branch.name,
                branch.governorate,
                branch.city,
                branch.addressDetails,
                ...(Array.isArray(branch.clinicServices) ? branch.clinicServices.map((item) => item.name) : []),
            );
        });
    }

    return normalizeDirectorySearchText(values.join(' '));
};

const doctorMatchesSearch = (ad: DoctorAdProfile, normalizedSearch: string): boolean => {
    if (!normalizedSearch) return true;
    const haystack = buildDoctorAdSearchHaystack(ad);
    if (haystack.includes(normalizedSearch)) return true;

    const compactNeedle = normalizedSearch.replace(/\s+/g, '');
    const compactHaystack = haystack.replace(/\s+/g, '');
    if (compactNeedle.length >= MIN_SEARCH_TOKEN_LENGTH && compactHaystack.includes(compactNeedle)) {
        return true;
    }

    const terms = getDirectorySearchTerms(normalizedSearch);
    if (terms.length === 0) return false;
    return terms.every((term) => getSearchTermVariants(term).some((variant) => haystack.includes(variant)));
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

    // الفروع — الـfix الأساسي للـbug. قبل كده كانت بتترجع undefined دايمًا
    // حتى لو محفوظه في Firestore، فالـUI كان بيستخدم النسخه القديمه من فرع واحد.
    const branchesRaw = Array.isArray(data.branches) ? data.branches : [];
    const normalizedBranches = branchesRaw.map((item, index) => sanitizeDoctorAdBranch(item, index));
    
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
        // الفروع — لو المستند فيه branches، بنرجّعها؛ لو فاضي (إعلان قديم)
        // الـUI هيبني فرع افتراضي من الحقول القديمه عبر migrateLegacyFieldsToBranch.
        branches: normalizedBranches.length > 0 ? normalizedBranches : undefined,
    };
};

/**
 * تطهير فرع واحد — نستخدمها في الحالتين:
 * • وقت القراءه من Firestore (البيانات جايه كـunknown) لتحويلها لـshape صحيح
 * • وقت الحفظ (البيانات جايه typed من الـUI) لتنظيفها قبل Firestore
 * حلّ bug كانت الفروع بتتضاع كلها لما Doctor يحفظ إعلانه — لأن السطرين دول
 * في الأصل ما كانوش بيعرفوا branches خالص.
 */
const sanitizeDoctorAdBranch = (item: unknown, index: number) => {
    const b = (item ?? {}) as Record<string, unknown>;
    const scheduleRaw = Array.isArray(b.clinicSchedule) ? b.clinicSchedule : [];
    const servicesRaw = Array.isArray(b.clinicServices) ? b.clinicServices : [];
    const imagesRaw = Array.isArray(b.imageUrls) ? b.imageUrls : [];
    return {
        id: toNonEmptyString(b.id) || `branch-${index + 1}`,
        name: toNonEmptyString(b.name) || `فرع ${index + 1}`,
        governorate: toNonEmptyString(b.governorate),
        city: toNonEmptyString(b.city),
        addressDetails: toNonEmptyString(b.addressDetails),
        contactPhone: toNonEmptyString(b.contactPhone),
        whatsapp: toNonEmptyString(b.whatsapp),
        clinicSchedule: scheduleRaw
            .map((row) => {
                const r = (row ?? {}) as Record<string, unknown>;
                return {
                    id: toNonEmptyString(r.id),
                    day: toNonEmptyString(r.day),
                    from: toNonEmptyString(r.from),
                    to: toNonEmptyString(r.to),
                    notes: toNonEmptyString(r.notes),
                };
            })
            .filter((r) => r.id && r.day),
        clinicServices: servicesRaw
            .map((row, i) => {
                const r = (row ?? {}) as Record<string, unknown>;
                return {
                    id: toNonEmptyString(r.id) || `service-${i + 1}`,
                    name: toNonEmptyString(r.name),
                    price: toNumberOrNull(r.price),
                    discountedPrice: toNumberOrNull(r.discountedPrice),
                };
            })
            .filter((r) => r.name),
        examinationPrice: toNumberOrNull(b.examinationPrice),
        discountedExaminationPrice: toNumberOrNull(b.discountedExaminationPrice),
        consultationPrice: toNumberOrNull(b.consultationPrice),
        discountedConsultationPrice: toNumberOrNull(b.discountedConsultationPrice),
        imageUrls: imagesRaw.map((url) => toNonEmptyString(url)).filter(Boolean),
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

    // تطهير كل الفروع — الـfix الأساسي للـbug. قبل كده كان الـfield ده
    // بيتحذف من الـpayload قبل الحفظ، فالدكتور بيفقد كل الفروع ما عدا الأوّل.
    const branchesPrepared = Array.isArray(payload.branches)
        ? payload.branches.map((b, index) => sanitizeDoctorAdBranch(b, index))
        : [];
    const doctorNamePrepared = toNonEmptyString(payload.doctorName);
    const doctorSpecialtyPrepared = toNonEmptyString(payload.doctorSpecialty);
    const academicDegreePrepared = toNonEmptyString(payload.academicDegree);
    const subSpecialtiesPrepared = toNonEmptyString(payload.subSpecialties);
    const featuredServicesSummaryPrepared = toNonEmptyString(payload.featuredServicesSummary);
    const workplacePrepared = toNonEmptyString(payload.workplace);
    const extraInfoPrepared = toNonEmptyString(payload.extraInfo);
    const profileImagePrepared = toNonEmptyString(payload.profileImage);
    const clinicNamePrepared = toNonEmptyString(payload.clinicName);
    const bioPrepared = toNonEmptyString(payload.bio);
    const governoratePrepared = toNonEmptyString(payload.governorate);
    const cityPrepared = toNonEmptyString(payload.city);
    const addressDetailsPrepared = toNonEmptyString(payload.addressDetails);
    const contactPhonePrepared = toNonEmptyString(payload.contactPhone);
    const whatsappPrepared = toNonEmptyString(payload.whatsapp);
    const socialMediaPlatformPrepared = toNonEmptyString(payload.socialMediaPlatform);
    const socialMediaUrlPrepared = toNonEmptyString(payload.socialMediaUrl);
    const publicSlugPrepared = toNonEmptyString(payload.publicSlug);
    const imageUrlsPrepared = Array.isArray(payload.imageUrls)
        ? payload.imageUrls.map((item) => toNonEmptyString(item)).filter(Boolean)
        : [];
    const searchTokens = buildDoctorAdSearchTokens({
        doctorName: doctorNamePrepared,
        doctorSpecialty: doctorSpecialtyPrepared,
        academicDegree: academicDegreePrepared,
        subSpecialties: subSpecialtiesPrepared,
        featuredServicesSummary: featuredServicesSummaryPrepared,
        workplace: workplacePrepared,
        extraInfo: extraInfoPrepared,
        clinicName: clinicNamePrepared,
        bio: bioPrepared,
        governorate: governoratePrepared,
        city: cityPrepared,
        addressDetails: addressDetailsPrepared,
        clinicServices: clinicServicesPrepared,
        services: servicesPrepared,
        branches: branchesPrepared,
    });

    return {
        doctorName: doctorNamePrepared,
        doctorSpecialty: doctorSpecialtyPrepared,
        specialtyKey: normalizeDirectorySearchText(doctorSpecialtyPrepared),
        academicDegree: academicDegreePrepared,
        subSpecialties: subSpecialtiesPrepared,
        featuredServicesSummary: featuredServicesSummaryPrepared,
        workplace: workplacePrepared,
        extraInfo: extraInfoPrepared,
        profileImage: profileImagePrepared,
        clinicName: clinicNamePrepared,
        bio: bioPrepared,
        governorate: governoratePrepared,
        governorateKey: normalizeDirectorySearchText(governoratePrepared),
        city: cityPrepared,
        cityKey: normalizeDirectorySearchText(cityPrepared),
        addressDetails: addressDetailsPrepared,
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
        imageUrls: imageUrlsPrepared,
        contactPhone: contactPhonePrepared,
        whatsapp: whatsappPrepared,
        socialLinks: Array.isArray(payload.socialLinks)
            ? payload.socialLinks
                .map((item, index) => ({
                    id: toNonEmptyString(item.id) || `social-${index + 1}`,
                    platform: toNonEmptyString(item.platform),
                    url: toNonEmptyString(item.url),
                }))
                .filter((item) => item.platform && item.url)
            : [],
        socialMediaPlatform: socialMediaPlatformPrepared,
        socialMediaUrl: socialMediaUrlPrepared,
        yearsExperience: toNumberOrNull(payload.yearsExperience),
        publicSlug: publicSlugPrepared,
        isPublished: Boolean(payload.isPublished),
        createdAt: toNonEmptyString(payload.createdAt) || nowIso,
        updatedAt: nowIso,
        searchTokens,
        // الفروع — دي الحقل الرئيسي الجديد للإعلانات اللي فيها أكتر من فرع.
        // ملاحظه: الحقول فوق (governorate, city, clinicSchedule ...) بتجي من
        // الـUI نفسه (useDoctorAdvertisementController.ts:354-366) اللي بينسخ
        // قيم أول فرع للحقول العليا قبل الحفظ. لو في caller جديد بيستخدم
        // الـservice ده مباشرة، لازم يعمل نفس النسخ — وإلا الفلتر بـgovernorate/city
        // في الدليل العام مش هيلاقي الدكتور.
        branches: branchesPrepared,
    };
};

export const doctorAdsService = {
    /**
     * جلب بيانات الإعلان الطبيب يدوياً.
     * بنستخدم getDoc (مش cache-first) عشان لو الطبيب لسه حافظ تحديث،
     * يلاقي آخر نسخة مش النسخة القديمة من الكاش.
     */
    getDoctorAdByDoctorId: async (doctorId: string): Promise<DoctorAdProfile | null> => {
        const ref = doc(db, 'doctorAds', doctorId);
        const snap = await getDoc(ref);
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

    /**
     * الاشتراك اللحظي في بيانات ملف الطبيب.
     * بنستخدم getDoc فريش بدل cache-first عشان أي تحديث يظهر فوراً
     * بدل ما الطبيب يلاقي بياناته القديمة بعد ما حفظ.
     */
    subscribeToDoctorAd: (
        doctorId: string,
        onUpdate: (ad: DoctorAdProfile | null) => void
    ) => {
        const ref = doc(db, 'doctorAds', doctorId);
        let cancelled = false;

        getDoc(ref).then((snap) => {
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
     * بنستخدم getDocs (مش cache-first) عشان لما الطبيب يحدّث إعلانه
     * ويدخل الدليل العام يلاقي التحديث ظاهر مباشرة.
     */
    getPublishedDoctorAds: async (): Promise<DoctorAdProfile[]> => {
        const ref = collection(db, 'doctorAds');
        const q = query(
            ref,
            where('isPublished', '==', true),
            orderBy('updatedAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs
            .map((docSnap) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
            .filter((item): item is DoctorAdProfile => Boolean(item));
    },

    /**
     * البحث المتقدم مع الفلترة في دليل الأطباء المنشورين.
     *
     * الـcursor (lastVisibleDoc) = JSON string بشكل مختلف حسب النوع:
     *  • بحث نصّي (client-side pagination) → '{"o":20}' حيث o = offset.
     *  • مفيش بحث (server-side pagination) → '{"u":"2026-04-22T...","d":"docId"}'
     *    حيث u = updatedAt للدكتور الأخير، d = documentId للـtiebreaker.
     *
     * ليه tiebreaker؟ لو دكتورين حفظوا في نفس الـmillisecond بالظبط،
     * `startAfter(updatedAt)` لوحده كان بيتخطّى واحد منهم. بإضافة docId
     * كحقل تاني للترتيب + للـcursor، الترتيب بقى deterministic 100%.
     *
     * ليه limit(pageSize + 1)؟ الـtrick بيحدد بدقّة لو فيه صفحه جايه:
     * لو رجع pageSize+1 = فيه أكتر، نرمي الزيادة. لو رجع ≤ pageSize = خلصت.
     * بدل ما نرجّع `hasMore=true` غلط لما العدد الكلّي = مضاعف pageSize بالظبط.
     */
    getPublishedDoctorAdsPaginated: async (
        filters: PublishedAdsFilter = {},
        pageSize: number = 20,
        lastVisibleDoc: string | null = null
    ): Promise<{ data: DoctorAdProfile[]; lastVisibleDoc: string | null; hasMore: boolean }> => {
        const ref = collection(db, 'doctorAds');
        const hasCursor = typeof lastVisibleDoc === 'string' && lastVisibleDoc.length > 0;
        const normalizedSearch = normalizeDirectorySearchText(filters.search);
        const searchQueryTokens = normalizedSearch ? buildSearchQueryTokens(filters.search) : [];

        const parsedCursor: { u?: string; d?: string; o?: number } | null = hasCursor
            ? (() => { try { return JSON.parse(lastVisibleDoc as string); } catch { return null; } })()
            : null;

        const buildConstraints = (includeSearchIndex: boolean, resultLimit: number): QueryConstraint[] => {
            const constraints: QueryConstraint[] = [
                where('isPublished', '==', true)
            ];

            if (filters.specialty) {
                constraints.push(where('doctorSpecialty', '==', filters.specialty));
            }
            if (filters.governorate) {
                constraints.push(where('governorate', '==', filters.governorate));
                if (filters.city) {
                    constraints.push(where('city', '==', filters.city));
                }
            }
            if (includeSearchIndex && searchQueryTokens.length > 0) {
                constraints.push(where('searchTokens', 'array-contains-any', searchQueryTokens));
            }

            constraints.push(orderBy('updatedAt', 'desc'));
            constraints.push(orderBy(documentId(), 'desc'));
            if (parsedCursor?.u && parsedCursor?.d) {
                constraints.push(startAfter(parsedCursor.u, parsedCursor.d));
            }
            constraints.push(limit(resultLimit));
            return constraints;
        };

        const buildLegacySearchFallback = async () => {
            const fallbackSnap = await getDocs(query(
                ref,
                ...buildConstraints(false, LEGACY_SEARCH_FALLBACK_LIMIT)
            ));
            const data = fallbackSnap.docs
                .map((docSnap) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
                .filter((item): item is DoctorAdProfile => Boolean(item))
                .filter((ad) => doctorMatchesSearch(ad, normalizedSearch))
                .slice(0, pageSize);

            return {
                data,
                lastVisibleDoc: null,
                hasMore: false,
            };
        };

        let snap;
        try {
            snap = await getDocs(query(
                ref,
                ...buildConstraints(searchQueryTokens.length > 0, pageSize + 1)
            ));
        } catch (error) {
            if (!normalizedSearch) throw error;
            return buildLegacySearchFallback();
        }

        if (normalizedSearch && snap.empty && !hasCursor) {
            return buildLegacySearchFallback();
        }

        const hasMore = snap.docs.length > pageSize;
        const pageDocs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;
        let data = pageDocs
            .map((docSnap) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
            .filter((item): item is DoctorAdProfile => Boolean(item));

        if (normalizedSearch) {
            data = data.filter((ad) => doctorMatchesSearch(ad, normalizedSearch));
        }

        const cursorDoc = hasMore ? pageDocs[pageDocs.length - 1] : null;
        const cursorData = cursorDoc ? (cursorDoc.data() as Record<string, unknown>) : null;
        const lastUpdatedAt = cursorData ? toNonEmptyString(cursorData.updatedAt) : '';
        const lastDocId = cursorDoc?.id || '';
        return {
            data,
            lastVisibleDoc: hasMore && lastUpdatedAt && lastDocId
                ? JSON.stringify({ u: lastUpdatedAt, d: lastDocId })
                : null,
            hasMore,
        };
    },

    /** جلب قائمة الأطباء المنشورين (للتحديثات الفورية في الدليل) — بيجيب من السيرفر مباشرة. */
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

        getDocs(q).then((snap) => {
            if (cancelled) return;
            const list = snap.docs
                .map((docSnap: any) => normalizeDoctorAd(docSnap.id, docSnap.data() as Record<string, unknown>))
                .filter((item): item is DoctorAdProfile => Boolean(item));
            onUpdate(list);
        }).catch(() => {});

        return () => { cancelled = true; };
    },

    /**
     * جلب طبيب واحد عن طريق الـpublicSlug (URL صديق للSEO).
     * بنستخدمها في صفحه /dr/:slug — القراءه الوحيده = مطابقه بالـindex.
     * لو مفيش طبيب بالـslug ده → بنرجع null.
     */
    getDoctorByPublicSlug: async (slug: string): Promise<DoctorAdProfile | null> => {
        if (!slug) return null;
        const ref = collection(db, 'doctorAds');
        const q = query(
            ref,
            where('isPublished', '==', true),
            where('publicSlug', '==', slug),
            limit(1),
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const first = snap.docs[0];
        return normalizeDoctorAd(first.id, first.data() as Record<string, unknown>);
    },
};
