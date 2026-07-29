import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PatientAddressFields } from '../../../components/common/PatientAddressFields';

const AddressFieldsHarness = () => {
  const [governorate, setGovernorate] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [details, setDetails] = useState('');

  return (
    <PatientAddressFields
      governorate={governorate}
      onGovernorateChange={setGovernorate}
      cityArea={cityArea}
      onCityAreaChange={setCityArea}
      details={details}
      onDetailsChange={setDetails}
      fieldClassName="field"
    />
  );
};

describe('PatientAddressFields', () => {
  it('uses one full-address field with the transparent Benha example', () => {
    render(<AddressFieldsHarness />);

    const addressInput = screen.getByRole('textbox', { name: 'العنوان' });
    expect(addressInput).toHaveAttribute('placeholder', 'مثال: بنها');
    expect(screen.getAllByRole('textbox')).toHaveLength(1);

    fireEvent.change(addressInput, { target: { value: 'بنها، شارع فريد ندا' } });
    expect(addressInput).toHaveValue('بنها، شارع فريد ندا');

    fireEvent.change(addressInput, { target: { value: 'بنها شارع ' } });
    expect(addressInput).toHaveValue('بنها شارع ');
  });

  it('combines an existing structured address without losing its parts', () => {
    render(
      <PatientAddressFields
        governorate="القليوبية"
        onGovernorateChange={() => undefined}
        cityArea="بنها"
        onCityAreaChange={() => undefined}
        details="شارع فريد ندا"
        onDetailsChange={() => undefined}
        fieldClassName="field"
      />,
    );

    expect(screen.getByRole('textbox', { name: 'العنوان' }))
      .toHaveValue('القليوبية، بنها، شارع فريد ندا');
  });
});
