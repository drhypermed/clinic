import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../components/ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>حفظ</Button>);
    expect(screen.getByRole('button', { name: 'حفظ' })).toBeInTheDocument();
  });

  it('shows loading text when loading=true', () => {
    render(<Button loading>حفظ</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('جاري التحميل');
  });

  it('is disabled when loading=true', () => {
    render(<Button loading>حفظ</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled=true', () => {
    render(<Button disabled>حفظ</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>حفظ</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>حفظ</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>زر</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-emerald-600', 'to-emerald-700');
  });

  it('applies info variant classes', () => {
    render(<Button variant="info">تعديل</Button>);
    // الـinfo بيستخدم blue gradient (from-blue-600 to-blue-500) من appActionButtonStyles
    expect(screen.getByRole('button')).toHaveClass('from-blue-600', 'to-blue-500');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">حذف</Button>);
    // الـdanger بيستخدم rose (مش red) — danger في الـtailwind config = rose alias
    expect(screen.getByRole('button')).toHaveClass('from-rose-600', 'to-rose-700', 'text-white');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">إلغاء</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-slate-200');
  });

  it('auto-applies danger style for delete labels', () => {
    render(<Button>حذف</Button>);
    // auto-detect "حذف" → danger style (rose gradient)
    expect(screen.getByRole('button')).toHaveClass('from-rose-600', 'to-rose-700', 'text-white');
  });
});
