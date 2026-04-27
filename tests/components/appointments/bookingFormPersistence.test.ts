import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePendingBooking,
  loadPendingBooking,
  clearPendingBooking,
  type PendingBookingFormValues,
} from '../../../components/appointments/public-booking-form/bookingFormPersistence';

const SAMPLE_FORM: PendingBookingFormValues = {
  patientName: 'أحمد محمد',
  age: '30',
  phone: '01000000000',
  gender: 'male',
  pregnant: null,
  breastfeeding: null,
  visitReason: 'صداع',
  isFirstVisit: true,
  appointmentType: 'exam',
  selectedConsultationCandidateId: '',
  selectedBranchId: 'branch-1',
};

const CONTEXT_A = { slug: 'dr-ahmed', userIdRouteParam: '' };
const CONTEXT_B = { slug: 'dr-mohamed', userIdRouteParam: '' };

describe('bookingFormPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('save + load', () => {
    it('يحفظ ويسترجع الـbooking بنفس القيم', () => {
      const ok = savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');
      expect(ok).toBe(true);

      const loaded = loadPendingBooking(CONTEXT_A);
      expect(loaded).not.toBeNull();
      expect(loaded?.context.slug).toBe('dr-ahmed');
      expect(loaded?.formValues.patientName).toBe('أحمد محمد');
      expect(loaded?.pendingSlotId).toBe('slot-123');
    });

    it('يرجع null لو مفيش بيانات محفوظه', () => {
      expect(loadPendingBooking()).toBeNull();
    });

    it('يرجع null + يمسح الـsnapshot لو الـcontext مختلف', () => {
      savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');

      // المريض اتنقل لرابط حجز تاني — الـsnapshot القديم ميـauto-fill-ش
      const loaded = loadPendingBooking(CONTEXT_B);
      expect(loaded).toBeNull();

      // والـsnapshot اتمسح من sessionStorage عشان ميرجعش لو الـuser رفرش
      expect(sessionStorage.getItem('dh_public_booking_pending')).toBeNull();
    });

    it('يرجع الـsnapshot لو ما اتمرَّرش currentContext (مفيش فحص)', () => {
      savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');
      const loaded = loadPendingBooking();
      expect(loaded).not.toBeNull();
    });

    it('يرجع null للبيانات منتهية الصلاحيه (TTL > 30 دقيقه)', () => {
      savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');

      // override savedAt بقيمه قديمه
      const raw = sessionStorage.getItem('dh_public_booking_pending')!;
      const parsed = JSON.parse(raw);
      parsed.savedAt = Date.now() - 31 * 60 * 1000; // 31 دقيقه فاتت
      sessionStorage.setItem('dh_public_booking_pending', JSON.stringify(parsed));

      expect(loadPendingBooking(CONTEXT_A)).toBeNull();
      expect(sessionStorage.getItem('dh_public_booking_pending')).toBeNull();
    });

    it('يرجع null لو الـJSON تالف', () => {
      sessionStorage.setItem('dh_public_booking_pending', 'not-valid-json{');
      expect(loadPendingBooking(CONTEXT_A)).toBeNull();
      expect(sessionStorage.getItem('dh_public_booking_pending')).toBeNull();
    });
  });

  describe('clearPendingBooking', () => {
    it('يمسح البيانات المحفوظه', () => {
      savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');
      clearPendingBooking();
      expect(loadPendingBooking(CONTEXT_A)).toBeNull();
    });
  });

  describe('overwrite', () => {
    it('save جديد يـoverwrite الـsnapshot القديم', () => {
      savePendingBooking(CONTEXT_A, SAMPLE_FORM, 'slot-123');
      savePendingBooking(CONTEXT_A, { ...SAMPLE_FORM, patientName: 'فاطمة' }, 'slot-456');

      const loaded = loadPendingBooking(CONTEXT_A);
      expect(loaded?.formValues.patientName).toBe('فاطمة');
      expect(loaded?.pendingSlotId).toBe('slot-456');
    });
  });
});
