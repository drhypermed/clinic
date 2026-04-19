/**
 * طلبات دخول السكرتارية (Secretary Entry Requests)
 * هذا الملف يدير نظام "طلب فتح السجل" (Admission Request):
 * 1. عندما يرغب السكرتير في فتح ملف مريض، يرسل طلباً (Request).
 * 2. يظهر هذا الطلب لدى الطبيب للموافقة عليه أو رفضه.
 * 3. عند موافقة الطبيب، يتم تحديث صلاحيات السكرتير لهذا الموعد بالتحديد.
 * 4. تتبع أنواع المواعيد (كشف/استشارة) لضمان دقة البيانات المعروضة.
 *
 * العزل بين الفروع:
 * كل فرع له طلبه المستقل محفوظ في `requestsByBranch.${branchId}` داخل نفس المستند.
 * الحقل القديم (flat) يحمل آخر طلب من أي فرع — يُبقى للتوافق مع الأنظمة القديمة.
 */

import { deleteField, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { isConsultationAppointment, resolveAppointmentType } from '../../../utils/appointmentType';
import { normalizeBookingSecret, omitUndefined, sanitizeDocSegment, toOptionalText } from './helpers';
import { SecretaryEntryRequest } from '../../../types';
import { getDocCacheFirst } from '../cacheFirst';
// `writeApprovedEntryIdToCollectionOnly`: يكتب فقط على secretaryApprovedEntryIds
// ويرجع الـ payload للـ caller — يُستعمل من `setDoctorEntryResponse` لدمج
// الكتابة في write واحد على bookingConfig (تجنب الإشعار المكرر).
//
// ملاحظة: `addSecretaryApprovedEntryId` (الذي يكتب في المسارين) لا يُستعمل في
// هذا الملف لأننا ندمج الكتابات في write واحد. يُستعمل من `useAppointmentExecutionActions`
// مباشرة عند فتح الكشف المستقل من الطبيب.
import { writeApprovedEntryIdToCollectionOnly } from './entryAlerts';

const DEFAULT_BRANCH_ID = 'main';

// نفس الـ pattern المستخدم في entryAlerts.ts — 1-64 حرف/رقم/شرطة/underscore.
const SAFE_BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/** توحيد معرّف الفرع مع validation ضد injection عبر dot-notation. */
const normalizeBranchId = (branchId?: string): string => {
  const trimmed = String(branchId || '').trim();
  if (!trimmed) return DEFAULT_BRANCH_ID;
  if (!SAFE_BRANCH_ID_PATTERN.test(trimmed)) return DEFAULT_BRANCH_ID;
  return trimmed;
};

// ملاحظة: كتابة قوائم الـ approvedIds تتم الآن حصرياً عبر `addSecretaryApprovedEntryId`
// (في entryAlerts.ts) — حيث يوجد `trimApprovedIdsList` و `MAX_APPROVED_IDS_PER_LIST`.

/** هيكل البيانات المطلوب لإنشاء طلب دخول جديد */
interface SetSecretaryEntryRequestPayload {
  appointmentId: string;
  patientName: string;
  age?: string;
  visitReason?: string;
  appointmentType?: 'exam' | 'consultation';
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  /** الفرع المرسِل للطلب — للعزل بين الفروع. */
  branchId?: string;
}

/**
 * إنشاء طلب دخول جديد من قبل السكرتير.
 * يتم تخزينه في `secretaryEntryRequests/{secret}` بشكلين:
 *   - `requestsByBranch.${branchId}`: الطلب الخاص بفرع محدد (جديد — آمن من التعارض)
 *   - الحقول القديمة (flat): للتوافق مع الأنظمة التي لم تُحدَّث بعد
 * بذلك لو أرسلت سكرتيرتان من فرعين مختلفين طلباً في نفس اللحظة،
 * لن يدهس أحد الطلبين الآخر.
 */
export const setSecretaryEntryRequest = async (
  secret: string,
  data: SetSecretaryEntryRequestPayload,
  doctorId?: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const normalizedAppointmentId = sanitizeDocSegment(data.appointmentId);
  if (!normalizedAppointmentId) {
    throw new Error('appointment-id-required');
  }

  let targetDoctorId = sanitizeDocSegment(doctorId);

  // إذا لم يتم توفير معرف الطبيب، نحاول جلبه من إعدادات التكوين المرتبطة بالرمز السري
  if (!targetDoctorId) {
    const configRef = doc(db, 'bookingConfig', normalizedSecret);
    const configSnap = await getDoc(configRef);
    const fromConfig = configSnap.exists() ? configSnap.data()?.userId : '';
    targetDoctorId = sanitizeDocSegment(fromConfig);
  }

  if (!targetDoctorId) {
    throw new Error('doctor-id-required-for-secretary-entry-request');
  }

  const normalizedBranch = normalizeBranchId(data.branchId);
  const ref = doc(db, 'secretaryEntryRequests', normalizedSecret);
  const patientName = toOptionalText(data.patientName) || '';
  const age = data.age ? toOptionalText(data.age) : undefined;
  const visitReason = data.visitReason ? toOptionalText(data.visitReason) : undefined;

  const branchPayload = omitUndefined({
    doctorId: targetDoctorId,
    appointmentId: normalizedAppointmentId,
    patientName,
    age,
    visitReason,
    appointmentType: resolveAppointmentType(data),
    consultationSourceAppointmentId: data.consultationSourceAppointmentId,
    consultationSourceCompletedAt: data.consultationSourceCompletedAt,
    consultationSourceRecordId: data.consultationSourceRecordId,
    createdAt: new Date().toISOString(),
    branchId: normalizedBranch,
  });

  // نستخدم merge: true مع dot-notation — تحديث فرع واحد فقط بدون مسح باقي الفروع
  await setDoc(
    ref,
    {
      // الحقول القديمة (flat) للتوافق — تحمل آخر طلب من أي فرع
      ...branchPayload,
      // الخريطة الجديدة المعزولة بالفرع
      [`requestsByBranch.${normalizedBranch}`]: branchPayload,
    },
    { merge: true }
  );
};

/** وظيفة داخلية لتحويل البيانات الخام القادمة من Firestore إلى هيكل 'SecretaryEntryRequest' */
const mapSecretaryEntryRequest = (raw: Record<string, unknown>): SecretaryEntryRequest | null => {
  if (
    typeof raw?.appointmentId !== 'string' ||
    typeof raw?.patientName !== 'string' ||
    typeof raw?.createdAt !== 'string'
  ) {
    return null;
  }

  const consultationSourceAppointmentId =
    typeof raw?.consultationSourceAppointmentId === 'string'
      ? raw.consultationSourceAppointmentId
      : undefined;
  const consultationSourceCompletedAt =
    typeof raw?.consultationSourceCompletedAt === 'string' ? raw.consultationSourceCompletedAt : undefined;
  const consultationSourceRecordId =
    typeof raw?.consultationSourceRecordId === 'string' ? raw.consultationSourceRecordId : undefined;

  const isConsultationRequest = isConsultationAppointment({
    appointmentType: toOptionalText(raw.appointmentType),
    consultationSourceAppointmentId,
    consultationSourceCompletedAt,
    consultationSourceRecordId,
  });

  return {
    appointmentId: raw.appointmentId,
    patientName: toOptionalText(raw.patientName) || '',
    age: toOptionalText(raw.age),
    visitReason: toOptionalText(raw.visitReason),
    appointmentType: isConsultationRequest ? 'consultation' : 'exam',
    consultationSourceAppointmentId,
    consultationSourceCompletedAt,
    consultationSourceRecordId,
    createdAt: raw.createdAt,
    branchId: typeof raw.branchId === 'string' ? raw.branchId : undefined,
  };
};

/**
 * اختيار الطلب المناسب من المستند الكامل:
 * - لو `branchId` مُمرَّر: يقرأ من `requestsByBranch[branchId]` أولاً ثم fallback للحقل القديم لو كان يطابق الفرع.
 * - لو لم يُمرَّر: يختار أحدث طلب من كل الفروع (الطبيب بدون تحديد فرع).
 */
const selectRequestFromDoc = (
  docData: Record<string, unknown>,
  branchId?: string
): SecretaryEntryRequest | null => {
  const byBranchRaw = docData?.requestsByBranch;
  const hasByBranch =
    byBranchRaw && typeof byBranchRaw === 'object' && !Array.isArray(byBranchRaw);
  const byBranch = hasByBranch ? (byBranchRaw as Record<string, unknown>) : null;

  if (branchId) {
    const normalizedBranch = normalizeBranchId(branchId);

    // 1) جلب الـ specific من خريطة الفرع
    const specificRaw = byBranch ? byBranch[normalizedBranch] : null;
    const specificMapped =
      specificRaw && typeof specificRaw === 'object'
        ? mapSecretaryEntryRequest(specificRaw as Record<string, unknown>)
        : null;

    // 2) جلب الـ flat لو يخص نفس الفرع (أو بدون branchId — يُعتبر للفرع المطلوب)
    const flatBranchIdRaw = typeof docData?.branchId === 'string' ? docData.branchId : undefined;
    const flatBelongsToBranch = !flatBranchIdRaw || flatBranchIdRaw === normalizedBranch;
    const flatMapped = flatBelongsToBranch ? mapSecretaryEntryRequest(docData) : null;

    // 3) لو كلاهما موجود: نرجع الأحدث حسب createdAt (للتعامل مع clients قديمة تكتب flat فقط)
    if (specificMapped && flatMapped) {
      const specificMs = Date.parse(specificMapped.createdAt) || 0;
      const flatMs = Date.parse(flatMapped.createdAt) || 0;
      return flatMs > specificMs ? flatMapped : specificMapped;
    }

    return specificMapped || flatMapped;
  }

  // لم يُمرَّر branchId: إن وُجدت خريطة، نختار أحدث طلب من أي فرع
  if (byBranch && Object.keys(byBranch).length > 0) {
    const latest = Object.values(byBranch)
      .map((item) => (item && typeof item === 'object' ? mapSecretaryEntryRequest(item as Record<string, unknown>) : null))
      .filter((item): item is SecretaryEntryRequest => Boolean(item))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (latest.length > 0) return latest[0];
  }

  // لا خريطة — الحقول القديمة مباشرة
  return mapSecretaryEntryRequest(docData);
};

/**
 * جلب طلب الدخول الحالي (إن وجد) — يقبل `branchId` اختياري للفلترة بالفرع.
 * السكرتيرة تمرر فرعها. الطبيب يستطيع تمريره لفلترة طلبات فرع محدد.
 */
export const getSecretaryEntryRequest = async (
  secret: string,
  branchId?: string
): Promise<SecretaryEntryRequest | null> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return null;

  const ref = doc(db, 'secretaryEntryRequests', normalizedSecret);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return selectRequestFromDoc(snap.data() as Record<string, unknown>, branchId);
};

/**
 * الاشتراك في طلبات دخول السكرتارية (يستخدم من قبل الطبيب لمراقبة الطلبات الواردة).
 * - لو تم تمرير `branchId`: يرجع طلب هذا الفرع فقط (مثلاً السكرتيرة نفسها لمعرفة حالة طلبها).
 * - لو لم يُمرَّر: يرجع أحدث طلب من أي فرع (الطبيب يراقب كل الفروع).
 */
export const subscribeToSecretaryEntryRequest = (
  secret: string,
  onUpdate: (data: SecretaryEntryRequest | null) => void,
  branchId?: string
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate(null);
    return () => undefined;
  }

  const ref = doc(db, 'secretaryEntryRequests', normalizedSecret);

  const handleSnap = (snap: any) => {
    if (!snap.exists()) return onUpdate(null);
    onUpdate(selectRequestFromDoc(snap.data() as Record<string, unknown>, branchId));
  };

  // 1. استرجاع فوري من الكاش لضمان سرعة الربط (Zero-Latency)
  getDocCacheFirst(ref).then(snap => {
    if (snap.exists()) handleSnap(snap);
  }).catch(() => {});

  // 2. الاشتراك في التحديثات الحية من السيرفر
  return onSnapshot(ref, handleSnap);
};

/**
 * مسح الطلب بعد معالجته أو إلغائه.
 * - لو تم تمرير `branchId`: يمسح فقط طلب هذا الفرع من الخريطة + يصفر الحقول القديمة (flat)
 *   لو كانت تطابق هذا الفرع **أو** تحمل نفس `expectedAppointmentId` (للتعامل مع clients قديمة
 *   كتبت في flat بـ branchId مختلف).
 * - لو لم يُمرَّر `branchId`: يمسح المستند كله (سلوك قديم).
 *
 * تمرير `expectedAppointmentId` يحمي ضد scenario:
 *   1. سكرتيرة A أرسلت طلب → flat = {appointmentId: A1, branchId: A}
 *   2. سكرتيرة B (client قديم) أرسلت → flat = {appointmentId: B1} (يدوس على flat، لكن
 *      requestsByBranch.A لسه موجود)
 *   3. الطبيب يوافق على A1 بـ branchId=A → بدون expectedAppointmentId الـ flat لا يُمسح
 *      (لأن flatBranchId غير مطابق) → السكرتيرة B ترى طلب A1 خطأً.
 *   مع expectedAppointmentId='A1': نمسح الـ flat لو يطابق A1 بغض النظر عن branchId.
 */
export const clearSecretaryEntryRequest = async (
  secret: string,
  branchId?: string,
  expectedAppointmentId?: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const ref = doc(db, 'secretaryEntryRequests', normalizedSecret);

  if (!branchId) {
    // سلوك قديم — مسح المستند كله (يُستعمل فقط لو مفيش فروع متعددة)
    // نستخدم setDoc بـ merge لمسح الحقول بدل deleteDoc، عشان الرولز ما تفشلش
    await setDoc(
      ref,
      {
        appointmentId: deleteField(),
        patientName: deleteField(),
        age: deleteField(),
        visitReason: deleteField(),
        appointmentType: deleteField(),
        consultationSourceAppointmentId: deleteField(),
        consultationSourceCompletedAt: deleteField(),
        consultationSourceRecordId: deleteField(),
        createdAt: deleteField(),
        branchId: deleteField(),
        doctorId: deleteField(),
        requestsByBranch: deleteField(),
      },
      { merge: true }
    );
    return;
  }

  const normalizedBranch = normalizeBranchId(branchId);
  const normalizedExpectedAppointmentId = expectedAppointmentId
    ? sanitizeDocSegment(expectedAppointmentId)
    : '';
  const snap = await getDoc(ref);
  const snapData = snap.exists() ? (snap.data() || {}) : {};
  const flatBranchId = typeof snapData.branchId === 'string' ? snapData.branchId : undefined;
  const flatAppointmentId = typeof snapData.appointmentId === 'string' ? snapData.appointmentId : '';

  // نمسح فرع محدد من الخريطة — ولو الحقول القديمة (flat) بتخص نفس الفرع، نصفّرها كمان
  const payload: Record<string, unknown> = {
    [`requestsByBranch.${normalizedBranch}`]: deleteField(),
  };

  // نصفّر الـ flat لو:
  //   (أ) الـ flat يخص نفس الفرع، أو
  //   (ب) الـ flat بدون branchId (legacy)، أو
  //   (ج) الـ flat يحمل نفس appointmentId اللي بيتم clearing له (حماية ضد client قديم)
  const shouldClearFlat =
    !flatBranchId ||
    flatBranchId === normalizedBranch ||
    (Boolean(normalizedExpectedAppointmentId) && flatAppointmentId === normalizedExpectedAppointmentId);

  if (shouldClearFlat) {
    payload.appointmentId = deleteField();
    payload.patientName = deleteField();
    payload.age = deleteField();
    payload.visitReason = deleteField();
    payload.appointmentType = deleteField();
    payload.consultationSourceAppointmentId = deleteField();
    payload.consultationSourceCompletedAt = deleteField();
    payload.consultationSourceRecordId = deleteField();
    payload.createdAt = deleteField();
    payload.branchId = deleteField();
  }

  await setDoc(ref, payload, { merge: true });
};

/**
 * تسجيل رد الطبيب على طلب السكرتيرة (entryRequest) بـ approved/rejected.
 *
 * عند approved: ندمج **كل** التحديثات على `bookingConfig` في **write واحد**:
 *   - `doctorEntryResponse` + `doctorEntryResponseByBranch`
 *   - `approvedEntryAppointmentIds*` (من helper `writeApprovedEntryIdToCollectionOnly`)
 *   - `lastExamOpenedAt.${branch}` + `lastExamOpenedAppointmentId.${branch}`
 *
 * الكتابة في `secretaryApprovedEntryIds/{secret}` تتم قبل ذلك (عبر الـ helper)
 * في write منفصل — لكن هذا الـ doc مش له trigger، فلا مشكلة.
 *
 * **النتيجة:** trigger واحد فقط على bookingConfig → Cloud Function تكتشف
 * `doctorEntryResponse` + `lastExamOpenedAt` معاً، وتُرسل إشعار **واحد**
 * ("تم الموافقة بالدخول") بدل إشعارين ("تم الموافقة" + "الطبيب بدأ الكشف").
 *
 * `source: 'doctor'` يميز الـ Cloud Function أن الطبيب هو المصدر → السكرتيرة
 * تستحق push notification (بعكس حالة `source='secretary'` التي يُسكت الإشعار).
 */
export const setDoctorEntryResponse = async (
  secret: string,
  appointmentId: string,
  status: 'approved' | 'rejected',
  branchId?: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);
  if (!normalizedSecret || !normalizedAppointmentId) return;

  const normalizedBranch = normalizeBranchId(branchId);
  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const respondedAt = new Date().toISOString();

  const responsePayload = {
    status,
    appointmentId: normalizedAppointmentId,
    respondedAt,
    branchId: normalizedBranch,
    source: 'doctor' as const,
  };

  // الـ payload الأساسي: دائماً نكتب doctorEntryResponse
  const configPayload: Record<string, unknown> = {
    doctorEntryResponse: responsePayload,
    [`doctorEntryResponseByBranch.${normalizedBranch}`]: responsePayload,
  };

  // عند approved: نضم حقول الموافقة للـ payload لكتابتها في write واحد.
  // `writeApprovedEntryIdToCollectionOnly` يكتب على `secretaryApprovedEntryIds` فقط
  // ويرجع الـ lists المُحدَّثة لنضمّها في كتابة bookingConfig الرئيسية.
  if (status === 'approved') {
    const approvedPayload = await writeApprovedEntryIdToCollectionOnly(
      normalizedSecret,
      appointmentId,
      normalizedBranch
    );
    if (approvedPayload) {
      configPayload.approvedEntryAppointmentIds = approvedPayload.legacyIds;
      configPayload[`approvedEntryAppointmentIdsByBranch.${normalizedBranch}`] =
        approvedPayload.branchIds;
      configPayload[`lastExamOpenedAt.${normalizedBranch}`] = approvedPayload.openedAt;
      configPayload[`lastExamOpenedAppointmentId.${normalizedBranch}`] =
        approvedPayload.normalizedAppointmentId;
    }
  }

  // write واحد يجمع كل الحقول → trigger واحد → إشعار واحد
  await setDoc(configRef, configPayload, { merge: true });
};

/**
 * الرد الشامل للطبيب: يسجل الرد ويمسح الطلب الأصلي من قائمة الانتظار.
 * يتم التمرير بـ `branchId` عشان نعزل الرد والمسح على فرع محدد بدون التأثير على الفروع الأخرى.
 *
 * نمرر `appointmentId` كذلك لـ `clearSecretaryEntryRequest` كحماية ضد scenario:
 *   لو الـ flat يحمل نفس الـ appointmentId (من client قديم بدون branchId مطابق)،
 *   يتم مسحه أيضاً حتى لا يعرض أي subscriber طلباً تمت معالجته بالفعل.
 */
export const respondToSecretaryEntryRequest = async (
  secret: string,
  appointmentId: string,
  status: 'approved' | 'rejected',
  branchId?: string
): Promise<void> => {
  await setDoctorEntryResponse(secret, appointmentId, status, branchId);
  // مسح طلب هذا الفرع — best-effort: الرد الأهم وصل بالفعل
  await clearSecretaryEntryRequest(secret, branchId, appointmentId).catch(err =>
    console.error('[Firestore] Failed to clear entry request after response:', err)
  );
};

/**
 * مسح حالة رد الطبيب الأخيرة (مثل إغلاق نافذة الإشعار لدى السكرتير).
 * - لو مرر `branchId`: يصفر الرد الخاص بالفرع فقط.
 * - لو لم يُمرَّر: يصفر الحقل القديم الموحد.
 */
export const clearDoctorEntryResponse = async (
  secret: string,
  branchId?: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);

  if (!branchId) {
    await setDoc(configRef, { doctorEntryResponse: null }, { merge: true });
    return;
  }

  const normalizedBranch = normalizeBranchId(branchId);
  await setDoc(
    configRef,
    {
      doctorEntryResponse: null,
      [`doctorEntryResponseByBranch.${normalizedBranch}`]: null,
    },
    { merge: true }
  );
};

