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
    query,
    where,
    type Query,
} from 'firebase/firestore';
import { subscribeQueryCacheFirst } from './cacheFirst';
import { ClinicAppointment } from '../../types';
import { resolveAppointmentType } from '../../utils/appointmentType';
import { omitUndefined } from '../../utils/firestoreHelpers';
import { DEFAULT_BRANCH_ID } from './branches';
import {
    getPendingAppointmentExpiryMs,
    isPendingAppointmentExpired,
} from '../../utils/appointmentRetention';

// الثوابت الزمنية للحذف التلقائي
const THREE_MONTHS_MS = 3 * 30 * 24 * 60 * 60 * 1000; // 3 شهور

const reportAppointmentPruneError = (appointmentId: string, error: unknown) => {
    console.error('[Firestore] Error pruning appointment:', appointmentId, error);
};

export const appointmentsService = {
    /**
     * الاشتراك في قائمة المواعيد لمستخدم معين.
     * تشمل منطق ذكي لتحميل البيانات من الكاش أولاً ثم تحديثها من السيرفر.
     *
     * تحسين التكلفة (multi-branch):
     *   - لو الفرع فرعي (≠ main): نستخدم where('branchId') عشان Firestore يقرأ
     *     مواعيد الفرع فقط بدل ما يقرأ كل المواعيد ويفلتر في الذاكرة.
     *   - للفرع الرئيسي أو الـ subscription العامة (بدون branchId): نقرأ كل
     *     المواعيد عشان البيانات القديمة (قبل نظام الفروع) ما عندهاش حقل
     *     branchId — لو طبقنا where('branchId','==','main') عليها هتختفي.
     *
     * @param branchId - لو تم تمريره، يتم فلترة المواعيد حسب الفرع المحدد
     */
    subscribeToAppointments: (userId: string, onUpdate: (appointments: ClinicAppointment[]) => void, branchId?: string) => {
        const appointmentsRef = collection(db, 'users', userId, 'appointments');

        // server-side filter للفروع الفرعية فقط (انظر التعليق أعلاه)
        const isSubBranch = Boolean(branchId) && branchId !== DEFAULT_BRANCH_ID;
        const subscriptionTarget: Query = isSubBranch
            ? query(appointmentsRef, where('branchId', '==', branchId))
            : appointmentsRef;

        const filterByActiveBranch = (appointments: ClinicAppointment[]) => branchId
            ? appointments.filter(a => (a.branchId || DEFAULT_BRANCH_ID) === branchId)
            : appointments;

        let pendingExpiryTimer: ReturnType<typeof setTimeout> | null = null;
        const clearPendingExpiryTimer = () => {
            if (pendingExpiryTimer !== null) {
                clearTimeout(pendingExpiryTimer);
                pendingExpiryTimer = null;
            }
        };

        const schedulePendingExpiryCleanup = (appointments: ClinicAppointment[], now: number) => {
            clearPendingExpiryTimer();
            const expiryTimes = appointments
                .map(getPendingAppointmentExpiryMs)
                .filter((value): value is number => value !== null && value > now);
            if (expiryTimes.length === 0) return;

            const nextExpiryMs = Math.min(...expiryTimes);
            const delayMs = Math.min(Math.max(nextExpiryMs - now + 50, 0), 2_147_483_647);
            pendingExpiryTimer = setTimeout(() => {
                pendingExpiryTimer = null;
                const cleanupNow = Date.now();
                const expired = appointments.filter((appointment) =>
                    isPendingAppointmentExpired(appointment, cleanupNow)
                );
                const expiredIds = new Set(expired.map((appointment) => appointment.id));
                const retained = appointments.filter((appointment) => !expiredIds.has(appointment.id));

                // اخفِ المنتهي فوراً من قائمة الطبيب حتى لو تأخرت الكتابة السحابية بسبب الشبكة.
                if (expired.length > 0) {
                    onUpdate(filterByActiveBranch(retained));
                }
                expired.forEach((appointment) => {
                    appointmentsService.deleteAppointment(userId, appointment.id)
                        .catch((error) => reportAppointmentPruneError(appointment.id, error));
                });
                schedulePendingExpiryCleanup(retained, cleanupNow);
            }, delayMs);
        };

        /** معالجة البيانات القادمة من Firestore (Snapshot Processing) */
        const processAppointments = (snapshot: any) => {
            const all = snapshot.docs.map((d: any) => {
                const raw = { ...d.data(), id: d.id } as ClinicAppointment;
                return {
                    ...raw,
                    appointmentType: resolveAppointmentType(raw), // تحديد نوع الموعد (كشف/استشارة)
                    appointmentStatus: raw.appointmentStatus
                        || (raw.examCompletedAt ? 'completed' : 'pending'),
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
            const completedCutoff = now - THREE_MONTHS_MS;

            // شروط الحذف التلقائي:
            // 1. كشف مكتمل مر عليه أكثر من 3 شهور.
            const isOldCompleted = (a: ClinicAppointment) => {
                if (!a.examCompletedAt) return false;
                return getDateMs(a.examCompletedAt) <= completedCutoff;
            };

            const toDelete = clockLooksTrustworthy
                ? all.filter(a => isOldCompleted(a) || isPendingAppointmentExpired(a, now))
                : [];
            const toDeleteIds = new Set(toDelete.map(a => a.id));
            const toKeep = clockLooksTrustworthy ? all.filter(a => !toDeleteIds.has(a.id)) : all;

            if (clockLooksTrustworthy) {
                schedulePendingExpiryCleanup(toKeep, now);
            } else {
                clearPendingExpiryTimer();
            }

            if (!clockLooksTrustworthy) {
                console.warn('[Firestore] Skipping auto-prune: client clock appears to be behind latest createdAt; refusing to delete appointments.');
            }

            // تنفيذ الحذف الفعلي من قاعدة البيانات للمواعيد القديمة
            toDelete.forEach(a => {
                appointmentsService.deleteAppointment(userId, a.id)
                    .catch(err => reportAppointmentPruneError(a.id, err));
            });

            // فلترة حسب الفرع (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي)
            return filterByActiveBranch(toKeep);
        };

        // نعرض الكاش فوراً ثم نفتح اشتراكاً حياً واحداً. لا ننفذ getDocs من
        // الشبكة قبل الاشتراك، لأن ذلك كان يكرر قراءة البداية نفسها.
        const unsubscribe = subscribeQueryCacheFirst(subscriptionTarget, {
            next: (snapshot) => {
                const appointments = processAppointments(snapshot);
                onUpdate(appointments);
            },
            error: (error) => {
                console.error("[Firestore] Error subscribing to appointments:", error);
                onUpdate([]);
            },
        });

        return () => {
            clearPendingExpiryTimer();
            unsubscribe();
        };
    },

    /** حفظ موعد جديد أو تحديث بيانات موعد موجود */
    saveAppointment: async (userId: string, appointment: ClinicAppointment) => {
        try {
            const ref = doc(db, 'users', userId, 'appointments', appointment.id);
            const normalizedAppointment: ClinicAppointment = {
                ...appointment,
                appointmentStatus: appointment.appointmentStatus
                    || (appointment.examCompletedAt ? 'completed' : 'pending'),
            };
            await setDoc(ref, omitUndefined(normalizedAppointment as unknown as Record<string, unknown>));
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

