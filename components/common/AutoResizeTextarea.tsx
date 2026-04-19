/**
 * مكون حقل النص تلقائي التوسع (AutoResizeTextarea):
 * يستخدم هذا المكون بدلاً من حقل النص العادي (textarea) ليوفر تجربة مستخدم أفضل.
 * الخصائص المميزة:
 * 1. يتوسع الطول تلقائياً مع زيادة المحتوى (Auto-grow) ليلائم النص المكتوب.
 * 2. يدعم وضع "القراءة فقط" (readOnlyMode) حيث يتحول إلى Div لضمان التفاف النص بشكل صحيح عند الطباعة أو التصدير لـ PDF.
 * 3. يضمن عدم ظهور شريط تمرير داخلي (Scrollbar) في الوضع العادي.
 * 4. يتعامل مع الخطوط المخصصة (Custom Fonts) مع الحفاظ على الأولوية (!important).
 */

import React, { useRef, useEffect } from 'react';
import { USER_TEXT_MAX_LENGTH } from '../../utils/userTextLengthPolicy';

interface AutoResizeTextareaProps {
  value: string; // النص الحالي
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // دالة التغيير
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className: string;
  style?: React.CSSProperties;
  dir?: string;
  placeholder?: string;
  onClick?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  onBlur?: () => void;
  maxLength?: number;
  readOnlyMode?: boolean; // وضع الطباعة أو العرض الثابت
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  onKeyDown,
  className,
  style,
  dir,
  placeholder,
  onClick,
  onFocus,
  autoFocus,
  onBlur,
  maxLength = USER_TEXT_MAX_LENGTH,
  readOnlyMode = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    // Resize on mount, when value changes, or when style changes
    if (!readOnlyMode) {
      resize();

      // Forcefully apply font-family with !important if provided in style
      // This overrides any global CSS !important rules (e.g. in index.html)
      if (textareaRef.current && style?.fontFamily) {
        textareaRef.current.style.setProperty('font-family', style.fontFamily, 'important');
      }

      // Also resize after a small delay to ensure layout is complete
      const timeoutId = setTimeout(() => resize(), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [readOnlyMode, value, style?.fontFamily]);

  if (readOnlyMode) {
    // In Print/PDF mode, render as a DIV/Span to ensure text wraps correctly and looks native
    return (
      <div
        className={className}
        style={{ ...style, whiteSpace: 'pre-wrap', minHeight: 'auto', display: 'block' }}
        dir={dir}
      >
        {value}
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      autoFocus={autoFocus}
      rows={1}
      maxLength={maxLength}
      className={className}
      style={{ ...style, fieldSizing: 'content' } as React.CSSProperties}
      dir={dir}
      placeholder={placeholder}
      data-auto-resize="true"
    />
  );
};
