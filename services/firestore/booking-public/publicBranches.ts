/**
 * إدارة الفروع المنشورة في publicBookingConfig
 *
 * الفروع أصلاً موجودة في `users/{uid}/branches/{branchId}` لكن المريض لا يملك
 * صلاحية قراءتها من Firestore Rules. لذلك نقوم بنسخ البيانات المطلوبة للحجز
 * (الاسم + العنوان الاختياري + حالة التفعيل) إلى `publicBookingConfig/{secret}.branches`
 * الذي يكون readable للجميع.
 *
 * الدكتور يقوم بـ sync تلقائي لهذه القائمة عند فتح صفحة الحجز العام، ويمكنه
 * تعديل العناوين من خلال UI خاص.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst } from '../cacheFirst';
import { normalizePublicSecret } from './helpers';
import type { PublicBranchInfo } from '../../../types';

/** قراءة قائمة الفروع المنشورة من publicBookingConfig */
export const getPublicBranches = async (secret: string): Promise<PublicBranchInfo[]> => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return [];

  const ref = doc(db, 'publicBookingConfig', normalizedSecret);
  try {
    const snap = await getDocCacheFirst(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as { branches?: unknown };
    return sanitizePublicBranches(data.branches);
  } catch {
    return [];
  }
};

/** حفظ قائمة الفروع المنشورة في publicBookingConfig */
export const savePublicBranches = async (secret: string, branches: PublicBranchInfo[]): Promise<void> => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return;

  const sanitized = sanitizePublicBranches(branches);
  const ref = doc(db, 'publicBookingConfig', normalizedSecret);
  await setDoc(ref, { branches: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
};

/** دالة مساعدة للتحقق من شكل البيانات عند القراءة أو الكتابة */
const sanitizePublicBranches = (raw: unknown): PublicBranchInfo[] => {
  if (!Array.isArray(raw)) return [];
  const result: PublicBranchInfo[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as { id?: unknown; name?: unknown; address?: unknown; isActive?: unknown };
    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!id || !name) continue;
    const address = typeof entry.address === 'string' ? entry.address.trim() : '';
    const isActive = entry.isActive !== false; // default: true
    result.push({ id, name, address: address || undefined, isActive });
  }
  return result;
};
