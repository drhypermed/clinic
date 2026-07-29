import type { DirectPaymentType } from '../../utils/paymentMethods';

export type VisitServiceType = 'interventions' | 'other';
export type VisitServiceActorRole = 'doctor' | 'secretary';

export interface VisitServiceTemplate {
  id: string;
  name: string;
  normalizedName: string;
  type: VisitServiceType;
  defaultPrice: number;
  branchId: string;
  active: boolean;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
  createdByRole: VisitServiceActorRole;
  createdByName?: string;
}

export interface VisitServiceCharge {
  id: string;
  patientFileId: string;
  patientName: string;
  amount: number;
  type: VisitServiceType;
  dateKey: string;
  note?: string;
  serviceName?: string;
  serviceTemplateId?: string;
  paymentType?: DirectPaymentType;
  createdAt: number;
  branchId?: string;
  visitId?: string;
  source?: 'doctor_new_exam' | 'secretary_appointment';
  addedByRole?: VisitServiceActorRole;
  addedByName?: string;
  financialStatus?: 'pending' | 'posted';
  recordId?: string;
  postedAt?: number;
}

export interface AddVisitServiceInput {
  name: string;
  amount: number;
  type: VisitServiceType;
  paymentType: DirectPaymentType;
  saveAsTemplate: boolean;
}

export interface VisitServiceDraft extends AddVisitServiceInput {
  id: string;
}

export interface VisitServiceIdentity {
  patientFileId: string;
  patientFileNumber: number;
  patientFileNameKey: string;
}

export interface VisitServicesSnapshot {
  items: VisitServiceCharge[];
  templates: VisitServiceTemplate[];
}
