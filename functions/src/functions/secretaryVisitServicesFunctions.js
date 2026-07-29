const {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  readSecretaryAuthData,
  DEFAULT_BRANCH_ID,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
} = require('./secretaryLoginHelpers');
const { normalizePatientNameForFile } = require('./statsCounterHelpers');

module.exports = ({ HttpsError, getDb, admin, getCairoDateKey }) => {
  const directPaymentTypes = new Set(['cash', 'instapay', 'wallet', 'bank_transfer']);
  const isClinicDayKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(normalizeText(value));

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

  const calculateTotals = (items) => ({
    interventionsRevenue: items
      .filter((item) => item.type === 'interventions')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    otherRevenue: items
      .filter((item) => item.type === 'other')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  });

  const buildAppointmentSummary = (items, appointmentId, now) => {
    const visitItems = items.filter((item) => item.visitId === appointmentId);
    return {
      serviceChargesCount: visitItems.length,
      serviceChargesTotal: visitItems.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      ),
      serviceChargesUpdatedAt: now,
    };
  };

  const authorize = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
    if (!userId || !secret) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }

    const db = getDb();
    const configSnap = await db.collection('bookingConfig').doc(secret).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
    }
    const configData = configSnap.data() || {};
    if (configData.userId !== userId) {
      throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
    }

    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: normalizeEmail(configData.doctorEmail),
      configData,
    });
    await assertSecretarySessionForBranch({
      db,
      secret,
      mainAuth: auth,
      branchId,
      sessionToken,
      HttpsError,
    });
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });
    return { db, userId, branchId };
  };

  const getVisitContext = async (request) => {
    const authContext = await authorize(request);
    const appointmentId = normalizeText(request?.data?.appointmentId);
    if (!appointmentId) throw new HttpsError('invalid-argument', 'MISSING_APPOINTMENT_ID');

    const appointmentRef = authContext.db
      .collection('users')
      .doc(authContext.userId)
      .collection('appointments')
      .doc(appointmentId);
    const appointmentSnap = await appointmentRef.get();
    if (!appointmentSnap.exists) throw new HttpsError('not-found', 'APPOINTMENT_NOT_FOUND');
    const appointment = appointmentSnap.data() || {};
    const appointmentBranchId = normalizeText(appointment.branchId) || DEFAULT_BRANCH_ID;
    if (appointmentBranchId !== authContext.branchId) {
      throw new HttpsError('permission-denied', 'APPOINTMENT_BRANCH_MISMATCH');
    }
    return {
      ...authContext,
      appointmentId,
      appointmentRef,
      appointment,
    };
  };

  const resolvePatientIdentity = (appointment) => {
    const patientName = normalizeText(appointment.patientName).slice(0, 120);
    const patientFileNameKey =
      normalizeText(appointment.patientFileNameKey)
      || normalizePatientNameForFile(patientName);
    const expectedPatientFileId = `patientFile__${encodeURIComponent(patientFileNameKey)}`;
    const storedPatientFileId = normalizeText(appointment.patientFileId);
    const patientFileId =
      storedPatientFileId === expectedPatientFileId
        ? storedPatientFileId
        : expectedPatientFileId;
    return { patientName, patientFileNameKey, patientFileId };
  };

  const getRefs = (context, identity, dateKey) => {
    const userRef = context.db.collection('users').doc(context.userId);
    return {
      patientSettingRef: userRef.collection('settings').doc(identity.patientFileId),
      counterRef: userRef.collection('settings').doc('patientFilesMeta'),
      patientDataRef: userRef.collection('patientFileData').doc(identity.patientFileId),
      dailyRef: userRef
        .collection('financialData')
        .doc('daily')
        .collection('entries')
        .doc(branchDocKey(dateKey, context.branchId)),
      templateRef: userRef
        .collection('financialData')
        .doc(branchDocKey('serviceTemplates', context.branchId)),
    };
  };

  const listVisitServicesForSecretary = async (request) => {
    const context = await getVisitContext(request);
    const identity = resolvePatientIdentity(context.appointment);
    const refs = getRefs(context, identity, getCairoDateKey(new Date()));
    const [patientDataSnap, templateSnap] = await Promise.all([
      refs.patientDataRef.get(),
      refs.templateRef.get(),
    ]);
    const patientData = patientDataSnap.exists ? patientDataSnap.data() || {} : {};
    const items = [
      ...(Array.isArray(patientData.costItems) ? patientData.costItems : []),
      ...(Array.isArray(patientData.pendingCostItems) ? patientData.pendingCostItems : []),
    ].filter((item) => item?.visitId === context.appointmentId);
    const templateData = templateSnap.exists ? templateSnap.data() || {} : {};
    return {
      items,
      templates: normalizeTemplates(templateData.items),
    };
  };

  const listVisitServiceTemplatesForSecretary = async (request) => {
    const context = await authorize(request);
    const templateRef = context.db
      .collection('users')
      .doc(context.userId)
      .collection('financialData')
      .doc(branchDocKey('serviceTemplates', context.branchId));
    const templateSnap = await templateRef.get();
    return {
      templates: normalizeTemplates(
        templateSnap.exists ? (templateSnap.data() || {}).items : []
      ),
    };
  };

  const addVisitServiceForSecretary = async (request) => {
    const context = await getVisitContext(request);
    const serviceName = normalizeText(request?.data?.name).replace(/\s+/g, ' ').slice(0, 120);
    const normalizedName = normalizeServiceName(serviceName);
    const amount = Number(request?.data?.amount);
    const type = request?.data?.type === 'other' ? 'other' : 'interventions';
    const paymentType = directPaymentTypes.has(request?.data?.paymentType)
      ? request.data.paymentType
      : 'cash';
    const saveAsTemplate = request?.data?.saveAsTemplate !== false;
    const secretaryName = normalizeText(request?.data?.secretaryName).slice(0, 120) || 'السكرتارية';
    if (!serviceName) throw new HttpsError('invalid-argument', 'SERVICE_NAME_REQUIRED');
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
      throw new HttpsError('invalid-argument', 'INVALID_SERVICE_AMOUNT');
    }

    const identity = resolvePatientIdentity(context.appointment);
    if (!identity.patientName || !identity.patientFileNameKey) {
      throw new HttpsError('failed-precondition', 'PATIENT_IDENTITY_REQUIRED');
    }
    const appointmentDate = new Date(
      context.appointment.examCompletedAt
      || context.appointment.dateTime
      || Date.now()
    );
    const recordId = normalizeText(context.appointment.recordId);
    const recordSnap = recordId
      ? await context.db
          .collection('users')
          .doc(context.userId)
          .collection('records')
          .doc(recordId)
          .get()
      : null;
    const recordData = recordSnap?.exists ? recordSnap.data() || {} : {};
    const storedClinicDayKey = isClinicDayKey(context.appointment.clinicDayKey)
      ? normalizeText(context.appointment.clinicDayKey)
      : (isClinicDayKey(recordData.clinicDayKey) ? normalizeText(recordData.clinicDayKey) : '');
    // Existing visits keep their stored operational day. Legacy visits fall back
    // to their original Cairo calendar date so a later setting change never moves them.
    const dateKey = storedClinicDayKey || getCairoDateKey(
      Number.isNaN(appointmentDate.getTime()) ? new Date() : appointmentDate
    );
    const storedCutoff = Number(
      context.appointment.clinicDayCutoffMinutes
      ?? recordData.clinicDayCutoffMinutes
    );
    const clinicDayCutoffMinutes = Number.isFinite(storedCutoff)
      ? Math.max(0, Math.min(1439, Math.round(storedCutoff)))
      : undefined;
    const refs = getRefs(context, identity, dateKey);
    const now = Date.now();
    const itemId = `ci_${now}_${Math.random().toString(36).slice(2, 9)}`;
    const templateId = saveAsTemplate ? buildTemplateId(type, normalizedName) : '';
    const appointmentCompleted =
      Boolean(normalizeText(context.appointment.examCompletedAt))
      || Boolean(normalizeText(context.appointment.recordId));

    if (!appointmentCompleted) {
      return context.db.runTransaction(async (transaction) => {
        const [appointmentSnap, patientDataSnap, templateSnap] = await Promise.all([
          transaction.get(context.appointmentRef),
          transaction.get(refs.patientDataRef),
          transaction.get(refs.templateRef),
        ]);
        if (!appointmentSnap.exists) throw new HttpsError('not-found', 'APPOINTMENT_NOT_FOUND');
        const freshAppointment = appointmentSnap.data() || {};
        const freshBranchId = normalizeText(freshAppointment.branchId) || DEFAULT_BRANCH_ID;
        if (freshBranchId !== context.branchId) {
          throw new HttpsError('permission-denied', 'APPOINTMENT_BRANCH_MISMATCH');
        }
        const becameCompleted =
          Boolean(normalizeText(freshAppointment.examCompletedAt))
          || Boolean(normalizeText(freshAppointment.recordId));
        if (becameCompleted) {
          throw new HttpsError('aborted', 'APPOINTMENT_COMPLETED_RETRY');
        }

        const item = {
          id: itemId,
          patientFileId: identity.patientFileId,
          patientName: identity.patientName,
          amount,
          type,
          dateKey,
          note: serviceName,
          serviceName,
          ...(templateId ? { serviceTemplateId: templateId } : {}),
          paymentType,
          createdAt: now,
          branchId: context.branchId,
          visitId: context.appointmentId,
          source: 'secretary_appointment',
          addedByRole: 'secretary',
          addedByName: secretaryName,
          financialStatus: 'pending',
          ...(clinicDayCutoffMinutes !== undefined ? { clinicDayCutoffMinutes } : {}),
        };
        const patientData = patientDataSnap.exists ? patientDataSnap.data() || {} : {};
        const pendingItems = Array.isArray(patientData.pendingCostItems)
          ? patientData.pendingCostItems
          : [];
        const postedItems = Array.isArray(patientData.costItems) ? patientData.costItems : [];
        const updatedPendingItems = [...pendingItems.filter((entry) => entry?.id !== itemId), item];

        const templates = normalizeTemplates(
          templateSnap.exists ? (templateSnap.data() || {}).items : []
        );
        let updatedTemplates = templates;
        if (saveAsTemplate && templateId) {
          const existingTemplate = templates.find(
            (entry) => entry.type === type && entry.normalizedName === normalizedName
          );
          const template = existingTemplate
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
                type,
                defaultPrice: amount,
                branchId: context.branchId,
                active: true,
                usageCount: 1,
                createdAt: now,
                updatedAt: now,
                lastUsedAt: now,
                createdByRole: 'secretary',
                createdByName: secretaryName,
              };
          updatedTemplates = [
            ...templates.filter((entry) => entry.id !== template.id),
            template,
          ];
          transaction.set(refs.templateRef, {
            items: updatedTemplates,
            updatedAt: now,
          }, { merge: true });
        }

        transaction.set(refs.patientDataRef, {
          pendingCostItems: updatedPendingItems,
          updatedAt: now,
        }, { merge: true });
        transaction.set(context.appointmentRef, {
          patientFileId: identity.patientFileId,
          patientFileNameKey: identity.patientFileNameKey,
          ...buildAppointmentSummary(
            [...postedItems, ...updatedPendingItems],
            context.appointmentId,
            now
          ),
          serviceChargesStatus: 'pending',
        }, { merge: true });

        return {
          items: [
            ...postedItems,
            ...updatedPendingItems,
          ].filter((entry) => entry?.visitId === context.appointmentId),
          templates: updatedTemplates,
        };
      });
    }

    const transactionResult = await context.db.runTransaction(async (transaction) => {
      const [
        appointmentSnap,
        patientSettingSnap,
        counterSnap,
        patientDataSnap,
        dailySnap,
        templateSnap,
      ] = await Promise.all([
        transaction.get(context.appointmentRef),
        transaction.get(refs.patientSettingRef),
        transaction.get(refs.counterRef),
        transaction.get(refs.patientDataRef),
        transaction.get(refs.dailyRef),
        transaction.get(refs.templateRef),
      ]);
      if (!appointmentSnap.exists) throw new HttpsError('not-found', 'APPOINTMENT_NOT_FOUND');
      const freshAppointment = appointmentSnap.data() || {};
      const freshBranchId = normalizeText(freshAppointment.branchId) || DEFAULT_BRANCH_ID;
      if (freshBranchId !== context.branchId) {
        throw new HttpsError('permission-denied', 'APPOINTMENT_BRANCH_MISMATCH');
      }

      const patientSetting = patientSettingSnap.exists ? patientSettingSnap.data() || {} : {};
      const counter = counterSnap.exists ? counterSnap.data() || {} : {};
      const existingFileNumber = Number(patientSetting.patientFileNumber);
      const lastNumber = Number(counter.lastNumber);
      const patientFileNumber =
        Number.isFinite(existingFileNumber) && existingFileNumber > 0
          ? Math.floor(existingFileNumber)
          : (Number.isFinite(lastNumber) && lastNumber > 0 ? Math.floor(lastNumber) : 0) + 1;

      const patientData = patientDataSnap.exists ? patientDataSnap.data() || {} : {};
      const costItems = Array.isArray(patientData.costItems) ? patientData.costItems : [];
      const item = {
        id: itemId,
        patientFileId: identity.patientFileId,
        patientName: identity.patientName,
        amount,
        type,
        dateKey,
        note: serviceName,
        serviceName,
        ...(templateId ? { serviceTemplateId: templateId } : {}),
        paymentType,
        createdAt: now,
        branchId: context.branchId,
        visitId: context.appointmentId,
        source: 'secretary_appointment',
        addedByRole: 'secretary',
        addedByName: secretaryName,
        financialStatus: 'posted',
        postedAt: now,
        ...(clinicDayCutoffMinutes !== undefined ? { clinicDayCutoffMinutes } : {}),
      };
      const updatedPatientItems = [...costItems.filter((entry) => entry?.id !== itemId), item];

      const dailyData = dailySnap.exists ? dailySnap.data() || {} : {};
      const dailyItems = Array.isArray(dailyData.cashCostItems) ? dailyData.cashCostItems : [];
      const updatedDailyItems = [...dailyItems.filter((entry) => entry?.id !== itemId), item];
      const totals = calculateTotals(updatedDailyItems);

      transaction.set(refs.patientSettingRef, {
        patientName: identity.patientName,
        patientFileNameKey: identity.patientFileNameKey,
        patientFileNumber,
        ...(normalizeText(freshAppointment.phone)
          ? { phone: normalizeText(freshAppointment.phone).slice(0, 30) }
          : {}),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(patientSettingSnap.exists
          ? {}
          : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
      }, { merge: true });
      if (!(Number.isFinite(existingFileNumber) && existingFileNumber > 0)) {
        transaction.set(refs.counterRef, {
          lastNumber: patientFileNumber,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ...(counterSnap.exists
            ? {}
            : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
        }, { merge: true });
      }
      transaction.set(refs.patientDataRef, {
        costItems: updatedPatientItems,
        updatedAt: now,
      }, { merge: true });
      transaction.set(refs.dailyRef, {
        cashCostItems: updatedDailyItems,
        ...totals,
        updatedAt: now,
      }, { merge: true });

      const templates = normalizeTemplates(
        templateSnap.exists ? (templateSnap.data() || {}).items : []
      );
      let updatedTemplates = templates;
      if (saveAsTemplate && templateId) {
        const existingTemplate = templates.find(
          (entry) => entry.type === type && entry.normalizedName === normalizedName
        );
        const template = existingTemplate
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
              type,
              defaultPrice: amount,
              branchId: context.branchId,
              active: true,
              usageCount: 1,
              createdAt: now,
              updatedAt: now,
              lastUsedAt: now,
              createdByRole: 'secretary',
              createdByName: secretaryName,
            };
        updatedTemplates = [
          ...templates.filter((entry) => entry.id !== template.id),
          template,
        ];
        transaction.set(refs.templateRef, {
          items: updatedTemplates,
          updatedAt: now,
        }, { merge: true });
      }

      transaction.set(context.appointmentRef, {
        patientFileId: identity.patientFileId,
        patientFileNumber,
        patientFileNameKey: identity.patientFileNameKey,
        clinicDayKey: dateKey,
        ...(clinicDayCutoffMinutes !== undefined ? { clinicDayCutoffMinutes } : {}),
        ...buildAppointmentSummary(updatedPatientItems, context.appointmentId, now),
      }, { merge: true });

      return {
        items: updatedPatientItems.filter((entry) => entry?.visitId === context.appointmentId),
        templates: updatedTemplates,
      };
    });

    return transactionResult;
  };

  const deleteVisitServiceForSecretary = async (request) => {
    const context = await getVisitContext(request);
    const itemId = normalizeText(request?.data?.itemId);
    if (!itemId) throw new HttpsError('invalid-argument', 'MISSING_ITEM_ID');
    const identity = resolvePatientIdentity(context.appointment);
    const patientDataRef = context.db
      .collection('users')
      .doc(context.userId)
      .collection('patientFileData')
      .doc(identity.patientFileId);
    const templateRef = context.db
      .collection('users')
      .doc(context.userId)
      .collection('financialData')
      .doc(branchDocKey('serviceTemplates', context.branchId));

    const items = await context.db.runTransaction(async (transaction) => {
      const patientDataSnap = await transaction.get(patientDataRef);
      if (!patientDataSnap.exists) return [];
      const patientData = patientDataSnap.data() || {};
      const costItems = Array.isArray(patientData.costItems) ? patientData.costItems : [];
      const pendingItems = Array.isArray(patientData.pendingCostItems)
        ? patientData.pendingCostItems
        : [];
      const pendingTarget = pendingItems.find(
        (entry) => entry?.id === itemId && entry?.visitId === context.appointmentId
      );
      if (pendingTarget) {
        const appointmentSnap = await transaction.get(context.appointmentRef);
        const updatedPendingItems = pendingItems.filter((entry) => entry?.id !== itemId);
        const now = Date.now();
        transaction.set(patientDataRef, {
          pendingCostItems: updatedPendingItems,
          updatedAt: now,
        }, { merge: true });
        if (appointmentSnap.exists) {
          transaction.set(context.appointmentRef, {
            ...buildAppointmentSummary(
              [...costItems, ...updatedPendingItems],
              context.appointmentId,
              now
            ),
            serviceChargesStatus: updatedPendingItems.some(
              (entry) => entry?.visitId === context.appointmentId
            ) ? 'pending' : 'posted',
          }, { merge: true });
        }
        return [
          ...costItems,
          ...updatedPendingItems,
        ].filter((entry) => entry?.visitId === context.appointmentId);
      }
      const target = costItems.find(
        (entry) => entry?.id === itemId && entry?.visitId === context.appointmentId
      );
      if (!target) return costItems.filter((entry) => entry?.visitId === context.appointmentId);

      const dailyRef = context.db
        .collection('users')
        .doc(context.userId)
        .collection('financialData')
        .doc('daily')
        .collection('entries')
        .doc(branchDocKey(target.dateKey, context.branchId));
      const [dailySnap, appointmentSnap] = await Promise.all([
        transaction.get(dailyRef),
        transaction.get(context.appointmentRef),
      ]);
      const updatedPatientItems = costItems.filter((entry) => entry?.id !== itemId);
      const dailyData = dailySnap.exists ? dailySnap.data() || {} : {};
      const updatedDailyItems = (Array.isArray(dailyData.cashCostItems)
        ? dailyData.cashCostItems
        : []).filter((entry) => entry?.id !== itemId);
      const now = Date.now();

      transaction.set(patientDataRef, {
        costItems: updatedPatientItems,
        updatedAt: now,
      }, { merge: true });
      transaction.set(dailyRef, {
        cashCostItems: updatedDailyItems,
        ...calculateTotals(updatedDailyItems),
        updatedAt: now,
      }, { merge: true });
      if (appointmentSnap.exists) {
        transaction.set(
          context.appointmentRef,
          buildAppointmentSummary(updatedPatientItems, context.appointmentId, now),
          { merge: true }
        );
      }
      return updatedPatientItems.filter((entry) => entry?.visitId === context.appointmentId);
    });

    const templateSnap = await templateRef.get();
    return {
      items,
      templates: normalizeTemplates(
        templateSnap.exists ? (templateSnap.data() || {}).items : []
      ),
    };
  };

  return {
    listVisitServiceTemplatesForSecretary,
    listVisitServicesForSecretary,
    addVisitServiceForSecretary,
    deleteVisitServiceForSecretary,
  };
};
