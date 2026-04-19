import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../../components/ui/Input';

describe('Input', () => {
  it('يعرض الـ label عند تمريره', () => {
    render(<Input label="الاسم" />);
    expect(screen.getByText('الاسم')).toBeInTheDocument();
  });

  it('يربط الـ label بالـ input عبر id', () => {
    render(<Input label="البريد الإلكتروني" />);
    const input = screen.getByLabelText('البريد الإلكتروني');
    expect(input).toBeInTheDocument();
  });

  it('يعرض رسالة الخطأ عند وجودها', () => {
    render(<Input label="الاسم" error="هذا الحقل مطلوب" />);
    expect(screen.getByText('هذا الحقل مطلوب')).toBeInTheDocument();
  });

  it('يضيف border-red عند وجود خطأ', () => {
    render(<Input label="الاسم" error="خطأ" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-400');
  });

  it('يستخدم border-slate-200 عند غياب الخطأ', () => {
    render(<Input label="الاسم" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-slate-200');
  });

  it('يستجيب لتغيير القيمة', async () => {
    const onChange = vi.fn();
    render(<Input label="test" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('لا يعرض label عند عدم تمريره', () => {
    render(<Input placeholder="اكتب هنا" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });
});
