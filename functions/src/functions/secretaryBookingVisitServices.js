const { normalizeText, DEFAULT_BRANCH_ID } = require('./secretaryLoginHelpers');
const { normalizePatientNameForFile } = require('./statsCounterHelpers');

const DIRECT_PAYMENT_TYPES = new Set(['cash', 'instapay', 'wallet', 'bank_transfer']);
const MAX_DRAFT_SERVICES = 20;

const branchDocKey = (key, branchId) =>
  !branchId || branchId === DEFAULT_BRANCH_ID ? key : `${branchId}__${key}`;

const normalizeServiceName = (value) =>
  String(value || '')
    .normalize('NFKC')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\u0621/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

const buildTemplateId = (type, normalizedName) => {
  let hash = 2166136261;
  const value = `${type}:${normalizedName}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `svc_${type === 'interventions' ? 'i' : 'o'}_${(hash >>> 0).toString(36)}`;
};

const normalizeTemplates = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
      return Boolean(
        normalizeText(item.id)
        && normalizeText(item.name)
        && (item.type === 'interventions' || item.type === 'other')
        && Number.isFinite(Number(item.defaultPrice))
      );
    })
    .map((item) => ({
      ...item,
      normalizedName: normalizeServiceName(item.normalizedName || item.name),
      defaultPrice: Math.max(0, Number(item.defaultPrice) || 0),
      active: item.active !== false,
      usageCount: Math.max(0, Number(item.usageCount) || 0),
    }));
};

const normalizeDraftServices = (value, HttpsError) => {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > MAX_DRAFT_SERVICES) {
    throw new HttpsError('invalid-argument', 'INVALID_VISIT_SERVICES');
  }
  return value.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new HttpsError('invalid-argument', 'INVALID_VISIT_SERVICE');
    }
    const name = normalizeText(entry.name).replace(/\s+/g, ' ').slice(0, 120);
    const amount = Number(entry.amount);
    if (!name || !Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
      throw new HttpsError('invalid-argument', 'INVALID_VISIT_SERVICE');
    }
    return {
      name,
      normalizedName: normalizeServiceName(name),
      amount,
      type: entry.type === 'other' ? 'other' : 'interventions',
      paymentType: DIRECT_PAYMENT_TYPES.has(entry.paymentType) ? entry.paymentType : 'cash',
      saveAsTemplate: entry.saveAsTemplate !== false,
    };
  });
};

const createAppointmentWithVisitServices = async ({
  db,
  HttpsError,
  getCairoDateKey,
  userId,
  branchId,
  appointmentData,
  appointmentDate,
  patientName,
  secretaryName,
  draftServices: rawDraftServices,
}) => {
  const draftServices = normalizeDraftServices(rawDraftServices, HttpsError);
  const appointmentsRef = db.collection('users').doc(userId).collection('appointments');
  const appointmentRef = appointmentsRef.doc();
  if (draftServices.length === 0) {
    await appointmentRef.set(appointmentData);
    return appointmentRef.id;
  }

  const patientFileNameKey = normalizePatientNameForFile(patientName);
  if (!patientFileNameKey) {
    throw new HttpsError('failed-precondition', 'PATIENT_IDENTITY_REQUIRED');
  }
  const patientFileId = `patientFile__${encodeURIComponent(patientFileNameKey)}`;
  const normalizedBranchId = branchId || DEFAULT_BRANCH_ID;
  const dateKey = getCairoDateKey(appointmentDate);
  const userRef = db.collection('users').doc(userId);
  const patientDataRef = userRef.collection('patientFileData').doc(patientFileId);
  const templateRef = userRef
    .collection('financialData')
    .doc(branchDocKey('serviceTemplates', normalizedBranchId));

  await db.runTransaction(async (transaction) => {
    const [patientDataSnap, templateSnap] = await Promise.all([
      transaction.get(patientDataRef),
      transaction.get(templateRef),
    ]);
    const now = Date.now();
    const actorName = normalizeText(secretaryName).slice(0, 120) || 'السكرتارية';

    const newItems = draftServices.map((service, index) => {
      const templateId = service.saveAsTemplate
        ? buildTemplateId(service.type, service.normalizedName)
        : '';
      return {
        id: `ci_${now}_${index}_${Math.random().toString(36).slice(2, 9)}`,
        patientFileId,
        patientName,
        amount: service.amount,
        type: service.type,
        dateKey,
        note: service.name,
        serviceName: service.name,
        ...(templateId ? { serviceTemplateId: templateId } : {}),
        paymentType: service.paymentType,
        createdAt: now + index,
        branchId: normalizedBranchId,
        visitId: appointmentRef.id,
        source: 'secretary_appointment',
        addedByRole: 'secretary',
        addedByName: actorName,
        financialStatus: 'pending',
      };
    });

    const patientData = patientDataSnap.exists ? patientDataSnap.data() || {} : {};
    const existingPendingItems = Array.isArray(patientData.pendingCostItems)
      ? patientData.pendingCostItems
      : [];
    const updatedPendingItems = [...existingPendingItems, ...newItems];

    let updatedTemplates = normalizeTemplates(
      templateSnap.exists ? (templateSnap.data() || {}).items : []
    );
    draftServices.forEach((service) => {
      if (!service.saveAsTemplate) return;
      const templateId = buildTemplateId(service.type, service.normalizedName);
      const existingTemplate = updatedTemplates.find(
        (entry) =>
          entry.type === service.type
          && entry.normalizedName === service.normalizedName
      );
      const nextTemplate = existingTemplate
        ? {
            ...existingTemplate,
            usageCount: existingTemplate.usageCount + 1,
            updatedAt: now,
            lastUsedAt: now,
            active: true,
          }
        : {
            id: templateId,
            name: service.name,
            normalizedName: service.normalizedName,
            type: service.type,
            defaultPrice: service.amount,
            branchId: normalizedBranchId,
            active: true,
            usageCount: 1,
            createdAt: now,
            updatedAt: now,
            lastUsedAt: now,
            createdByRole: 'secretary',
            createdByName: actorName,
          };
      updatedTemplates = [
        ...updatedTemplates.filter((entry) => entry.id !== nextTemplate.id),
        nextTemplate,
      ];
    });

    transaction.set(appointmentRef, {
      ...appointmentData,
      patientFileId,
      patientFileNameKey,
      serviceChargesCount: newItems.length,
      serviceChargesTotal: newItems.reduce((sum, item) => sum + item.amount, 0),
      serviceChargesUpdatedAt: now,
      serviceChargesStatus: 'pending',
    });
    transaction.set(patientDataRef, {
      pendingCostItems: updatedPendingItems,
      updatedAt: now,
    }, { merge: true });
    transaction.set(templateRef, {
      items: updatedTemplates,
      updatedAt: now,
    }, { merge: true });
  });

  return appointmentRef.id;
};

module.exports = {
  MAX_DRAFT_SERVICES,
  normalizeDraftServices,
  createAppointmentWithVisitServices,
};
