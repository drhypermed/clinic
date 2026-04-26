/**
 * تفضيلات تقرير المريض (Report Preferences) — التخزين السحابي
 *
 * تحفظ إعدادات التقرير الطبي (اللغة، حجم الورق، حجم الخط) في
 * `users/{uid}/settings/reportPreferences`، بحيث الدكتور لو فتح الحساب من
 * جهاز تاني يلاقي نفس الإعدادات.
 *
 * الاستراتيجية:
 *   - الكتابة: `setDoc(..., { merge: true })` + `localStorage` كـ mirror سريع.
 *   - القراءة: `getDocCacheFirst` — يرجّع فوري من الكاش، ثم يحدّث من السيرفر
 *     في الخلفية؛ لو مفيش قيم نستخدم اللي في `localStorage`، ولو مفيش نرجّع `null`.
 */

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst } from '../firestore/cacheFirst';

type ReportLanguagePref = 'ar' | 'en';
type ReportPageSizePref = 'A4' | 'A5';

interface ReportPreferences {
    language: ReportLanguagePref;
    pageSize: ReportPageSizePref;
    fontSize: number;
}

const REPORT_PREFS_DOC_ID = 'reportPreferences';
const LS_KEYS = {
    language: 'dh_report_language',
    pageSize: 'dh_report_pageSize',
    fontSize: 'dh_report_fontSize',
} as const;

const DEFAULTS: ReportPreferences = {
    language: 'ar',
    pageSize: 'A5',
    fontSize: 13,
};

const clampFontSize = (value: unknown): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULTS.fontSize;
    return Math.max(10, Math.min(22, Math.round(parsed)));
};

const normalizePrefs = (raw: Partial<ReportPreferences> | null | undefined): ReportPreferences => {
    const lang = raw?.language === 'en' ? 'en' : 'ar';
    const pageSize = raw?.pageSize === 'A4' ? 'A4' : 'A5';
    return {
        language: lang,
        pageSize,
        fontSize: clampFontSize(raw?.fontSize),
    };
};

/** قراءة الإعدادات المحفوظة محلياً (احتياطي سريع لحد ما يرجع الكاش من Firestore) */
export const readReportPreferencesFromLocalStorage = (): Partial<ReportPreferences> => {
    if (typeof window === 'undefined') return {};
    try {
        const language = window.localStorage.getItem(LS_KEYS.language);
        const pageSize = window.localStorage.getItem(LS_KEYS.pageSize);
        const fontSize = window.localStorage.getItem(LS_KEYS.fontSize);
        const partial: Partial<ReportPreferences> = {};
        if (language === 'ar' || language === 'en') partial.language = language;
        if (pageSize === 'A4' || pageSize === 'A5') partial.pageSize = pageSize;
        if (fontSize != null) {
            const parsed = Number(fontSize);
            if (Number.isFinite(parsed)) partial.fontSize = Math.round(parsed);
        }
        return partial;
    } catch {
        return {};
    }
};

/** قراءة الإعدادات من Firestore (cache-first) */
export const loadReportPreferences = async (userId: string): Promise<ReportPreferences | null> => {
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) return null;

    try {
        const ref = doc(db, 'users', trimmedUserId, 'settings', REPORT_PREFS_DOC_ID);
        const snap = await getDocCacheFirst(ref);
        if (!snap.exists()) return null;
        const data = snap.data() as Partial<ReportPreferences>;
        return normalizePrefs(data);
    } catch (error) {
        console.error('Error loading report preferences from Firestore:', error);
        return null;
    }
};

/** حفظ الإعدادات في Firestore + localStorage */
export const saveReportPreferences = async (
    userId: string,
    prefs: ReportPreferences
): Promise<ReportPreferences> => {
    const normalized = normalizePrefs(prefs);

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(LS_KEYS.language, normalized.language);
            window.localStorage.setItem(LS_KEYS.pageSize, normalized.pageSize);
            window.localStorage.setItem(LS_KEYS.fontSize, String(normalized.fontSize));
        } catch {
            /* ignore localStorage errors */
        }
    }

    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) return normalized;

    try {
        const ref = doc(db, 'users', trimmedUserId, 'settings', REPORT_PREFS_DOC_ID);
        await setDoc(
            ref,
            {
                language: normalized.language,
                pageSize: normalized.pageSize,
                fontSize: normalized.fontSize,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error saving report preferences to Firestore:', error);
    }

    return normalized;
};

export const getDefaultReportPreferences = (): ReportPreferences => ({ ...DEFAULTS });
