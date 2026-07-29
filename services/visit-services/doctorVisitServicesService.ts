import {
  doc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  ensurePatientFileReference,
} from '../patient-files/patientFileReference';
import { branchDocKey } from '../financial-data/normalizers';
import {
  loadCostsFromFirestore,
} from '../patientCostService';
import type { DirectPaymentType } from '../../utils/paymentMethods';
import {
  buildVisitServiceTemplateId,
  normalizeServiceName,
  normalizeVisitServiceTemplates,
} from './helpers';
import type {
  VisitServiceCharge,
  VisitServiceIdentity,
  VisitServiceTemplate,
  VisitServiceType,
} from './types';

interface AddDoctorVisitServiceInput {
  userId: string;
  branchId?: string;
  patientFileId?: string | null;
  patientName: string;
  phone?: string;
  dateKey: string;
  visitId?: string;
  appointmentId?: string;
  serviceName: string;
  amount: number;
  type: VisitServiceType;
  paymentType: DirectPaymentType;
  saveAsTemplate: boolean;
  actorName?: string;
}

interface DeleteDoctorVisitServiceInput {
  userId: string;
  branchId?: string;
  patientFileId: string;
  itemId: string;
  appointmentId?: string;
}

interface FinalizePendingVisitServicesInput {
  userId: string;
  branchId?: string;
  patientFileId: string;
  visitId: string;
  appointmentId?: string;
  recordId?: string;
}

const toArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

const getTemplateRef = (userId: string, branchId?: string) =>
  doc(db, 'users', userId, 'financialData', branchDocKey('serviceTemplates', branchId));

const getDailyRef = (userId: string, dateKey: string, branchId?: string) =>
  doc(db, 'users', userId, 'financialData', 'daily', 'entries', branchDocKey(dateKey, branchId));

const calculateTotals = (items: VisitServiceCharge[]) => ({
  interventionsRevenue: items
    .filter((item) => item.type === 'interventions')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  otherRevenue: items
    .filter((item) => item.type === 'other')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
});

const buildAppointmentSummary = (items: VisitServiceCharge[], appointmentId: string) => {
  const appointmentItems = items.filter((item) => item.visitId === appointmentId);
  return {
    serviceChargesCount: appointmentItems.length,
    serviceChargesTotal: appointmentItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    ),
    serviceChargesUpdatedAt: Date.now(),
  };
};

export const subscribeToVisitServiceTemplates = (
  userId: string,
  branchId: string | undefined,
  onUpdate: (items: VisitServiceTemplate[]) => void,
): (() => void) => {
  if (!userId) return () => {};
  return onSnapshot(
    getTemplateRef(userId, branchId),
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      onUpdate(normalizeVisitServiceTemplates(data.items));
    },
    () => {
      onUpdate([]);
    },
  );
};

export const subscribeToDoctorVisitServiceItems = (
  userId: string,
  patientFileId: string,
  onUpdate: (items: VisitServiceCharge[]) => void,
): (() => void) =>
  onSnapshot(
    doc(db, 'users', userId, 'patientFileData', patientFileId),
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      onUpdate([
        ...toArray<VisitServiceCharge>(data.costItems),
        ...toArray<VisitServiceCharge>(data.pendingCostItems),
      ]);
    },
    () => onUpdate([]),
  );

export const addDoctorVisitService = async (
  input: AddDoctorVisitServiceInput,
): Promise<{ item: VisitServiceCharge; identity: VisitServiceIdentity }> => {
  const patientName = String(input.patientName || '').trim();
  const serviceName = String(input.serviceName || '').trim().replace(/\s+/g, ' ');
  const amount = Number(input.amount);
  if (!input.userId || !patientName) throw new Error('يرجى إدخال اسم المريض أولاً.');
  if (!serviceName) throw new Error('يرجى إدخال اسم الخدمة.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('يرجى إدخال سعر صحيح أكبر من الصفر.');

  const ensured = await ensurePatientFileReference(input.userId, patientName, input.phone);
  if (!ensured) throw new Error('تعذر إنشاء أو تحديد ملف المريض.');
  const identity: VisitServiceIdentity = ensured;
  const normalizedName = normalizeServiceName(serviceName);
  const now = Date.now();
  const branchId = String(input.branchId || 'main').trim() || 'main';
  const itemId = `ci_${now}_${Math.random().toString(36).slice(2, 9)}`;
  const templateId = input.saveAsTemplate
    ? buildVisitServiceTemplateId(input.type, normalizedName)
    : undefined;
  const item: VisitServiceCharge = {
    id: itemId,
    patientFileId: identity.patientFileId,
    patientName,
    amount,
    type: input.type,
    dateKey: input.dateKey,
    note: serviceName,
    serviceName,
    serviceTemplateId: templateId,
    paymentType: input.paymentType,
    createdAt: now,
    branchId,
    visitId: input.visitId || undefined,
    source: 'doctor_new_exam',
    addedByRole: 'doctor',
    addedByName: String(input.actorName || '').trim() || 'الطبيب',
    financialStatus: 'pending',
  };

  const patientRef = doc(db, 'users', input.userId, 'patientFileData', identity.patientFileId);
  const templateRef = getTemplateRef(input.userId, branchId);
  const appointmentRef = input.appointmentId
    ? doc(db, 'users', input.userId, 'appointments', input.appointmentId)
    : null;

  await runTransaction(db, async (transaction) => {
    const [patientSnapshot, templateSnapshot, appointmentSnapshot] = await Promise.all([
      transaction.get(patientRef),
      transaction.get(templateRef),
      appointmentRef ? transaction.get(appointmentRef) : Promise.resolve(null),
    ]);

    const existingPatientData = patientSnapshot.exists() ? patientSnapshot.data() : {};
    const pendingItems = toArray<VisitServiceCharge>(existingPatientData.pendingCostItems);
    const updatedPendingItems = [...pendingItems.filter((entry) => entry.id !== item.id), item];
    const postedItems = toArray<VisitServiceCharge>(existingPatientData.costItems);

    transaction.set(patientRef, {
      pendingCostItems: updatedPendingItems,
      updatedAt: now,
    }, { merge: true });

    if (input.saveAsTemplate && templateId) {
      const templateData = templateSnapshot.exists() ? templateSnapshot.data() : {};
      const templates = normalizeVisitServiceTemplates(templateData.items);
      const existingTemplate = templates.find(
        (entry) => entry.type === input.type && entry.normalizedName === normalizedName,
      );
      const template: VisitServiceTemplate = existingTemplate
        ? {
            ...existingTemplate,
            usageCount: existingTemplate.usageCount + 1,
            updatedAt: now,
            lastUsedAt: now,
            active: true,
          }
        : {
            id: templateId,
            name: serviceName,
            normalizedName,
            type: input.type,
            defaultPrice: amount,
            branchId,
            active: true,
            usageCount: 1,
            createdAt: now,
            updatedAt: now,
            lastUsedAt: now,
            createdByRole: 'doctor',
            createdByName: String(input.actorName || '').trim() || 'الطبيب',
          };
      const updatedTemplates = [
        ...templates.filter((entry) => entry.id !== template.id),
        template,
      ];
      transaction.set(templateRef, { items: updatedTemplates, updatedAt: now }, { merge: true });
    }

    if (appointmentRef && appointmentSnapshot?.exists()) {
      transaction.set(appointmentRef, {
        patientFileId: identity.patientFileId,
        patientFileNumber: identity.patientFileNumber,
        patientFileNameKey: identity.patientFileNameKey,
        ...buildAppointmentSummary([...postedItems, ...updatedPendingItems], input.appointmentId!),
        serviceChargesStatus: 'pending',
      }, { merge: true });
    }
  });

  return { item, identity };
};

export const deleteDoctorVisitService = async (
  input: DeleteDoctorVisitServiceInput,
): Promise<void> => {
  const patientRef = doc(db, 'users', input.userId, 'patientFileData', input.patientFileId);
  const appointmentRef = input.appointmentId
    ? doc(db, 'users', input.userId, 'appointments', input.appointmentId)
    : null;

  await runTransaction(db, async (transaction) => {
    const patientSnapshot = await transaction.get(patientRef);
    if (!patientSnapshot.exists()) return;
    const patientData = patientSnapshot.data();
    const costItems = toArray<VisitServiceCharge>(patientData.costItems);
    const pendingItems = toArray<VisitServiceCharge>(patientData.pendingCostItems);
    const pendingTarget = pendingItems.find((entry) => entry.id === input.itemId);
    if (pendingTarget) {
      const updatedPendingItems = pendingItems.filter((entry) => entry.id !== input.itemId);
      const appointmentSnapshot = appointmentRef ? await transaction.get(appointmentRef) : null;
      const now = Date.now();
      transaction.set(
        patientRef,
        { pendingCostItems: updatedPendingItems, updatedAt: now },
        { merge: true },
      );
      if (appointmentRef && appointmentSnapshot?.exists() && input.appointmentId) {
        transaction.set(
          appointmentRef,
          {
            ...buildAppointmentSummary([...costItems, ...updatedPendingItems], input.appointmentId),
            serviceChargesStatus: updatedPendingItems.some(
              (entry) => entry.visitId === input.appointmentId,
            ) ? 'pending' : 'posted',
          },
          { merge: true },
        );
      }
      return;
    }
    const target = costItems.find((entry) => entry.id === input.itemId);
    if (!target) return;

    const dailyRef = getDailyRef(input.userId, target.dateKey, input.branchId || target.branchId);
    const [dailySnapshot, appointmentSnapshot] = await Promise.all([
      transaction.get(dailyRef),
      appointmentRef ? transaction.get(appointmentRef) : Promise.resolve(null),
    ]);
    const updatedPatientItems = costItems.filter((entry) => entry.id !== input.itemId);
    const dailyData = dailySnapshot.exists() ? dailySnapshot.data() : {};
    const updatedDailyItems = toArray<VisitServiceCharge>(dailyData.cashCostItems)
      .filter((entry) => entry.id !== input.itemId);
    const now = Date.now();

    transaction.set(patientRef, { costItems: updatedPatientItems, updatedAt: now }, { merge: true });
    transaction.set(dailyRef, {
      cashCostItems: updatedDailyItems,
      ...calculateTotals(updatedDailyItems),
      updatedAt: now,
    }, { merge: true });
    if (appointmentRef && appointmentSnapshot?.exists() && input.appointmentId) {
      transaction.set(
        appointmentRef,
        buildAppointmentSummary(updatedPatientItems, input.appointmentId),
        { merge: true },
      );
    }
  });

  void loadCostsFromFirestore(input.userId, input.patientFileId);
  window.dispatchEvent(new Event('financialDataUpdated'));
};

export const finalizePendingVisitServices = async (
  input: FinalizePendingVisitServicesInput,
): Promise<number> => {
  const normalizedVisitId = String(input.visitId || '').trim();
  const normalizedFileId = String(input.patientFileId || '').trim();
  if (!input.userId || !normalizedVisitId || !normalizedFileId) return 0;

  const patientRef = doc(db, 'users', input.userId, 'patientFileData', normalizedFileId);
  const appointmentRef = input.appointmentId
    ? doc(db, 'users', input.userId, 'appointments', input.appointmentId)
    : null;

  const postedCount = await runTransaction(db, async (transaction) => {
    const patientSnapshot = await transaction.get(patientRef);
    if (!patientSnapshot.exists()) return 0;
    const patientData = patientSnapshot.data();
    const pendingItems = toArray<VisitServiceCharge>(patientData.pendingCostItems);
    const matchingPending = pendingItems.filter((entry) => entry.visitId === normalizedVisitId);
    if (matchingPending.length === 0) return 0;

    const branchId = String(
      input.branchId || matchingPending[0]?.branchId || 'main',
    ).trim() || 'main';
    const dateKey = String(matchingPending[0]?.dateKey || '').trim();
    if (!dateKey) return 0;
    const dailyRef = getDailyRef(input.userId, dateKey, branchId);
    const [dailySnapshot, appointmentSnapshot] = await Promise.all([
      transaction.get(dailyRef),
      appointmentRef ? transaction.get(appointmentRef) : Promise.resolve(null),
    ]);
    const now = Date.now();
    const existingPosted = toArray<VisitServiceCharge>(patientData.costItems);
    const existingIds = new Set(existingPosted.map((entry) => entry.id));
    const newlyPosted = matchingPending
      .filter((entry) => !existingIds.has(entry.id))
      .map((entry) => ({
        ...entry,
        financialStatus: 'posted' as const,
        ...(input.recordId ? { recordId: input.recordId } : {}),
        postedAt: now,
      }));
    const updatedPosted = [...existingPosted, ...newlyPosted];
    const matchingIds = new Set(matchingPending.map((entry) => entry.id));
    const remainingPending = pendingItems.filter((entry) => !matchingIds.has(entry.id));
    const dailyData = dailySnapshot.exists() ? dailySnapshot.data() : {};
    const existingDaily = toArray<VisitServiceCharge>(dailyData.cashCostItems);
    const dailyIds = new Set(existingDaily.map((entry) => entry.id));
    const updatedDaily = [
      ...existingDaily,
      ...newlyPosted.filter((entry) => !dailyIds.has(entry.id)),
    ];

    transaction.set(patientRef, {
      costItems: updatedPosted,
      pendingCostItems: remainingPending,
      updatedAt: now,
    }, { merge: true });
    transaction.set(dailyRef, {
      cashCostItems: updatedDaily,
      ...calculateTotals(updatedDaily),
      updatedAt: now,
    }, { merge: true });
    if (appointmentRef && appointmentSnapshot?.exists() && input.appointmentId) {
      transaction.set(appointmentRef, {
        ...buildAppointmentSummary(updatedPosted, input.appointmentId),
        serviceChargesStatus: 'posted',
        serviceChargesPostedAt: now,
        ...(input.recordId ? { recordId: input.recordId } : {}),
      }, { merge: true });
    }
    return matchingPending.length;
  });

  if (postedCount > 0) {
    void loadCostsFromFirestore(input.userId, normalizedFileId);
    window.dispatchEvent(new Event('financialDataUpdated'));
  }
  return postedCount;
};
