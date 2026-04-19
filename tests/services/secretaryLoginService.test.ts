import { describe, it, expect } from 'vitest';
import { getSecretaryLoginErrorMessage } from '../../services/secretaryLoginService';

describe('getSecretaryLoginErrorMessage', () => {
  const genericAuthError = 'بيانات الدخول غير صحيحة أو نظام السكرتارية غير مفعّل';

  it('returns auth error for permission-denied code', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'permission-denied' })).toBe(genericAuthError);
  });

  it('returns auth error for functions/permission-denied prefix', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'functions/permission-denied' })).toBe(genericAuthError);
  });

  it('returns auth error for not-found code', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'not-found' })).toBe(genericAuthError);
  });

  it('returns auth error for failed-precondition code', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'failed-precondition' })).toBe(genericAuthError);
  });

  it('returns doctor-not-configured message for SECRETARY_PASSWORD_NOT_SET', () => {
    expect(
      getSecretaryLoginErrorMessage({
        code: 'failed-precondition',
        message: 'SECRETARY_PASSWORD_NOT_SET',
      })
    ).toBe('لم يتم اختيار كلمة سر من قبل الطبيب');
  });

  it('returns auth error when message contains INVALID_CREDENTIALS', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'internal', message: 'INVALID_CREDENTIALS' })).toBe(genericAuthError);
  });

  it('returns auth error when message contains INVALID_SECRETARY_PASSWORD', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'internal', message: 'INVALID_SECRETARY_PASSWORD' })).toBe(genericAuthError);
  });

  it('returns auth error when message contains DOCTOR_EMAIL_SECRET_MISMATCH', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'ok', message: 'DOCTOR_EMAIL_SECRET_MISMATCH' })).toBe(genericAuthError);
  });

  it('returns rate-limit message for resource-exhausted', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'resource-exhausted' })).toBe(
      'تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد قليل.'
    );
  });

  it('returns network message for unavailable', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'unavailable' })).toBe(
      'تعذر الاتصال بالسيرفر الآن. حاول مرة أخرى.'
    );
  });

  it('returns network message for deadline-exceeded', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'deadline-exceeded' })).toBe(
      'تعذر الاتصال بالسيرفر الآن. حاول مرة أخرى.'
    );
  });

  it('returns generic fallback for unknown error', () => {
    expect(getSecretaryLoginErrorMessage({ code: 'unknown', message: 'Something went wrong' })).toBe(
      'تعذر تسجيل دخول السكرتارية الآن. حاول مرة أخرى'
    );
  });

  it('returns generic fallback for null error', () => {
    expect(getSecretaryLoginErrorMessage(null)).toBe(
      'تعذر تسجيل دخول السكرتارية الآن. حاول مرة أخرى'
    );
  });

  it('returns generic fallback for empty error object', () => {
    expect(getSecretaryLoginErrorMessage({})).toBe(
      'تعذر تسجيل دخول السكرتارية الآن. حاول مرة أخرى'
    );
  });
});
