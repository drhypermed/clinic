/**
 * ثوابت علامات السكرتارية الحيوية (Secretary Vitals Constants)
 *
 * المصدر الوحيد للحقيقة لكل الثوابت المتعلقة بحقول العلامات الحيوية
 * التي تُدخلها السكرتارية قبل دخول المريض على الطبيب.
 */

import type { SecretaryVitalKey } from '../../types';

/** النوع الكامل لحقل علامة حيوية (metadata) */
export type SecretaryVitalFieldMeta = {
    id: string;
    key: SecretaryVitalKey;
    label: string;
    shortLabel: string;
    unit: string;
    placeholder: string;
    inputType: 'text' | 'number';
    inputMode: 'text' | 'decimal';
    isReadOnly?: boolean;
};

export type SecretaryVitalsSpecialtyOptions = {
    doctorSpecialty?: string | null;
};

export const PEDIATRIC_SPECIALTY_LABEL = 'طب الأطفال وحديثي الولادة';
export const HEAD_CIRC_VITAL_KEY: SecretaryVitalKey = 'headCirc';

export const isPediatricSpecialtyForSecretaryVitals = (doctorSpecialty?: string | null): boolean =>
    String(doctorSpecialty || '').trim() === PEDIATRIC_SPECIALTY_LABEL;

export const isSecretaryVitalKeyAllowedForSpecialty = (
    key: SecretaryVitalKey,
    doctorSpecialty?: string | null
): boolean => key !== HEAD_CIRC_VITAL_KEY || isPediatricSpecialtyForSecretaryVitals(doctorSpecialty);

export const getSecretaryVitalKeysForSpecialty = (
    doctorSpecialty?: string | null
): SecretaryVitalKey[] =>
    SECRETARY_VITAL_KEYS.filter((key) => isSecretaryVitalKeyAllowedForSpecialty(key, doctorSpecialty));

/** كل مفاتيح العلامات الحيوية المدعومة — يحدد الترتيب الافتراضي */
export const SECRETARY_VITAL_KEYS: SecretaryVitalKey[] = [
    'weight',
    'height',
    'bmi',
    'rbs',
    'bp',
    'pulse',
    'temp',
    'spo2',
    'rr',
    'headCirc', // 🆕 محيط الرأس — للأطفال (الطبيب بيفعّله للسكرتاريه لو محتاج)
];

/** Set من المفاتيح للبحث السريع O(1) */
export const SECRETARY_VITAL_KEY_SET = new Set<string>(SECRETARY_VITAL_KEYS);

/** الحد الأقصى لطول قيمة حقل علامة حيوية */
export const SECRETARY_VITAL_MAX_VALUE_LENGTH = 24;

/** نمط regex للتحقق من صحة مفاتيح الحقول (حروف/أرقام/: _ -) */
export const SECRETARY_FIELD_KEY_PATTERN = /^[a-zA-Z0-9:_-]{1,96}$/;

/** إزاحة الترتيب للحقول المخصصة — تظهر بعد الحقول الأساسية */
export const SECRETARY_CUSTOM_ORDER_OFFSET = 1000;

/** بادئة مفاتيح الإشعارات */
export const SECRETARY_VITAL_NOTIFICATION_PREFIX = 'sv_';

/** تحويل مفتاح علامة حيوية إلى معرّف حقل موحّد (vital:...) */
export const toSecretaryVitalFieldId = (key: SecretaryVitalKey): string => `vital:${key}`;

/** تحويل معرّف حقل مخصص إلى الصيغة الموحّدة (custom:...) */
export const toSecretaryCustomFieldId = (customBoxId: string): string => {
    const normalized = String(customBoxId || '').trim();
    return normalized ? `custom:${normalized}` : '';
};

/** قائمة الحقول الافتراضية (metadata ثابتة) لكل مفتاح علامة حيوية */
export const SECRETARY_VITAL_FIELDS: SecretaryVitalFieldMeta[] = [
    {
        id: toSecretaryVitalFieldId('weight'),
        key: 'weight',
        label: 'الوزن',
        shortLabel: 'WT',
        unit: 'kg',
        placeholder: '70',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('height'),
        key: 'height',
        label: 'الطول',
        shortLabel: 'HT',
        unit: 'cm',
        placeholder: '170',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('bmi'),
        key: 'bmi',
        label: 'مؤشر الكتلة',
        shortLabel: 'BMI',
        unit: '',
        placeholder: '24.2',
        inputType: 'number',
        inputMode: 'decimal',
        isReadOnly: true,
    },
    {
        id: toSecretaryVitalFieldId('rbs'),
        key: 'rbs',
        label: 'سكر الدم',
        shortLabel: 'RBS',
        unit: 'mg/dl',
        placeholder: '110',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('bp'),
        key: 'bp',
        label: 'ضغط الدم',
        shortLabel: 'BP',
        unit: 'mmHg',
        placeholder: '120/80',
        inputType: 'text',
        inputMode: 'text',
    },
    {
        id: toSecretaryVitalFieldId('pulse'),
        key: 'pulse',
        label: 'النبض',
        shortLabel: 'Pulse',
        unit: 'bpm',
        placeholder: '72',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('temp'),
        key: 'temp',
        label: 'الحرارة',
        shortLabel: 'Temp',
        unit: '°C',
        placeholder: '37.0',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('spo2'),
        key: 'spo2',
        label: 'تشبع الاكسجين',
        shortLabel: 'SpO2',
        unit: '%',
        placeholder: '98',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        id: toSecretaryVitalFieldId('rr'),
        key: 'rr',
        label: 'معدل التنفس',
        shortLabel: 'RR',
        unit: '/min',
        placeholder: '18',
        inputType: 'number',
        inputMode: 'decimal',
    },
    {
        // 🆕 محيط الرأس — للأطفال. الطبيب بيفعّله من إعدادات الـvitals
        //   وممكن يخليه ظاهر للسكرتاريه عشان تسجله مع باقي القياسات.
        id: toSecretaryVitalFieldId('headCirc'),
        key: 'headCirc',
        label: 'محيط الرأس',
        shortLabel: 'HC',
        unit: 'cm',
        placeholder: '45',
        inputType: 'number',
        inputMode: 'decimal',
    },
];
