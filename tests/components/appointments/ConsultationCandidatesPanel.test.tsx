import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConsultationCandidatesPanel } from '../../../components/appointments/add-appointment-form/ConsultationCandidatesPanel';
import type { RecentExamPatientOption } from '../../../components/appointments/add-appointment-form/types';

const candidates: RecentExamPatientOption[] = Array.from({ length: 12 }, (_, index) => ({
  id: `exam-${index + 1}`,
  patientName: `مريض ${index + 1}`,
  phone: `010000000${String(index + 1).padStart(2, '0')}`,
  patientFileNumber: 100 + index + 1,
  examCompletedAt: `2026-07-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
}));

describe('ConsultationCandidatesPanel', () => {
  it('shows ten candidates first, then reveals ten more on demand', () => {
    render(
      <ConsultationCandidatesPanel
        consultationCandidates={candidates}
        onSelectCandidate={vi.fn()}
      />,
    );

    expect(screen.getByText('مريض 10')).toBeInTheDocument();
    expect(screen.queryByText('مريض 11')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'تحميل 10 مرضى إضافيين' }));

    expect(screen.getByText('مريض 11')).toBeInTheDocument();
    expect(screen.getByText('مريض 12')).toBeInTheDocument();
  });

  it('searches the complete pool and selects the exact exam result', () => {
    const onSelectCandidate = vi.fn();
    render(
      <ConsultationCandidatesPanel
        consultationCandidates={candidates}
        onSelectCandidate={onSelectCandidate}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox', {
      name: 'بحث في كشوفات آخر 30 يوم',
    }), {
      target: { value: '112' },
    });

    expect(screen.getByText('مريض 12')).toBeInTheDocument();
    expect(screen.queryByText('مريض 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 نتيجة')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'حجز استشارة' }));
    expect(onSelectCandidate).toHaveBeenCalledWith(candidates[11]);
  });
});
