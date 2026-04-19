import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getDocCacheFirst } from './firestore/cacheFirst';
import { SystemRequestContact, SystemRequestContactIcon, SystemRequestLineSettings, SystemRequestLineStyle } from '../types';

/**
 * خدمة سطر طلب النظام (System Request Line Service)
 * هذا السطر يظهر غالباً في أسفل الروشتة المطبوعة أو في واجهات معينة
 * ويحتوي على رسالة ترويجية ووسائل تواصل لطلب نظام إدارة العيادات.
 */

export const SYSTEM_REQUEST_LINE_DOC_PATH = ['settings', 'prescriptionFooterLine'] as const;

/** خيارات الأيقونات المتاحة لوسائل التواصل */
export const SYSTEM_REQUEST_ICON_OPTIONS: Array<{ value: SystemRequestContactIcon; label: string }> = [
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'instagram', label: 'انستجرام' },
  { value: 'telegram', label: 'تليجرام' },
  { value: 'phone', label: 'هاتف' },
  { value: 'link', label: 'رابط' },
  { value: 'custom', label: 'مخصص' },
];

/** التصميم الافتراضي للخط في سطر الطلب */
const DEFAULT_LINE_STYLE: SystemRequestLineStyle = {
  fontFamily: 'sans-serif',
  fontWeight: '800',
  fontSize: 10,
  textColor: '#1e293b',
};

/** وظيفة مساعدة لضمان وجود قيمة للون */
const normalizeColor = (value: any, fallback: string) => {
  const text = (value || '').toString().trim();
  return text || fallback;
};

/**
 * حد أقصى لعدد وسائل التواصل في السطر السفلي — يمنع تضخم المستند
 * وكسر تخطيط الفوتر في حال أضاف الأدمن عشرات الروابط.
 */
const MAX_CONTACTS_PER_FOOTER = 10;

/**
 * فحص الـ URL — يقبل فقط بروتوكولات آمنة معروفة ويرفض `javascript:` و `data:`.
 * يحمي من XSS عبر روابط خبيثة لو تم إدخالها بواسطة أدمن مخترَق أو عن طريق الخطأ.
 */
const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:', 'sms:'];
const sanitizeContactUrl = (raw: unknown): string => {
  const text = String(raw || '').trim();
  if (!text) return '';
  // روابط نسبية أو بدون بروتوكول — نسمح بها (المتصفح يعالجها كنص عادي)
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) return text;
  try {
    const parsed = new URL(text);
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase()) ? text : '';
  } catch {
    return '';
  }
};

/** دالة لإنشاء كائن وسيلة تواصل مع قيم افتراضية ومعرف فريد */
const createContact = (overrides: Partial<SystemRequestContact>): SystemRequestContact => ({
  id: overrides.id || `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  enabled: overrides.enabled !== false,
  label: (overrides.label || '').trim(),
  value: (overrides.value || '').trim(),
  url: sanitizeContactUrl(overrides.url || ''),
  icon: overrides.icon || 'link',
  color: overrides.color || '#334155',
  showIcon: overrides.showIcon !== false,
});

/** وسائل التواصل الافتراضية للنظام */
const defaultContacts = (): SystemRequestContact[] => [
  createContact({
    id: 'whatsapp_default',
    label: 'واتساب',
    value: '01000000000',
    url: 'https://wa.me/201000000000',
    icon: 'whatsapp',
    color: '#16a34a',
  }),
  createContact({
    id: 'facebook_default',
    label: 'فيسبوك',
    value: 'صفحة العيادة',
    url: 'https://www.facebook.com/',
    icon: 'facebook',
    color: '#1877F2',
  }),
];

/** الإعدادات الافتراضية للسطر بالكامل */
export const DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS: SystemRequestLineSettings = {
  showLine: true,
  showIcons: true,
  message: 'لطلب أقوى نظام لادارة العيادات وطباعة الروشتات',
  lineStyle: DEFAULT_LINE_STYLE,
  contacts: defaultContacts(),
};

/** وظيفة لترميم وتوحيد بيانات وسيلة التواصل لضمان عدم حدوث أخطاء برمجية */
const normalizeContact = (raw: any, index: number): SystemRequestContact => {
  const safeIcon = SYSTEM_REQUEST_ICON_OPTIONS.some((item) => item.value === raw?.icon)
    ? raw.icon
    : 'link';

  return createContact({
    id: (raw?.id || `contact_${index}_${Date.now()}`).toString(),
    enabled: raw?.enabled !== false,
    label: (raw?.label || '').toString().trim() || `رابط ${index + 1}`,
    value: (raw?.value || '').toString().trim(),
    url: (raw?.url || '').toString().trim(),
    icon: safeIcon,
    color: normalizeColor(raw?.color, '#334155'),
    showIcon: raw?.showIcon !== false,
  });
};

/** وظيفة للتعامل مع البيانات القديمة (Legacy) وتحويلها للنظام الجديد المرن */
const normalizeFromLegacy = (raw: any): SystemRequestContact[] => {
  const contacts: SystemRequestContact[] = [];

  if (raw?.showWhatsApp !== false && (raw?.whatsappUrl || raw?.whatsappNumber)) {
    contacts.push(createContact({
      id: 'whatsapp_legacy',
      label: 'واتساب',
      value: (raw?.whatsappNumber || '').toString().trim() || '01000000000',
      url: (raw?.whatsappUrl || '').toString().trim() || 'https://wa.me/201000000000',
      icon: 'whatsapp',
      color: '#16a34a',
    }));
  }

  if (raw?.showFacebook !== false && (raw?.facebookUrl || raw?.facebookLabel)) {
    contacts.push(createContact({
      id: 'facebook_legacy',
      label: 'فيسبوك',
      value: (raw?.facebookLabel || '').toString().trim() || 'اسم العيادة',
      url: (raw?.facebookUrl || '').toString().trim() || 'https://www.facebook.com/',
      icon: 'facebook',
      color: '#1877F2',
    }));
  }

  return contacts.length > 0 ? contacts : defaultContacts();
};

/** وظيفة شاملة لتوحيد إعدادات السطر بالكامل وضمان صحة أنواع البيانات */
export const normalizeSystemRequestLineSettings = (raw: any): SystemRequestLineSettings => {
  const normalizedContacts = Array.isArray(raw?.contacts)
    ? raw.contacts.map((item: any, index: number) => normalizeContact(item, index))
    : normalizeFromLegacy(raw);

  const hasLegacyValues = Boolean(
    raw?.whatsappUrl || raw?.whatsappNumber || raw?.facebookUrl || raw?.facebookLabel
  );

  const contactsBeforeLimit = normalizedContacts.length === 0 && hasLegacyValues
    ? normalizeFromLegacy(raw)
    : normalizedContacts;
  // PF3: حد أقصى 10 وسائل تواصل — يمنع كسر تخطيط الفوتر وتضخم المستند.
  const contacts = contactsBeforeLimit.slice(0, MAX_CONTACTS_PER_FOOTER);

  return {
    showLine: raw?.showLine !== false,
    showIcons: raw?.showIcons !== false,
    message: (raw?.message || DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS.message).toString().trim() || DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS.message,
    lineStyle: {
      fontFamily: (raw?.lineStyle?.fontFamily || DEFAULT_LINE_STYLE.fontFamily).toString().trim() || DEFAULT_LINE_STYLE.fontFamily,
      fontWeight: (raw?.lineStyle?.fontWeight || DEFAULT_LINE_STYLE.fontWeight).toString().trim() || DEFAULT_LINE_STYLE.fontWeight,
      fontSize: Number.isFinite(Number(raw?.lineStyle?.fontSize)) ? Math.max(8, Math.min(18, Number(raw?.lineStyle?.fontSize))) : DEFAULT_LINE_STYLE.fontSize,
      textColor: normalizeColor(raw?.lineStyle?.textColor, DEFAULT_LINE_STYLE.textColor),
    },
    contacts,
  };
};

/** إنشاء وسيلة تواصل فارغة لإضافتها في واجهة الإعدادات */
export const createEmptySystemRequestContact = (): SystemRequestContact =>
  createContact({
    label: 'وسيلة تواصل جديدة',
    value: '',
    url: '',
    icon: 'link',
    color: '#334155',
    enabled: true,
    showIcon: true,
  });

const systemRequestLineService = {
  /** الاشتراك اللحظي في إعدادات سطر الطلب من Firestore مع (Smart Cache) */
  subscribeToSettings: (onUpdate: (settings: SystemRequestLineSettings) => void) => {
    const docRef = doc(db, ...SYSTEM_REQUEST_LINE_DOC_PATH);

    /** معالجة البيانات وتحويلها للنموذج الموحد */
    const handleSnap = (snapshot: any) => {
      if (snapshot.exists()) {
        try {
          const rawData = snapshot.data();
          onUpdate(normalizeSystemRequestLineSettings(rawData));
        } catch (error) {
          console.error('[SystemRequestLine] Normalize error:', error);
          onUpdate(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
        }
      } else {
        onUpdate(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
      }
    };

    // 1. المحاولة الأولى: جلب الإعدادات من الكاش للتحميل اللحظي
    getDocCacheFirst(docRef).then(snap => {
      if (snap.exists()) handleSnap(snap);
    }).catch(() => {});

    // 2. المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
    return onSnapshot(docRef, handleSnap, (error) => {
      console.error('[SystemRequestLine] Subscription error:', error);
      onUpdate(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
    });
  },

  /** جلب الإعدادات مرة واحدة فقط */
  getSettings: async (): Promise<SystemRequestLineSettings> => {
    try {
      const docRef = doc(db, ...SYSTEM_REQUEST_LINE_DOC_PATH);
      const snapshot = await getDocCacheFirst(docRef);
      if (snapshot.exists()) {
        return normalizeSystemRequestLineSettings(snapshot.data());
      }
      return DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS;
    } catch (error) {
      console.error('[SystemRequestLine] Fetch error:', error);
      return DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS;
    }
  },

  /** حفظ الإعدادات مع ميزة الدمج (Merge) لتجنب مسح الحقول غير المرسلة */
  saveSettings: async (settings: Partial<SystemRequestLineSettings>): Promise<void> => {
    try {
      const docRef = doc(db, ...SYSTEM_REQUEST_LINE_DOC_PATH);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error('[SystemRequestLine] Save error:', error);
      throw error;
    }
  }
};
