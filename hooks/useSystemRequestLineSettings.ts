/**
 * Hook إعدادات تذييل الروشتة (useSystemRequestLineSettings):
 * يسمح هذا الـ Hook بالتحكم في "السطر السفلي" (Prescription Footer) للروشتة:
 * 1. جلب الإعدادات العامة (روابط واتساب، فيسبوك، إلخ).
 * 2. معالجة وتوحيد البيانات (Normalization) لضمان توافقها مع القنوات المختلفة.
 * 3. حفظ التعديلات في Firestore مع سجل التحديث (Audit Path).
 */

import { useCallback, useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { SystemRequestLineSettings } from '../types';
import {
  DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS,
  normalizeSystemRequestLineSettings,
  SYSTEM_REQUEST_LINE_DOC_PATH,
} from '../services/systemRequestLineService';

export const useSystemRequestLineSettings = () => {
  const [settings, setSettings] = useState<SystemRequestLineSettings>(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب إعدادات التذييل مرة واحدة من الكاش (بتتغير نادراً — مش محتاجة مراقبة مستمرة)
    const ref = doc(db, ...SYSTEM_REQUEST_LINE_DOC_PATH);
    let cancelled = false;

    getDocCacheFirst(ref)
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot.exists()) {
          setSettings(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
        } else {
          setSettings(normalizeSystemRequestLineSettings(snapshot.data()));
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error loading prescription footer line settings:', err);
        setError('تعذر تحميل إعدادات السطر السفلي');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  /** حفظ الإعدادات مع معالجة الروابط الاجتماعية تلقائياً */
  const saveSettings = useCallback(async (next: SystemRequestLineSettings, updatedBy?: string | null) => {
    const ref = doc(db, ...SYSTEM_REQUEST_LINE_DOC_PATH);
    const normalized = normalizeSystemRequestLineSettings(next);
    
    // استخراج معلومات التواصل الأساسية للواتساب والفيسبوك لسهولة الوصول
    const whatsappContact = normalized.contacts.find((item) => item.enabled !== false && item.icon === 'whatsapp');
    const facebookContact = normalized.contacts.find((item) => item.enabled !== false && item.icon === 'facebook');

    /** تنظيف الكائن من أي قيم undefined قبل الإرسال لـ Firestore */
    const stripUndefinedDeep = (value: any): any => {
      if (Array.isArray(value)) {
        return value.map(stripUndefinedDeep);
      }
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, stripUndefinedDeep(v)])
        );
      }
      return value;
    };

    const payload = stripUndefinedDeep({
      ...normalized,
      showWhatsApp: Boolean(whatsappContact),
      whatsappNumber: whatsappContact?.value || whatsappContact?.label || '',
      whatsappUrl: whatsappContact?.url || '',
      showFacebook: Boolean(facebookContact),
      facebookLabel: facebookContact?.value || facebookContact?.label || '',
      facebookUrl: facebookContact?.url || '',
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'unknown',
    });

    await setDoc(ref, payload, { merge: true });
    setSettings(normalized);
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
  };
};
