import { PrescriptionItem } from '../../types';
export { getCairoDayKey } from '../../utils/cairoTime';

export const SMART_QUOTA_NOTICE_STORAGE_KEY = 'dr_hyper_smart_quota_notice';

// Helper to parse numbers including Arabic numerals
const parseNum = (str: string | number): string => {
    if (typeof str === 'number') return str.toString();
    if (!str) return '';
    const englishStr = str.toString().replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
    // Return as string to keep state type consistent (React state is string for inputs usually)
    return englishStr;
};

/** تنظيف القيم المفقودة والدوال والقيم غير الصالحة من Firestore */
export function sanitizeForFirestore(value: unknown): unknown {
    if (value === undefined || typeof value === 'function') return undefined;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return (Number.isFinite(value) ? value : null);
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.map(sanitizeForFirestore).filter(v => v !== undefined);
    if (typeof value === 'object' && value !== null) {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            const cleaned = sanitizeForFirestore(v);
            if (cleaned !== undefined) out[k] = cleaned;
        }
        return out;
    }
    return undefined;
}

export function sanitizeRxItemsForSave(items: PrescriptionItem[]): PrescriptionItem[] {
    return items
        .filter(item => {
            if (item.type === 'note') return !!item.instructions?.trim();
            return !!item.medication;
        })
        .map(item => {
            if (item.medication) {
                const { calculationRule, ...medicationData } = item.medication;
                return { ...item, medication: medicationData as any };
            }
            return item;
        });
}

function normalizeArabicSearchText(text: string): string {
    return String(text || '')
        .toLowerCase()
        .replace(/[ء آ أ ؤ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ّ/g, '')
        .replace(/َ/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function uniqTextList(items: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of items) {
        const value = String(raw || '').trim();
        if (!value) continue;
        const key = normalizeArabicSearchText(value);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(value);
    }
    return out;
}

