import { PrescriptionItem } from '../../types';

export interface AppStateSnapshot {
    rxItems: PrescriptionItem[];
    generalAdvice: string[];
    labInvestigations: string[];
}

export interface NotificationState {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    position?: { top: number; left: number };
    createdAt: number;
    isPersistent?: boolean;
    firestoreId?: string; // If this came from a Firestore document
}

