import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { PatientRecord } from '../types';
import { db } from './firebaseConfig';

const DEFAULT_BRANCH_ID = 'main';
const RECENT_DAYS = 30;
const QUERY_BATCH_SIZE = 300;

/**
 * مصدر مستقل لمرشحي الاستشارة عند الطبيب.
 * لا يعتمد على صفحة السجلات العامة ذات حد الـ50، ويواصل القراءة بالـcursor
 * حتى نهاية نطاق آخر 30 يوماً بدون حد أقصى لعدد الكشوف المؤهلة.
 */
export const listRecentExamRecordsForDoctor = async (
  userId: string,
  branchId = DEFAULT_BRANCH_ID,
): Promise<PatientRecord[]> => {
  const normalizedUserId = String(userId || '').trim();
  const normalizedBranchId = String(branchId || '').trim() || DEFAULT_BRANCH_ID;
  if (!normalizedUserId) return [];

  const cutoffIso = new Date(
    Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const recordsRef = collection(db, 'users', normalizedUserId, 'records');
  const recentRecords: PatientRecord[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

  while (true) {
    const pageQuery = cursor
      ? query(
          recordsRef,
          where('date', '>=', cutoffIso),
          orderBy('date', 'desc'),
          startAfter(cursor),
          limit(QUERY_BATCH_SIZE),
        )
      : query(
          recordsRef,
          where('date', '>=', cutoffIso),
          orderBy('date', 'desc'),
          limit(QUERY_BATCH_SIZE),
        );
    const snapshot = await getDocs(pageQuery);
    if (snapshot.empty) break;

    snapshot.docs.forEach((recordSnapshot) => {
      const data = recordSnapshot.data() as Omit<PatientRecord, 'id'>;
      const recordBranchId = String(data.branchId || '').trim() || DEFAULT_BRANCH_ID;
      if (recordBranchId !== normalizedBranchId) return;

      recentRecords.push({ id: recordSnapshot.id, ...data });
    });

    cursor = snapshot.docs[snapshot.docs.length - 1] || null;
    if (snapshot.size < QUERY_BATCH_SIZE || !cursor) break;
  }

  return recentRecords;
};
