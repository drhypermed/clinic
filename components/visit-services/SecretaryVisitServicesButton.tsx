import React from 'react';
import type { TodayAppointment } from '../appointments/public-booking/types';
import {
  addSecretaryVisitService,
  deleteSecretaryVisitService,
  loadSecretaryVisitServices,
} from '../../services/visit-services/secretaryVisitServicesService';
import type {
  AddVisitServiceInput,
  VisitServiceCharge,
  VisitServiceTemplate,
} from '../../services/visit-services/types';
import { VisitServicesModal } from './VisitServicesModal';

interface SecretaryVisitServicesButtonProps {
  userId: string;
  secret: string;
  sessionToken?: string;
  branchId?: string;
  secretaryName?: string;
  appointment: TodayAppointment;
}

export const SecretaryVisitServicesButton: React.FC<SecretaryVisitServicesButtonProps> = ({
  userId,
  secret,
  sessionToken,
  branchId,
  secretaryName,
  appointment,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<VisitServiceTemplate[]>([]);
  const [items, setItems] = React.useState<VisitServiceCharge[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const context = React.useMemo(() => ({
    userId,
    secret,
    sessionToken,
    branchId: branchId || appointment.branchId || 'main',
    appointmentId: appointment.id,
    secretaryName,
  }), [appointment.branchId, appointment.id, branchId, secret, secretaryName, sessionToken, userId]);

  const refresh = React.useCallback(async (showLoader = false) => {
    if (!isOpen) return;
    if (showLoader) setLoading(true);
    try {
      const snapshot = await loadSecretaryVisitServices(context);
      setItems(snapshot.items);
      setTemplates(snapshot.templates);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر تحميل خدمات الزيارة.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [context, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    void refresh(true);
    const intervalId = window.setInterval(() => void refresh(false), 5000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, refresh]);

  const handleAdd = async (input: AddVisitServiceInput) => {
    setSaving(true);
    setError(null);
    try {
      const snapshot = await addSecretaryVisitService(context, input);
      setItems(snapshot.items);
      setTemplates(snapshot.templates);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر إضافة الخدمة.');
      throw caught;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setSaving(true);
    setError(null);
    try {
      const snapshot = await deleteSecretaryVisitService(context, itemId);
      setItems(snapshot.items);
      setTemplates(snapshot.templates);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر حذف الخدمة.');
    } finally {
      setSaving(false);
    }
  };

  const summaryCount = Number(appointment.serviceChargesCount || 0) || 0;
  const summaryTotal = Number(appointment.serviceChargesTotal || 0) || 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-black text-brand-700 transition hover:bg-brand-100"
      >
        <span>+ خدمة/رسوم</span>
        {summaryCount > 0 && (
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-success-700">
            {summaryCount} · {summaryTotal.toLocaleString('ar-EG')} ج
          </span>
        )}
      </button>
      <VisitServicesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientName={appointment.patientName}
        templates={templates}
        items={items}
        loading={loading}
        saving={saving}
        error={error}
        onAdd={handleAdd}
        onDelete={handleDelete}
      />
    </>
  );
};

