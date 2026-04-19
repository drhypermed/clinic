/**
 * hook إدارة بيانات الجمهور (usePatientManagementData)
 * يعتمد على pagination حقيقي من Firestore بدل تحميل كل الحسابات مرة واحدة.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  DocumentData,
  documentId,
  getDocs,
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
import { getPatientMetrics, buildPatientSearchCorpus } from './patientUtils';
import { PatientAccount } from './types';

interface UsePatientManagementDataParams {
  currentView: string;
  isAdminUser: boolean;
}

const PATIENTS_PAGE_SIZE = 20;
type PatientDocSnapshot = QueryDocumentSnapshot<DocumentData>;

export const usePatientManagementData = ({ currentView, isAdminUser }: UsePatientManagementDataParams) => {
  const [patients, setPatients] = useState<PatientAccount[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<PatientDocSnapshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoLoadingAll, setAutoLoadingAll] = useState(false);
  const autoLoadInFlightRef = useRef(false);

  const fetchMetricsForBatch = async (usersBatch: PatientDocSnapshot[]): Promise<PatientAccount[]> => {
    return Promise.all(
      usersBatch.map(async (uDoc) => {
        const data = uDoc.data() as Record<string, any>;
        const patientId = uDoc.id;
        let allBookings: PublicUserBooking[] = [];

        try {
          const bookingsSnap = await getDocsCacheFirst(collection(db, 'users', patientId, 'publicBookings') as any);
          allBookings = bookingsSnap.docs.map((item) => ({ id: item.id, ...item.data() } as PublicUserBooking));
        } catch {
          // Ignore
        }

        const metrics = getPatientMetrics(allBookings);
        return {
          id: patientId,
          name: data.displayName || data.name || 'مستخدم بدون اسم',
          email: data.email || 'غير متوفر',
          createdAt: data.createdAt,
          lastLoginAt: data.lastLoginAt,
          isAccountDisabled: data.isAccountDisabled,
          disabledReason: data.disabledReason,
          disabledAt: data.disabledAt,
          verificationStatus: data.verificationStatus,
          totalAppointments: metrics.totalAppointments,
          completedAppointments: metrics.confirmedAppointments,
          totalReviews: metrics.totalReviews,
          averageRating: metrics.averageRating,
          bookings: allBookings,
        };
      }),
    );
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

  const fetchPatientsPage = async (cursor: PatientDocSnapshot | null) => {
    const pageQuery = buildPatientsPageQuery(cursor);
    try {
      return await getDocs(pageQuery);
    } catch {
      return getDocsCacheFirst(pageQuery);
    }
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
      const loadedPatients = await fetchMetricsForBatch(usersSnap.docs as PatientDocSnapshot[]);
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

      const loadedPatients = await fetchMetricsForBatch(usersSnap.docs as PatientDocSnapshot[]);
      setPatients((prev) => {
        const merged = new Map<string, PatientAccount>(prev.map((patient) => [patient.id, patient]));
        loadedPatients.forEach((patient) => merged.set(patient.id, patient));
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

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    let result = [...patients];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((patient) => buildPatientSearchCorpus(patient).includes(term));
    }
    setFilteredPatients(result);
  }, [patients, searchTerm]);

  /**
   * PT3: Auto-load كل الصفحات عند البحث — يحل bug "البحث يفوت الصفحات غير المحمّلة"
   * بنفس أسلوب Account Management للأطباء.
   */
  useEffect(() => {
    if (!isAdminUser || currentView !== 'patients') return;
    if (loading || loadingMore) return;
    if (!hasMore || !lastDoc) return;
    if (autoLoadInFlightRef.current) return;
    if (!searchTerm.trim()) return;

    autoLoadInFlightRef.current = true;
    setAutoLoadingAll(true);
    let cancelled = false;

    const loadRemaining = async () => {
      try {
        let cursor: PatientDocSnapshot | null = lastDoc;
        while (cursor && !cancelled) {
          const snap = await fetchPatientsPage(cursor);
          if (cancelled) return;
          if (snap.docs.length === 0) break;
          const nextPatients = await fetchMetricsForBatch(snap.docs as PatientDocSnapshot[]);
          setPatients((prev) => {
            const merged = new Map<string, PatientAccount>(prev.map((p) => [p.id, p]));
            nextPatients.forEach((p) => merged.set(p.id, p));
            return Array.from(merged.values());
          });
          if (snap.docs.length < PATIENTS_PAGE_SIZE) {
            cursor = null;
          } else {
            cursor = snap.docs[snap.docs.length - 1] as PatientDocSnapshot;
          }
        }
        if (!cancelled) {
          setLastDoc(null);
          setHasMore(false);
        }
      } catch (err) {
        if (!cancelled) console.warn('[PatientManagement] Auto-load remaining failed:', err);
      } finally {
        if (!cancelled) setAutoLoadingAll(false);
        autoLoadInFlightRef.current = false;
      }
    };

    void loadRemaining();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, hasMore, isAdminUser, currentView]);

  return {
    patients,
    setPatients,
    filteredPatients,
    loading,
    loadingMore,
    autoLoadingAll,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMore,
  };
};
