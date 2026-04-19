import { db, storage } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getDocCacheFirst } from './firestore/cacheFirst';
import {
    PrescriptionSettings, PrescriptionHeaderSettings, PrescriptionFooterSettings, VitalSignConfig, PaperSizeSettings
} from '../types';
import { branchDocKey } from './financial-data/normalizers';

/**
 * خدمة إعدادات الروشتة (Prescription Settings Service)
 * مسؤول عن إدارة شكل الروشتة (الهيدر والفوتر) وتخصيص العلامات الحيوية
 */

/** الإعدادات الافتراضية للهيدر (رأس الروشتة) */
const DEFAULT_HEADER: PrescriptionHeaderSettings = {
    doctorName: 'اسم الطبيب',
    degrees: ['الشهادة / الدرجة العلمية'],
    specialties: ['التخصصات / الخدمات']
};

/** الإعدادات الافتراضية للفوتر (تذييل الروشتة) */
const DEFAULT_FOOTER: PrescriptionFooterSettings = {
    address: 'عنوان العيادة',
    workingHours: 'مواعيد العمل',
    consultationPeriod: 'الاستشارة خلال 10 أيام',
    phoneNumber: '01000000000',
    whatsappNumber: '01000000000',
    socialMediaHandle: 'اسم الصفجة او الينك ',
    showSocialMedia: true
};

/** الإعدادات الافتراضية للعلامات الحيوية (Vitals) */
const DEFAULT_VITALS: VitalSignConfig[] = [
    { key: 'weight', label: 'Weight', labelAr: 'الوزن', unit: 'kg', enabled: true, order: 1 },
    { key: 'height', label: 'Height', labelAr: 'الطول', unit: 'cm', enabled: true, order: 2 },
    { key: 'bmi', label: 'BMI', labelAr: 'مؤشر الكتلة', unit: '', enabled: true, order: 3 },
    { key: 'rbs', label: 'RBS', labelAr: 'سكر الدم', unit: 'mg/dl', enabled: true, order: 4 },
    { key: 'bp', label: 'BP', labelAr: 'الضغط', unit: 'mmHg', enabled: true, order: 5 },
    { key: 'pulse', label: 'Pulse', labelAr: 'النبض', unit: 'bpm', enabled: true, order: 6 },
    { key: 'temp', label: 'Temp', labelAr: 'الحرارة', unit: '°C', enabled: true, order: 7 },
    { key: 'spo2', label: 'SpO2', labelAr: 'تشبع الأكسجين', unit: '%', enabled: true, order: 8 },
    { key: 'rr', label: 'RR', labelAr: 'التنفس', unit: '/min', enabled: true, order: 9 },
];

/** الإعداد الافتراضي لمقاس ورقة الروشتة */
const DEFAULT_PAPER_SIZE: PaperSizeSettings = {
    size: 'A5',
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
};

/**
 * الحصول على كائن الإعدادات الافتراضي بالكامل
 */
/** القيم الافتراضية لأحجام الخطوط والمسافات والألوان داخل الروشتة */
export const DEFAULT_TYPOGRAPHY = {
    medNamePx: 13,
    medInstPx: 12,
    notesPx: 12,
    notePx: 15,
    clinicalInfoPx: 8.5,
    rxSymbolPx: 20,
    rowMinHeightPx: 18,
    drugRowPaddingPx: 2,
    drugBorderWidthPx: 1,
    drugBorderColor: '#f1f5f9',
    sectionTitleColor: '#7f1d1d',
} as const;

export const getDefaultSettings = (): PrescriptionSettings => ({
    paperSize: { ...DEFAULT_PAPER_SIZE },
    typography: { ...DEFAULT_TYPOGRAPHY },
    header: { ...DEFAULT_HEADER },
    footer: { ...DEFAULT_FOOTER },
    vitals: DEFAULT_VITALS.map(v => ({ ...v })),
    updatedAt: Date.now()
});

const DATA_IMAGE_URL_RE = /^data:image\/[a-z0-9.+-]+;base64,/i;

const isDataImageUrl = (value: unknown): value is string => {
    return typeof value === 'string' && DATA_IMAGE_URL_RE.test(value.trim());
};

const normalizeDataImageUrl = (value: string): string => {
    return value.trim().replace(/\s+/g, '');
};

const normalizeDataImagePayload = (payload: string): string => {
    let normalizedPayload = String(payload || '').trim();

    // بعض المسارات القديمة قد تحفظ payload بشكل URL-encoded.
    try {
        if (/%[0-9a-f]{2}/i.test(normalizedPayload)) {
            normalizedPayload = decodeURIComponent(normalizedPayload);
        }
    } catch {
        // إذا فشل decode نكمل بالتنظيف النصي المباشر.
    }

    normalizedPayload = normalizedPayload
        .replace(/\s+/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/[^A-Za-z0-9+/=]/g, '');

    const padLength = (4 - (normalizedPayload.length % 4)) % 4;
    if (padLength > 0) {
        normalizedPayload += '='.repeat(padLength);
    }

    return normalizedPayload;
};

const normalizeDataImageUrlForStorage = (dataUrl: string): string => {
    const normalized = normalizeDataImageUrl(dataUrl);
    const match = normalized.match(/^data:([^;,]+);base64,(.*)$/i);
    if (!match) return normalized;

    const mimeType = String(match[1] || 'image/png').toLowerCase();
    const payload = normalizeDataImagePayload(match[2] || '');
    return `data:${mimeType};base64,${payload}`;
};

const getExtensionFromMimeType = (mimeType: string): string => {
    const normalized = String(mimeType || 'image/png').toLowerCase();
    if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
    if (normalized.includes('webp')) return 'webp';
    if (normalized.includes('gif')) return 'gif';
    return 'png';
};

const getMimeTypeFromDataUrl = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:([^;,]+)(;base64)?,/i);
    return match?.[1] ? match[1].toLowerCase() : 'image/png';
};

const uploadSettingsImageDataUrl = async (
    userId: string,
    slot: 'header-logo' | 'header-bg' | 'footer-logo' | 'footer-bg' | 'middle-bg',
    dataUrl: string
): Promise<string> => {
    const normalizedDataUrl = normalizeDataImageUrlForStorage(dataUrl);
    if (!isDataImageUrl(normalizedDataUrl)) {
        throw new Error('Invalid image data URL');
    }

    const mimeType = getMimeTypeFromDataUrl(normalizedDataUrl);
    const extension = getExtensionFromMimeType(mimeType);
    const fileName = `${slot}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const objectPath = `users/${userId}/profile/${fileName}`;
    const storageRef = ref(storage, objectPath);

    try {
        // uploadString with data_url هو المسار الأنسب لصور Base64 ويجنب مشاكل ERR_INVALID_URL/atob.
        const snapshot = await uploadString(storageRef, normalizedDataUrl, 'data_url');
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown-upload-error';
        throw new Error(`[PrescriptionSettings] Invalid image data in slot "${slot}": ${message}`);
    }
};

const persistImageFieldSafely = async (
    userId: string,
    slot: 'header-logo' | 'header-bg' | 'footer-logo' | 'footer-bg' | 'middle-bg',
    value?: string
): Promise<string | undefined> => {
    if (!value || !isDataImageUrl(value)) return value;

    try {
        return await uploadSettingsImageDataUrl(userId, slot, value);
    } catch {
        // فشل رفع الصورة — نحتفظ بالقيمة الأصلية بدلاً من حذفها
        // حتى لا يفقد الطبيب الصورة بصمت عند ضعف الشبكة.
        return value;
    }
};

const persistSettingsImagesToCloud = async (
    userId: string,
    settings: PrescriptionSettings
): Promise<PrescriptionSettings> => {
    const nextSettings = JSON.parse(JSON.stringify(settings || {})) as PrescriptionSettings;

    if (nextSettings.header) {
        nextSettings.header.logoBase64 = await persistImageFieldSafely(userId, 'header-logo', nextSettings.header.logoBase64);
        nextSettings.header.headerBackgroundImage = await persistImageFieldSafely(userId, 'header-bg', nextSettings.header.headerBackgroundImage);
    }

    if (nextSettings.footer) {
        nextSettings.footer.logoBase64 = await persistImageFieldSafely(userId, 'footer-logo', nextSettings.footer.logoBase64);
        nextSettings.footer.footerBackgroundImage = await persistImageFieldSafely(userId, 'footer-bg', nextSettings.footer.footerBackgroundImage);
    }

    if (nextSettings.middle) {
        nextSettings.middle.middleBackgroundImage = await persistImageFieldSafely(userId, 'middle-bg', nextSettings.middle.middleBackgroundImage);
    }

    return nextSettings;
};

export const prescriptionSettingsService = {
    /**
     * الاشتراك اللحظي في إعدادات الروشتة مع (Smart Cache).
     * يضمن ظهور الهيدر والفوتر واللوجو فوراً من الكاش لسرعة الطباعة.
     */
    subscribeToSettings: (
        userId: string,
        onUpdate: (settings: PrescriptionSettings) => void,
        onError?: (error: string) => void,
        branchId?: string,
    ) => {
        const settingsRef = doc(db, 'users', userId, 'settings', branchDocKey('prescription', branchId));
        let cancelled = false;

        getDocCacheFirst(settingsRef).then((snapshot) => {
            if (cancelled) return;
            if (snapshot.exists()) {
                const data = snapshot.data() as PrescriptionSettings;
                onUpdate(data);
            } else {
                onUpdate(getDefaultSettings());
            }
        }).catch((error) => {
            if (cancelled) return;
            console.error('[PrescriptionSettings] Error reading settings:', error);
            if (onError) onError(error?.message || 'Unknown error');
            onUpdate(getDefaultSettings());
        });

        return () => { cancelled = true; };
    },

    /**
     * حفظ إعدادات الروشتة في Firestore
     * تتضمن الوظيفة "تطهير" البيانات (Sanitize) لإزالة أي قيم undefined غير مدعومة في Firestore
     */
    saveSettings: async (userId: string, settings: PrescriptionSettings, branchId?: string): Promise<void> => {
        console.log('[PrescriptionSettings] Saving settings for user:', userId);
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const settingsRef = doc(db, 'users', userId, 'settings', branchDocKey('prescription', branchId));

            /**
             * وظيفة مساعدة لتحويل أي undefined إلى null لأن Firestore لا يدعم undefined
             */
            const sanitize = (obj: any): any => {
                return JSON.parse(JSON.stringify(obj, (_key, value) => {
                    return value === undefined ? null : value;
                }));
            };

            // ارفع صور الإعدادات إلى Firebase Storage أولاً ثم خزّن روابطها في Firestore.
            const settingsWithCloudImages = await persistSettingsImagesToCloud(userId, settings);

            const dataToSave = {
                ...sanitize(settingsWithCloudImages),
                updatedAt: Date.now()
            };

            await setDoc(settingsRef, dataToSave);
            console.log('[PrescriptionSettings] Settings saved successfully');
        } catch (error) {
            console.error('[PrescriptionSettings] Error saving settings:', error);
            throw error;
        }
    },

    /**
     * جلب الإعدادات مرة واحدة فقط (بدون اشتراك مستمر)
     */
    getSettings: async (userId: string, branchId?: string): Promise<PrescriptionSettings> => {
        try {
            const settingsRef = doc(db, 'users', userId, 'settings', branchDocKey('prescription', branchId));
            const snapshot = await getDocCacheFirst(settingsRef);

            if (snapshot.exists()) {
                return snapshot.data() as PrescriptionSettings;
            }
            return getDefaultSettings();
        } catch (error) {
            console.error('[PrescriptionSettings] Error getting settings:', error);
            return getDefaultSettings();
        }
    }
};
