import React from 'react';
import { USER_TEXT_MAX_LENGTH } from '../../utils/userTextLengthPolicy';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NON_TEXT_INPUT_TYPES = new Set([
  'number',
  'range',
  'date',
  'datetime-local',
  'month',
  'week',
  'time',
  'color',
  'checkbox',
  'radio',
  'file',
  'hidden',
  'submit',
  'reset',
  'button',
  'image',
]);

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label;
  const normalizedType = String(props.type || 'text').trim().toLowerCase();
  const shouldAutoCap = !NON_TEXT_INPUT_TYPES.has(normalizedType);
  const explicitMaxLength = typeof props.maxLength === 'number' ? props.maxLength : undefined;
  const resolvedMaxLength = shouldAutoCap
    ? Math.min(explicitMaxLength ?? USER_TEXT_MAX_LENGTH, USER_TEXT_MAX_LENGTH)
    : explicitMaxLength;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        maxLength={resolvedMaxLength}
        className={[
          'w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-success-500 text-sm font-bold',
          error ? 'border-danger-400' : 'border-slate-200',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
};
