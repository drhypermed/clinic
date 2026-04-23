import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc, increment, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getDocCacheFirst } from './firestore/cacheFirst';
import { resolveEffectiveAccountTypeFromData } from '../utils/accountStatusTime';

/**
 * خدمة تتبع الاستخدام (Usage Tracking Service)
 * تُستخدم لمراقبة معدل استخدام الميزات الأساسية في التطبيق (مثل الروشتة الذكية، الطباعة، فحص التداخلات)
 * تساعد في فهم سلوك المستخدم وتحسين النظام مستقبلاً.
 *
 * التحسين: تجميع الأحداث محلياً وكتابتها دفعة واحدة كل 30 ثانية أو 10 أحداث
 * بدل كتابة كل حدث لوحده (كان يكلف ضعف اللازم).
 */

interface UsageEvent {
  doctorId: string; // معرف الطبيب الذي قام بالحدث
  eventType: 'smartPrescription' | 'print' | 'interactionChecker' | 'drugSearch' | 'contraIndications' | 'patientRecord';
  timestamp?: any;
  metadata?: {
    patientId?: string;
    recordId?: string;
    [key: string]: any;
  };
}

// ─── تجميع الأحداث (Batching) ───
const BATCH_FLUSH_INTERVAL_MS = 30_000; // 30 ثانية
const BATCH_MAX_SIZE = 10;

let pendingEvents: UsageEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

/** يكتب كل الأحداث المعلّقه دفعه واحده. لو الكتابه فشلت، الأحداث ترجع لقائمه الانتظار. */
const flushPendingEvents = async (): Promise<void> => {
  if (flushing || pendingEvents.length === 0) return;
  flushing = true;

  // ناخد batch من قائمة الانتظار. لو فشل أي شيء نرجّعه عشان مفيش data loss.
  const batch = pendingEvents.splice(0, BATCH_MAX_SIZE);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

  try {
    const writer = writeBatch(db);

    // 1. كتابة الأحداث دفعه واحده
    for (const event of batch) {
      const eventRef = doc(collection(db, 'usageEvents'));
      writer.set(eventRef, { ...event, timestamp: serverTimestamp() });
    }

    await writer.commit();

    // 2. تحديث العدادات التراكميه — مجمّعه حسب الدكتور
    const countsByDoctor = new Map<string, Map<string, number>>();
    for (const event of batch) {
      if (!countsByDoctor.has(event.doctorId)) {
        countsByDoctor.set(event.doctorId, new Map());
      }
      const doctorCounts = countsByDoctor.get(event.doctorId)!;
      doctorCounts.set(event.eventType, (doctorCounts.get(event.eventType) || 0) + 1);
    }

    // كتابة عدّاد واحد لكل دكتور بدل عدّاد لكل حدث
    for (const [doctorId, counts] of countsByDoctor) {
      const activePlan = await usageTrackingService.resolveActiveAccountType(doctorId);
      const statsUpdate: Record<string, any> = {};
      const planUpdate: Record<string, any> = {};

      for (const [eventType, count] of counts) {
        statsUpdate[`${eventType}Count`] = increment(count);
        planUpdate[`${eventType}Count`] = increment(count);
      }

      await setDoc(doc(db, 'users', doctorId), {
        usageStats: statsUpdate,
        usageStatsByPlan: { [activePlan]: planUpdate },
      }, { merge: true });
    }
  } catch (error) {
    // الـbatch فشل (انترنت قطع مثلاً) — نرجّع الأحداث لأول القائمه عشان نحاول تاني.
    // unshift في البدايه عشان الأحداث ترجع بترتيبها الأصلي ومحدش يخسر.
    pendingEvents.unshift(...batch);
    console.error('[UsageTracking] Batch flush failed (events restored to queue):', error);
  } finally {
    flushing = false;
    // لو في أحداث متجمّعه (الجديده + المرتجعه)، نجدول flush تاني
    if (pendingEvents.length > 0) scheduleFlush();
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => void flushPendingEvents(), BATCH_FLUSH_INTERVAL_MS);
};

// flush عند إغلاق الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void flushPendingEvents());
  window.addEventListener('beforeunload', () => void flushPendingEvents());
}

/** مسح الأحداث المعلقة — يُستدعى عند تسجيل الخروج لمنع تسجيل أحداث تحت حساب خاطئ */
export function resetUsageTrackingBatch(): void {
  pendingEvents = [];
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
}

export const usageTrackingService = {
  resolveActiveAccountType: async (doctorId: string): Promise<'free' | 'premium' | 'pro_max'> => {
    try {
      const userRef = doc(db, 'users', doctorId);
      const userSnap = await getDocCacheFirst(userRef);
      if (!userSnap.exists()) return 'free';

      const data = userSnap.data() as Record<string, unknown>;
      return resolveEffectiveAccountTypeFromData(data, Date.now());
    } catch {
      return 'free';
    }
  },

  /**
   * تسجيل حدث جديد — يتجمع محلياً ويُكتب دفعة واحدة كل 30 ثانية أو 10 أحداث.
   * كان قبل كده: كل حدث = كتابتين فورية (usageEvents + users).
   * دلوقتي: 10 أحداث = كتابة واحدة مجمّعة + تحديث عداد واحد لكل دكتور.
   */
  trackEvent: async (event: UsageEvent): Promise<void> => {
    if (!event.doctorId) {
      console.warn('Cannot track event without doctorId');
      return;
    }

    pendingEvents.push(event);

    if (pendingEvents.length >= BATCH_MAX_SIZE) {
      void flushPendingEvents();
    } else {
      scheduleFlush();
    }
  },

  /**
   * الحصول على إحصائيات عدد أحداث معينة خلال فترة زمنية محددة
   */
  getEventCount: async (
    doctorId: string,
    eventType: UsageEvent['eventType'],
    startDate: Date,
    endDate: Date
  ): Promise<number> => {
    try {
      const q = query(
        collection(db, 'usageEvents'),
        where('doctorId', '==', doctorId),
        where('eventType', '==', eventType),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Failed to get event count:', error);
      return 0;
    }
  },

  /**
   * تجميع إحصائيات شاملة للطبيب لكل الميزات الأساسية
   */
  getDoctorStats: async (doctorId: string, startDate: Date, endDate: Date) => {
    try {
      // كانت الاستعلامات بتشتغل واحد ورا واحد — دلوقتي بتشتغل كلها بالتوازي (أسرع 6 مرات)
      const [
        smartPrescriptionCount,
        printCount,
        interactionCheckerCount,
        drugSearchCount,
        contraIndicationsCount,
        patientRecordCount,
      ] = await Promise.all([
        usageTrackingService.getEventCount(doctorId, 'smartPrescription', startDate, endDate),
        usageTrackingService.getEventCount(doctorId, 'print', startDate, endDate),
        usageTrackingService.getEventCount(doctorId, 'interactionChecker', startDate, endDate),
        usageTrackingService.getEventCount(doctorId, 'drugSearch', startDate, endDate),
        usageTrackingService.getEventCount(doctorId, 'contraIndications', startDate, endDate),
        usageTrackingService.getEventCount(doctorId, 'patientRecord', startDate, endDate),
      ]);

      return {
        smartPrescriptionCount,
        printCount,
        interactionCheckerCount,
        drugSearchCount,
        contraIndicationsCount,
        patientRecordCount,
      };
    } catch (error) {
      console.error('Failed to get doctor stats:', error);
      return null;
    }
  },
};
