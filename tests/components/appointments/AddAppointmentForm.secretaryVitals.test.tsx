import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AddAppointmentForm } from '../../../components/appointments/add-appointment-form/AddAppointmentForm';
import type { SecretaryVitalFieldDefinition } from '../../../types';

const noop = vi.fn();

const secretaryWeightField: SecretaryVitalFieldDefinition = {
  id: 'vital:weight',
  kind: 'vital',
  key: 'weight',
  label: 'Weight',
  labelAr: 'Weight',
  unit: 'kg',
  order: 1,
  enabled: true,
};

const renderForm = () =>
  render(
    <AddAppointmentForm
      patientName=""
      onPatientNameChange={noop}
      age=""
      onAgeChange={noop}
      phone=""
      onPhoneChange={noop}
      dateStr="2026-06-03"
      onDateStrChange={noop}
      timeStr="12:00"
      onTimeStrChange={noop}
      visitReason=""
      onVisitReasonChange={noop}
      secretaryVitals={{}}
      secretaryVitalFields={[secretaryWeightField]}
      secretaryVitalsVisibility={{ weight: true, 'vital:weight': true }}
      doctorSpecialty="Cardiology"
      onSecretaryVitalsChange={noop}
      todayStr="2026-06-03"
      timeMin={undefined}
      saving={false}
      formError={null}
      onSubmit={noop}
      hideTopHeader
    />
  );

describe('AddAppointmentForm secretary vitals', () => {
  it('shows configured secretary vital fields for non-pediatric specialties', () => {
    renderForm();

    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('kg')).toBeInTheDocument();
  });
});
