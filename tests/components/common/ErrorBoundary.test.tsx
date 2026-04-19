import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';

// مكون يرمي خطأً عند التصيير
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error from component');
  return <div>محتوى سليم</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // منع console.error من إزعاج نتائج الاختبارات
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('يعرض المحتوى الطبيعي عند عدم وجود خطأ', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('محتوى سليم')).toBeInTheDocument();
  });

  it('يعرض شاشة الخطأ عند حدوث crash', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
    expect(screen.getByText('Test error from component')).toBeInTheDocument();
  });

  it('يعرض زر إعادة التحميل', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /إعادة تحميل/i })).toBeInTheDocument();
  });

  it('يعرض fallback مخصص إذا أُعطي', () => {
    render(
      <ErrorBoundary fallback={<div>خطأ مخصص</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('خطأ مخصص')).toBeInTheDocument();
    expect(screen.queryByText('حدث خطأ غير متوقع')).not.toBeInTheDocument();
  });

  it('لا يخفي المحتوى السليم عند غياب الخطأ', () => {
    render(
      <ErrorBoundary>
        <div>نص مهم</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('نص مهم')).toBeInTheDocument();
    expect(screen.queryByText('حدث خطأ غير متوقع')).not.toBeInTheDocument();
  });
});
