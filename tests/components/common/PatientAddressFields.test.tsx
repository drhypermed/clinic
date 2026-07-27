import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PatientAddressFields } from '../../../components/common/PatientAddressFields';
import { EGYPT_GOVERNORATES } from '../../../utils/egyptGovernorates';

const AddressFieldsHarness = () => {
  const [governorate, setGovernorate] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [details, setDetails] = useState('');

  return (
    <div>
      <PatientAddressFields
        governorate={governorate}
        onGovernorateChange={setGovernorate}
        cityArea={cityArea}
        onCityAreaChange={setCityArea}
        details={details}
        onDetailsChange={setDetails}
        fieldClassName="field"
      />
    </div>
  );
};

describe('PatientAddressFields', () => {
  it('offers all governorates and enables custom city entry through Other', () => {
    render(<AddressFieldsHarness />);

    const [governorateSelect, citySelect] = screen.getAllByRole('combobox');
    EGYPT_GOVERNORATES.forEach((governorate) => {
      expect(screen.getByRole('option', { name: governorate })).toBeInTheDocument();
    });

    fireEvent.change(governorateSelect, { target: { value: 'القاهرة' } });
    fireEvent.change(citySelect, {
      target: { value: '__other__' },
    });

    expect(screen.getByPlaceholderText('اكتب المدينة أو المنطقة الجديدة')).toBeInTheDocument();
  });
});
