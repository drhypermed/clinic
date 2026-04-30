import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>مميز</Badge>);
    expect(screen.getByText('مميز')).toBeInTheDocument();
  });

  // الـtests دي بتطابق الـunified design system aliases في tailwind.config.ts:
  //   success → emerald, danger → rose, warning → amber, brand → blue
  // الـcomponent بيستخدم الـsemantic aliases مش الـraw color names.
  it('applies success classes', () => {
    render(<Badge variant="success">نجح</Badge>);
    const el = screen.getByText('نجح');
    expect(el).toHaveClass('bg-success-100', 'text-success-700');
  });

  it('applies error classes', () => {
    render(<Badge variant="error">فشل</Badge>);
    expect(screen.getByText('فشل')).toHaveClass('bg-danger-100', 'text-danger-700');
  });

  it('applies warning classes', () => {
    render(<Badge variant="warning">تحذير</Badge>);
    expect(screen.getByText('تحذير')).toHaveClass('bg-warning-100', 'text-warning-700');
  });

  it('applies info classes', () => {
    render(<Badge variant="info">معلومة</Badge>);
    expect(screen.getByText('معلومة')).toHaveClass('bg-brand-100', 'text-brand-700');
  });

  it('applies neutral classes by default', () => {
    render(<Badge>افتراضي</Badge>);
    expect(screen.getByText('افتراضي')).toHaveClass('bg-slate-100', 'text-slate-600');
  });

  it('merges custom className', () => {
    render(<Badge className="my-custom-class">test</Badge>);
    expect(screen.getByText('test')).toHaveClass('my-custom-class');
  });
});
