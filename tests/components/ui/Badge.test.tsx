import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>مميز</Badge>);
    expect(screen.getByText('مميز')).toBeInTheDocument();
  });

  it('applies success classes', () => {
    render(<Badge variant="success">نجح</Badge>);
    const el = screen.getByText('نجح');
    expect(el).toHaveClass('bg-emerald-100', 'text-emerald-700');
  });

  it('applies error classes', () => {
    render(<Badge variant="error">فشل</Badge>);
    expect(screen.getByText('فشل')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('applies warning classes', () => {
    render(<Badge variant="warning">تحذير</Badge>);
    expect(screen.getByText('تحذير')).toHaveClass('bg-amber-100', 'text-amber-700');
  });

  it('applies info classes', () => {
    render(<Badge variant="info">معلومة</Badge>);
    expect(screen.getByText('معلومة')).toHaveClass('bg-blue-100', 'text-blue-700');
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
