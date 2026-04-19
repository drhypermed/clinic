/**
 * خدمة مواعيد العيادة (Appointments Service)
 * تتعامل هذه الخدمة مع عمليات Firestore الخاصة بالمواعيد:
 * 1. الاشتراك في التحديثات اللحظية (Real-time Sync).
 * 2. حفظ وتحديث المواعيد.
 * 3. حذف المواعيد القديمة أو المنتهية تلقائياً (Pruning).
 */

import { db } from '../firebaseConfig';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
} from 'firebase/firestore';
import { getDocsCacheFirst } from './cacheFirst';
import { ClinicAppointment } from '../../types';
import { resolveAppointmentType } from '../../utils/appointmentType';
import { omitUndefined } from '../../utils/firestoreHelpers';
import { DEFAULT_BRANCH_ID } from './branches';

// الثوابت الزمنية للحذف التلقائي
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // شهر واحد
const THREE_MONTHS_MS = 3 * 30 * 24 * 60 * 60 * 1000; // 3 شهور

export const appointmentsService = {
    /**
     * الاشتراك في قائمة المواعيد لمستخدم معين
     * تشمل منطق ذكي لتحميل البيانات من الكاش أولاً ثم تحديثها من السيرفر.
     * @param branchId - لو تم تمريره، يتم فلترة المواعيد حسب الفرع المحدد
     */
    subscribeToAppointments: (userId: string, onUpdate: (appointments: ClinicAppointment[]) => void, branchId?: string) => {
        const appointmentsRef = collection(db, 'users', userId, 'appointments');

        /** معالجة البيانات القادمة من Firestore (Snapshot Processing) */
        const processAppointments = (snapshot: any) => {
            const all = snapshot.docs.map((d: any) => {
                const raw = { ...d.data(), id: d.id } as ClinicAppointment;
                return {
                    ...raw,
                    appointmentType: resolveAppointmentType(raw), // تحديد نوع الموعد (كشف/استشارة)
                } as ClinicAppointment;
            });

            const getDateMs = (value: unknown) => {
                if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
                    return (value as { toDate: () => Date }).toDate().getTime();
                }
                return new Date(value as string).getTime();
            };

            // حماية من ساعة العميل الخاطئة:
            // لو الـ Date.now() يبدو قديماً بالنسبة لأحدث createdAt بين البيانات الموجودة،
            // فالـ clock غير موثوق ونتخطى الحذف التلقائي بالكامل لتفادي مسح بيانات صالحة.
            const now = Date.now();
            const latestCreatedMs = all.reduce((max, a) => {
                const t = getDateMs((a as { createdAt?: unknown }).createdAt);
                return Number.isFinite(t) && t > max ? t : max;
            }, 0);
            const clockLooksTrustworthy = !latestCreatedMs || now >= latestCreatedMs - 60_000;

            // منطق فلترة وحذف المواعيد القديمة
            const pendingCutoff = now - ONE_MONTH_MS;
            const completedCutoff = now - THREE_MONTHS_MS;
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const startOfTodayMs = startOfToday.getTime();

            // شروط الحذف التلقائي:
            // 1. كشف مكتمل مر عليه أكثر من 3 شهور.
            const isOldCompleted = (a: ClinicAppointment) => {
                if (!a.examCompletedAt) return false;
                return getDateMs(a.examCompletedAt) <= completedCutoff;
            };

            // 2. موعد معلق مر عليه أكثر من شهر.
            const isVeryOldPending = (a: ClinicAppointment) => {
                if (a.examCompletedAt) return false;
                return getDateMs(a.dateTime) <= pendingCutoff;
            };

            // 3. موعد انتهى وقته (قبل اليوم) ولم يتم الكشف عليه.
            const isExpiredWithoutEntry = (a: ClinicAppointment) => {
                const t = getDateMs(a.dateTime);
                return Number.isFinite(t) && t < startOfTodayMs && !a.examCompletedAt;
            };

            const toDelete = clockLooksTrustworthy
                ? all.filter(a => isOldCompleted(a) || isExpiredWithoutEntry(a) || isVeryOldPending(a))
                : [];
            const toKeep = clockLooksTrustworthy ? all.filter(a => !toDelete.includes(a)) : all;

            if (!clockLooksTrustworthy) {
                console.warn('[Firestore] Skipping auto-prune: client clock appears to be behind latest createdAt; refusing to delete appointments.');
            }

            // تنفيذ الحذف الفعلي من قاعدة البيانات للمواعيد القديمة
            toDelete.forEach(a => {
                appointmentsService.deleteAppointment(userId, a.id).catch(err =>
                    console.error("[Firestore] Error pruning old appointment:", a.id, err)
                );
            });

            // فلترة حسب الفرع (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي)
            if (branchId) {
                return toKeep.filter(a => (a.branchId || DEFAULT_BRANCH_ID) === branchId);
            }

            return toKeep;
        };

        // 1. المحاولة الأولى: تحميل لحظي من الكاش (لتكون التجربة "طائرة")
        getDocsCacheFirst(appointmentsRef).then(cachedSnapshot => {
            if (!cachedSnapshot.empty) {
                console.log('[Firestore] Instant load of appointments from cache');
                const appointments = processAppointments(cachedSnapshot);
                onUpdate(appointments);
            }
        }).catch(() => {
            // لا يوجد كاش، لا بأس، سننتظر السيرفر
        });

        // 2. المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
        const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
            const appointments = processAppointments(snapshot);
            onUpdate(appointments);
        }, (error) => {
            console.error("[Firestore] Error subscribing to appointments:", error);
            onUpdate([]);
        });

        return unsubscribe;
    },

    /** حفظ موعد جديد أو تحديث بيانات موعد موجود */
    saveAppointment: async (userId: string, appointment: ClinicAppointment) => {
        try {
            const ref = doc(db, 'users', userId, 'appointments', appointment.id);
            await setDoc(ref, omitUndefined(appointment as unknown as Record<string, unknown>));
        } catch (error) {
            console.error("[Firestore] Error saving appointment:", error);
            throw error;
        }
    },

    /** حذف موعد يدوياً من قاعدة البيانات */
    deleteAppointment: async (userId: string, appointmentId: string) => {
        try {
            const ref = doc(db, 'users', userId, 'appointments', appointmentId);
            await deleteDoc(ref);
        } catch (error) {
            console.error("[Firestore] Error deleting appointment:", error);
            throw error;
        }
    },
};

