import React from 'react';
import {
  addDoctorVisitService,
  deleteDoctorVisitService,
  subscribeToDoctorVisitServiceItems,
  subscribeToVisitServiceTemplates,
} from '../../services/visit-services/doctorVisitServicesService';
import {
  buildPatientFileDocIdFromNameKey,
  buildPatientFileNameKey,
} from '../../services/patient-files/normalizers';
import { filterVisitServiceItems } from '../../services/visit-services/helpers';
import type {
  AddVisitServiceInput,
  VisitServiceCharge,
  VisitServiceTemplate,
} from '../../services/visit-services/types';
import type { PaymentType } from '../../types';
import type { DirectPaymentType } from '../../utils/paymentMethods';
import { isDirectPaymentType } from '../../utils/paymentMethods';
import { VisitServicesModal } from './VisitServicesModal';

interface DoctorVisitServicesButtonProps {
  userId: string;
  branchId?: string;
  patientName: string;
  phone?: string;
  patientFileId?: string | null;
  dateKey: string;
  visitType: 'exam' | 'consultation';
  appointmentId?: string;
  doctorName?: string;
  paymentType?: PaymentType;
  onPatientFileResolved?: (identity: {
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
  }) => void;
}

const createManualVisitId = (visitType: 'exam' | 'consultation', dateKey: string) =>
  `manual:${visitType}:${dateKey}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;

export const DoctorVisitServicesButton: React.FC<DoctorVisitServicesButtonProps> = ({
  userId,
  branchId,
  patientName,
  phone,
  patientFileId,
  dateKey,
  visitType,
  appointmentId,
  doctorName,
  paymentType,
  onPatientFileResolved,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<VisitServiceTemplate[]>([]);
  const [allItems, setAllItems] = React.useState<VisitServiceCharge[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resolvedFileId, setResolvedFileId] = React.useState<string | null>(patientFileId || null);
  const [manualVisitId, setManualVisitId] = React.useState(
    () => createManualVisitId(visitType, dateKey),
  );
  const previousDraftScope = React.useRef({
    dateKey,
    visitType,
    hadPatient: Boolean(patientName.trim()),
  });
  const visitId = appointmentId || manualVisitId;

  React.useEffect(() => {
    if (patientFileId) {
      setResolvedFileId(patientFileId);
    } else if (!patientName.trim()) {
      setResolvedFileId(null);
      setAllItems([]);
    }
  }, [patientFileId, patientName]);

  React.useEffect(() => {
    const hasPatient = Boolean(patientName.trim());
    const previous = previousDraftScope.current;
    const draftWasReset = previous.hadPatient && !hasPatient;
    const visitScopeChanged = previous.dateKey !== dateKey || previous.visitType !== visitType;
    if (!appointmentId && (draftWasReset || visitScopeChanged)) {
      setManualVisitId(createManualVisitId(visitType, dateKey));
    }
    previousDraftScope.current = { dateKey, visitType, hadPatient: hasPatient };
  }, [appointmentId, dateKey, patientName, visitType]);

  React.useEffect(() => {
    if (!isOpen || !userId) return;
    return subscribeToVisitServiceTemplates(userId, branchId, setTemplates);
  }, [branchId, isOpen, userId]);

  React.useEffect(() => {
    if (!isOpen || !userId) return;
    const fallbackFileId = buildPatientFileDocIdFromNameKey(buildPatientFileNameKey(patientName));
    const fileId = resolvedFileId || fallbackFileId;
    if (!fileId) {
      setAllItems([]);
      return;
    }
    setLoading(true);
    return subscribeToDoctorVisitServiceItems(userId, fileId, (items) => {
      setResolvedFileId(fileId);
      setAllItems(items);
      setLoading(false);
    });
  }, [isOpen, patientName, resolvedFileId, userId]);

  const visibleItems = React.useMemo(
    () => filterVisitServiceItems(allItems, visitId, dateKey),
    [allItems, dateKey, visitId],
  );
  const total = visibleItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const directPaymentType: DirectPaymentType = isDirectPaymentType(paymentType)
    ? paymentType
    : 'cash';

  const handleAdd = async (input: AddVisitServiceInput) => {
    setSaving(true);
    setError(null);
    try {
      const result = await addDoctorVisitService({
        userId,
        branchId,
        patientFileId: resolvedFileId,
        patientName,
        phone,
        dateKey,
        visitId,
        appointmentId,
        serviceName: input.name,
        amount: input.amount,
        type: input.type,
        paymentType: input.paymentType,
        saveAsTemplate: input.saveAsTemplate,
        actorName: doctorName,
      });
      setResolvedFileId(result.identity.patientFileId);
      onPatientFileResolved?.(result.identity);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر إضافة الخدمة.');
      throw caught;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!resolvedFileId) return;
    setSaving(true);
    setError(null);
    try {
      await deleteDoctorVisitService({
        userId,
        branchId,
        patientFileId: resolvedFileId,
        itemId,
        appointmentId,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر حذف الخدمة.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 to-success-50 px-4 py-3 text-right shadow-sm transition hover:border-brand-300 hover:shadow-md"
      >
        <span>
          <span className="block text-sm font-black text-slate-900">إضافة خدمة/رسوم</span>
          <span className="mt-0.5 block text-[11px] font-bold text-slate-500">
            تداخل طبي أو دخل آخر مرتبط بهذه الزيارة
          </span>
        </span>
        <span className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-xs font-black text-white">
          {visibleItems.length > 0
            ? `${visibleItems.length} · ${total.toLocaleString('ar-EG')} ج.م`
            : '+ إضافة'}
        </span>
      </button>
      <VisitServicesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientName={patientName}
        templates={templates}
        items={visibleItems}
        loading={loading}
        saving={saving}
        initialPaymentType={directPaymentType}
        error={error}
        onAdd={handleAdd}
        onDelete={handleDelete}
      />
    </>
  );
};
