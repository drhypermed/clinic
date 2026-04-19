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
}

export const SecretaryPage: React.FC<SecretaryPageProps> = ({
  bookingSecret,
  onBookingSecretReady,
  prescriptionVitalsConfig,
  prescriptionCustomBoxes,
  onSyncSecretaryVitalsVisibility,
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
  });

  return (
    <div data-no-reveal className="h-full dh-stagger-1" dir="rtl">
      <BookingSectionSecretary
        isOpen={true}
        onToggleOpen={() => {}}
        alwaysExpanded={true}
        doctorEmail={user?.email ?? ''}
        currentBranchLabel={currentBranchLabel}
        hasMultipleBranches={hasMultipleBranches}
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
