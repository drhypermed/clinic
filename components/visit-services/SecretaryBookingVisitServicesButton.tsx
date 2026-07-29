import React from 'react';
import {
  loadSecretaryVisitServiceTemplates,
} from '../../services/visit-services/secretaryVisitServicesService';
import type {
  AddVisitServiceInput,
  VisitServiceCharge,
  VisitServiceDraft,
  VisitServiceTemplate,
} from '../../services/visit-services/types';
import { VisitServicesModal } from './VisitServicesModal';

interface SecretaryBookingVisitServicesButtonProps {
  userId: string;
  secret: string;
  sessionToken?: string;
  branchId?: string;
  secretaryName?: string;
  patientName: string;
  drafts: VisitServiceDraft[];
  onChange: (drafts: VisitServiceDraft[]) => void;
  disabled?: boolean;
}

const makeDraftId = () =>
  `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const SecretaryBookingVisitServicesButton: React.FC<
  SecretaryBookingVisitServicesButtonProps
> = ({
  userId,
  secret,
  sessionToken,
  branchId,
  secretaryName,
  patientName,
  drafts,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<VisitServiceTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError(null);
    void loadSecretaryVisitServiceTemplates({
      userId,
      secret,
      sessionToken,
      branchId: branchId || 'main',
    })
      .then((loadedTemplates) => {
        if (active) setTemplates(loadedTemplates);
      })
      .catch((caught) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : 'تعذر تحميل الخدمات الجاهزة.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [branchId, isOpen, secret, sessionToken, userId]);

  const modalItems = React.useMemo<VisitServiceCharge[]>(
    () => drafts.map((draft) => ({
      id: draft.id,
      patientFileId: '',
      patientName,
      amount: draft.amount,
      type: draft.type,
      paymentType: draft.paymentType,
      financialStatus: 'pending',
      createdAt: 0,
      dateKey: '',
      serviceName: draft.name,
      note: draft.name,
      addedByRole: 'secretary',
      addedByName: secretaryName || 'السكرتارية',
    })),
    [drafts, patientName, secretaryName],
  );

  const handleAdd = (input: AddVisitServiceInput) => {
    if (drafts.length >= 20) {
      setError('الحد الأقصى 20 خدمة أو رسمًا داخل الموعد الواحد.');
      throw new Error('MAX_VISIT_SERVICES_REACHED');
    }
    onChange([...drafts, { id: makeDraftId(), ...input }]);
    setError(null);
  };

  const handleDelete = (itemId: string) => {
    onChange(drafts.filter((draft) => draft.id !== itemId));
  };

  const total = drafts.reduce(
    (sum, draft) => sum + (Number(draft.amount) || 0),
    0,
  );

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-black text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <span>+ إضافة خدمة/رسوم</span>
        {drafts.length > 0 && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-success-700">
            {drafts.length} · {total.toLocaleString('ar-EG')} ج
          </span>
        )}
      </button>
      <VisitServicesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientName={patientName}
        templates={templates}
        items={modalItems}
        loading={loading}
        error={error}
        initialPaymentType="cash"
        onAdd={handleAdd}
        onDelete={handleDelete}
      />
    </>
  );
};
