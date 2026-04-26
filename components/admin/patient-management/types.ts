import { Dispatch, SetStateAction, ReactNode } from 'react';
import { PublicUserBooking } from '../../../types';

export interface PatientAccount {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastLoginAt?: string;
  isAccountDisabled?: boolean;
  disabledReason?: string;
  disabledAt?: string;
  verificationStatus?: string;
  totalAppointments: number;
  completedAppointments: number;
  totalReviews: number;
  averageRating: string;
  bookings: PublicUserBooking[];
  // علامة هل تم جلب حجوزات هذا المريض من Firestore (lazy loading)
  // false = الإحصائيات أصفار حالياً ولم تُجلب الحجوزات بعد لتوفير قراءات
  bookingsLoaded?: boolean;
}

export interface PatientManagementPanelProps {
  currentView: string;
}

type HighlightMatchFn = (value: string | undefined | null) => ReactNode;

export interface PatientManagementTableProps {
  patients: PatientAccount[];
  filteredPatients: PatientAccount[];
  highlightMatch: HighlightMatchFn;
  onDisableAccount: (patientId: string) => Promise<void> | void;
  onEnableAccount: (patientId: string) => Promise<void> | void;
  onDeletePatient: (patientId: string) => Promise<void> | void;
  onOpenReviews: (patient: PatientAccount) => void;
  // جلب الإحصائيات لمريض محدد عند الطلب (lazy)
  onLoadStats: (patientId: string) => Promise<void> | void;
  // معرّف المريض الذي تُجلب إحصائياته الآن (لإظهار loading state على زر واحد فقط)
  bookingsLoadingId: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => Promise<void> | void;
}

export interface PatientReviewsModalProps {
  selectedPatientId: string;
  selectedPatientName: string;
  selectedPatientReviews: PublicUserBooking[] | null;
  highlightMatch: HighlightMatchFn;
  onDeleteReview: (patientId: string, bookingId: string) => Promise<void> | void;
  onClose: () => void;
}

export interface UsePatientManagementActionsParams {
  isAdminUser: boolean;
  adminEmail?: string | null;
  setPatients: Dispatch<SetStateAction<PatientAccount[]>>;
  setSelectedPatientReviews: Dispatch<SetStateAction<PublicUserBooking[] | null>>;
}
