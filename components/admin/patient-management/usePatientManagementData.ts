/**
 * hook إدارة بيانات الجمهور (usePatientManagementData)
 *
 * استراتيجية تقليل قراءات Firestore (مهم للتكلفة عند آلاف المستخدمين):
 *   1) القائمة الرئيسية تجيب وثيقة المستخدم فقط (1 قراءة لكل مريض). لا نجيب publicBookings مطلقاً.
 *   2) إحصائيات الحجوزات/التقييمات تُجلب عند الطلب فقط (lazy) عبر loadPatientBookings.
 *   3) ألغينا auto-load لكل القاعدة عند البحث — الأدمن يضغط "تحميل المزيد" يدوياً.
 *   4) pagination باستخدام cache-first عشان نعيد استخدام cache المتصفح بدل ضرب الشبكة كل مرة.
 *
 * النتيجة: قراءات الصفحة الأولى تنخفض من ~120 إلى 20 قراءة فقط (وفر ~83%).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  DocumentData,
  documentId,
  limit,
  orderBy,
  QueryConstraint,
  QueryDocumentSnapshot,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import { PublicUserBooking } from '../../../types';
import { getPatientMetrics } from './patientUtils';
import { PatientAccount } from './types';

interface UsePatientManagementDataParams {
  currentView: string;
  isAdminUser: boolean;
}

const PATIENTS_PAGE_SIZE = 20;
type PatientDocSnapshot = QueryDocumentSnapshot<DocumentData>;

export const usePatientManagementData = ({ currentView, isAdminUser }: UsePatientManagementDataParams) => {
  // loading يبدأ true لتجنب وميض "لا توجد بيانات" قبل التحميل الأول
  const [patients, setPatients] = useState<PatientAccount[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<PatientDocSnapshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // معرّفات المرضى الذين تم تحميل حجوزاتهم بالفعل (لتجنب جلبها مرة أخرى)
  const [bookingsLoadingId, setBookingsLoadingId] = useState<string | null>(null);

  /**
   * بناء PatientAccount من وثيقة المستخدم بدون جلب الحجوزات
   * (الإحصائيات تبدأ صفر، تُملأ لاحقاً عند الطلب)
   */
  const buildPatientFromDoc = (uDoc: PatientDocSnapshot): PatientAccount => {
    const data = uDoc.data() as Record<string, any>;
    return {
      id: uDoc.id,
      name: data.displayName || data.name || 'مستخدم بدون اسم',
      email: data.email || 'غير متوفر',
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
      isAccountDisabled: data.isAccountDisabled,
      disabledReason: data.disabledReason,
      disabledAt: data.disabledAt,
      verificationStatus: data.verificationStatus,
      // الإحصائيات تبدأ بـ undefined → الـ UI يعرض زر "عرض" بدل أرقام مزيفة
      totalAppointments: 0,
      completedAppointments: 0,
      totalReviews: 0,
      averageRating: '0',
      bookings: [],
      // علامة عشان الـ UI يعرف إن الإحصائيات لسه ما اتجلبتش
      bookingsLoaded: false,
    };
  };

  const buildPatientsPageQuery = (cursor: PatientDocSnapshot | null) => {
    const constraints: QueryConstraint[] = [
      where('authRole', '==', 'public'),
      orderBy(documentId()),
      limit(PATIENTS_PAGE_SIZE),
    ];

    if (cursor) {
      constraints.splice(2, 0, startAfter(cursor));
    }

    return query(collection(db, 'users'), ...constraints);
  };

  // cache-first في كل الصفحات لتقليل قراءات الشبكة عند فتح وقفل الصفحة
  const fetchPatientsPage = (cursor: PatientDocSnapshot | null) => {
    return getDocsCacheFirst(buildPatientsPageQuery(cursor) as any);
  };

  const loadPatients = useCallback(async () => {
    if (currentView !== 'patients' || !isAdminUser) {
      setPatients([]);
      setFilteredPatients([]);
      setHasMore(false);
      setLastDoc(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const usersSnap = await fetchPatientsPage(null);
      const loadedPatients = (usersSnap.docs as PatientDocSnapshot[]).map(buildPatientFromDoc);
      setPatients(loadedPatients);
      setLastDoc((usersSnap.docs[usersSnap.docs.length - 1] as PatientDocSnapshot | undefined) || null);
      setHasMore(usersSnap.docs.length === PATIENTS_PAGE_SIZE);
    } catch (err) {
      console.error('Error loading patients:', err);
      setPatients([]);
      setHasMore(false);
      setLastDoc(null);
    } finally {
      setLoading(false);
    }
  }, [currentView, isAdminUser]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      const usersSnap = await fetchPatientsPage(lastDoc);
      if (usersSnap.docs.length === 0) {
        setHasMore(false);
        setLastDoc(null);
        return;
      }

      const loadedPatients = (usersSnap.docs as PatientDocSnapshot[]).map(buildPatientFromDoc);
      setPatients((prev) => {
        // دمج بدون تكرار: لو ID موجود، نحتفظ بالنسخة القديمة (محتفظة بالـ bookings المُحمّلة)
        const merged = new Map<string, PatientAccount>(prev.map((patient) => [patient.id, patient]));
        loadedPatients.forEach((patient) => {
          if (!merged.has(patient.id)) merged.set(patient.id, patient);
        });
        return Array.from(merged.values());
      });

      setLastDoc((usersSnap.docs[usersSnap.docs.length - 1] as PatientDocSnapshot | undefined) || null);
      setHasMore(usersSnap.docs.length === PATIENTS_PAGE_SIZE);
    } catch (err) {
      console.error('Error loading more patients:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /**
   * جلب حجوزات مريض واحد عند الطلب (lazy)
   * يُستدعى فقط لما الأدمن يضغط على "عرض الإحصائيات" أو "التقييمات"
   * يحفظ النتيجة في state عشان ما نجيبهاش تاني لو الأدمن ضغط مرة أخرى
   */
  const loadPatientBookings = async (patientId: string): Promise<PublicUserBooking[]> => {
    // لو الحجوزات محمّلة بالفعل، نرجع المخزنة فوراً (صفر قراءات)
    const existing = patients.find((p) => p.id === patientId);
    if (existing?.bookingsLoaded) return existing.bookings;

    setBookingsLoadingId(patientId);
    try {
      const bookingsSnap = await getDocsCacheFirst(
        collection(db, 'users', patientId, 'publicBookings') as any,
      );
      const allBookings = bookingsSnap.docs.map(
        (item: any) => ({ id: item.id, ...item.data() } as PublicUserBooking),
      );
      const metrics = getPatientMetrics(allBookings);

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                bookings: allBookings,
                bookingsLoaded: true,
                totalAppointments: metrics.totalAppointments,
                completedAppointments: metrics.confirmedAppointments,
                totalReviews: metrics.totalReviews,
                averageRating: metrics.averageRating,
              }
            : patient,
        ),
      );
      return allBookings;
    } catch (err) {
      console.error('Error loading patient bookings:', err);
      return [];
    } finally {
      setBookingsLoadingId(null);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  /**
   * فلترة client-side فقط على المرضى المحملين حالياً
   * البحث لا يستدعي auto-load — الأدمن يضغط "تحميل المزيد" يدوياً لو محتاج
   * (سبب القرار: auto-load كان يكلف ~30k قراءة لكل بحث عند 5 آلاف جمهور)
   */
  useEffect(() => {
    let result = [...patients];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((patient) => {
        // بحث خفيف على الحقول الظاهرة فقط (الاسم/البريد/معرّف)
        // لم نعد نبحث في bookings لأنها لم تُجلب أصلاً
        const corpus = [patient.id, patient.name, patient.email, patient.disabledReason || '']
          .join(' ')
          .toLowerCase();
        return corpus.includes(term);
      });
    }
    setFilteredPatients(result);
  }, [patients, searchTerm]);

  return {
    patients,
    setPatients,
    filteredPatients,
    loading,
    loadingMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMore,
    loadPatientBookings,
    bookingsLoadingId,
  };
};
