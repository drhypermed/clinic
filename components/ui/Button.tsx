import React from 'react';
import { getAppActionButtonToneClass } from './appActionButtonStyles';

type Variant = 'primary' | 'info' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: getAppActionButtonToneClass('green'),
  info: getAppActionButtonToneClass('blue'),
  secondary: getAppActionButtonToneClass('neutral'),
  danger: getAppActionButtonToneClass('danger'),
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'py-1.5 px-4 text-xs',
  md: 'py-2.5 px-6 text-sm',
  lg: 'py-3 px-8 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const hasDeleteKeyword = React.Children.toArray(children).some(
    (child) => typeof child === 'string' && child.includes('حذف')
  );
  const resolvedVariant: Variant = variant || (hasDeleteKeyword ? 'danger' : 'primary');

  return (
    <button
      disabled={disabled || loading}
      className={[
        'font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[resolvedVariant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          جاري التحميل
        </span>
      ) : children}
    </button>
  );
};
