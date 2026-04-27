import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSignupForm,
  loadSignupForm,
  clearSignupForm,
  setSignupRedirectFlag,
  consumeSignupRedirectFlag,
  dataUrlToFile,
} from '../../../components/auth/signupFormPersistence';

// نموذج بيانات صغير — صورة 1×1 PNG شفافه (base64) عشان الاختبارات تكون سريعه
const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

describe('signupFormPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('saveSignupForm + loadSignupForm', () => {
    it('يحفظ البيانات ويسترجعها بنفس القيم', () => {
      const result = saveSignupForm({
        doctorName: 'د. أحمد',
        specialty: 'باطنه',
        whatsapp: '01000000000',
        licenseImageDataUrl: TINY_PNG_DATA_URL,
        licenseImageName: 'license.png',
      });

      expect(result.ok).toBe(true);

      const loaded = loadSignupForm();
      expect(loaded).not.toBeNull();
      expect(loaded?.doctorName).toBe('د. أحمد');
      expect(loaded?.specialty).toBe('باطنه');
      expect(loaded?.whatsapp).toBe('01000000000');
      expect(loaded?.licenseImageDataUrl).toBe(TINY_PNG_DATA_URL);
      expect(loaded?.licenseImageName).toBe('license.png');
      expect(typeof loaded?.savedAt).toBe('number');
    });

    it('يرفض الصور الأكبر من حد التخزين', () => {
      // نبني data URL > 4.5MB — الـrepeat بيدّينا string كبيره
      const oversizedDataUrl = `data:image/png;base64,${'A'.repeat(5_000_000)}`;
      const result = saveSignupForm({
        doctorName: 'د. أحمد',
        specialty: 'باطنه',
        whatsapp: '01000000000',
        licenseImageDataUrl: oversizedDataUrl,
        licenseImageName: 'huge.png',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('too-large');
      }
    });

    it('يرجع null لو مفيش بيانات محفوظه', () => {
      expect(loadSignupForm()).toBeNull();
    });

    it('يرجع null للبيانات منتهية الصلاحيه (TTL > 30 دقيقه)', () => {
      // نحفظ ثم نـoverride الـsavedAt يدوياً لقيمه قديمه
      saveSignupForm({
        doctorName: 'د. أحمد',
        specialty: 'باطنه',
        whatsapp: '01000000000',
        licenseImageDataUrl: TINY_PNG_DATA_URL,
        licenseImageName: 'license.png',
      });

      const raw = sessionStorage.getItem('dh_signup_pending_form')!;
      const parsed = JSON.parse(raw);
      parsed.savedAt = Date.now() - 31 * 60 * 1000; // 31 دقيقه فاتت
      sessionStorage.setItem('dh_signup_pending_form', JSON.stringify(parsed));

      expect(loadSignupForm()).toBeNull();
      // والـbloc اتمسح
      expect(sessionStorage.getItem('dh_signup_pending_form')).toBeNull();
    });

    it('يرجع null لو الـJSON تالف', () => {
      sessionStorage.setItem('dh_signup_pending_form', 'not-valid-json{');
      expect(loadSignupForm()).toBeNull();
      expect(sessionStorage.getItem('dh_signup_pending_form')).toBeNull();
    });
  });

  describe('clearSignupForm', () => {
    it('يمسح البيانات المحفوظه', () => {
      saveSignupForm({
        doctorName: 'د. أحمد',
        specialty: 'باطنه',
        whatsapp: '01000000000',
        licenseImageDataUrl: TINY_PNG_DATA_URL,
        licenseImageName: 'license.png',
      });
      clearSignupForm();
      expect(loadSignupForm()).toBeNull();
    });
  });

  describe('redirect flag', () => {
    it('consumeSignupRedirectFlag يرجع false لو الـflag مش متعَّن', () => {
      expect(consumeSignupRedirectFlag()).toBe(false);
    });

    it('setSignupRedirectFlag + consumeSignupRedirectFlag يشتغلوا معاً', () => {
      setSignupRedirectFlag();
      expect(consumeSignupRedirectFlag()).toBe(true);
      // المرة التانيه: الـflag اتمسح
      expect(consumeSignupRedirectFlag()).toBe(false);
    });
  });

  describe('dataUrlToFile', () => {
    it('يحوّل data URL صحيح لـFile', () => {
      const file = dataUrlToFile(TINY_PNG_DATA_URL, 'test.png');
      expect(file).not.toBeNull();
      expect(file?.name).toBe('test.png');
      expect(file?.type).toBe('image/png');
      expect(file?.size).toBeGreaterThan(0);
    });

    it('يرجع null لو الـdata URL تالف', () => {
      expect(dataUrlToFile('not-a-data-url', 'x.png')).toBeNull();
      expect(dataUrlToFile('data:image/png;base64,!!!invalid base64!!!', 'x.png')).toBeNull();
    });
  });
});
