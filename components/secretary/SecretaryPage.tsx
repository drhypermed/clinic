import React from 'react';
import type {
  CustomBox,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
  VitalSignConfig,
} from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { BookingSectionSecretary } from '../appointments/BookingSectionSecretary';
import { useBookingSectionControls } from '../appointments/appointments-view/useBookingSectionControls';
import { toLocalDateStr } from '../appointments/utils';

interface SecretaryPageProps {
  bookingSecret: string | null;
  onBookingSecretReady?: (secret: string) => void;
  prescriptionVitalsConfig?: VitalSignConfig[];
  prescriptionCustomBoxes?: CustomBox[];
  onSyncSecretaryVitalsVisibility?: (
    visibility: SecretaryVitalsVisibility,
    fields: SecretaryVitalFieldDefinition[],
    resolvedSecret?: string
  ) => Promise<void> | void;
  /** اسم الطبيب — يُمرَّر للحفظ على bookingConfig وعرضه للسكرتيرة. */
  doctorName?: string;
  doctorSpecialty?: string;
}

export const SecretaryPage: React.FC<SecretaryPageProps> = ({
  bookingSecret,
  onBookingSecretReady,
  prescriptionVitalsConfig,
  prescriptionCustomBoxes,
  onSyncSecretaryVitalsVisibility,
  doctorSpecialty,
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const currentDayStr = toLocalDateStr(new Date());

  const {
    credentialsSaving,
    credentialsError,
    credentialsSuccess,
    bookingFormTitle,
    onBookingFormTitleChange,
    secretaryPassword,
    onSecretaryPasswordChange,
    secretaryVitalFields,
    secretaryVitalsVisibility,
    onSecretaryVitalVisibilityChange,
    saveBookingCredentials,
    currentBranchLabel,
    hasMultipleBranches,
  } = useBookingSectionControls({
    userId,
    bookingSecret,
    onBookingSecretReady,
    prescriptionVitalsConfig,
    prescriptionCustomBoxes,
    onSyncSecretaryVitalsVisibility,
    userDisplayName: user?.displayName,
    userEmail: user?.email,
    currentDayStr,
    doctorSpecialty,
  });

  return (
    <div data-no-reveal className="h-full dh-stagger-1" dir="rtl">
      <BookingSectionSecretary
        isOpen={true}
        onToggleOpen={() => {}}
        alwaysExpanded={true}
        // إيميل الطبيب هو بيانات الدخول التي تحتاجها السكرتارية.
        doctorEmail={user?.email ?? ''}
        currentBranchLabel={currentBranchLabel}
        hasMultipleBranches={hasMultipleBranches}
        doctorSpecialty={doctorSpecialty}
        bookingFormTitle={bookingFormTitle}
        onBookingFormTitleChange={onBookingFormTitleChange}
        secretaryPassword={secretaryPassword}
        onSecretaryPasswordChange={onSecretaryPasswordChange}
        secretaryVitalFields={secretaryVitalFields}
        secretaryVitalsVisibility={secretaryVitalsVisibility}
        onSecretaryVitalVisibilityChange={onSecretaryVitalVisibilityChange}
        credentialsSaving={credentialsSaving}
        credentialsError={credentialsError}
        credentialsSuccess={credentialsSuccess}
        onSaveCredentials={saveBookingCredentials}
      />
    </div>
  );
};
