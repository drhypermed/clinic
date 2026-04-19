import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import DOMPurify from 'dompurify';
import { TextStyle } from '../../types';

interface RichTextEditorProps {
    value?: string;
    onChange: (html: string) => void;
    baseStyle?: TextStyle;
    minHeight?: string;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(({
    value = '',
    onChange,
    baseStyle,
    minHeight = '60px',
    placeholder,
    onFocus,
    onBlur
}, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    // Combine refs
    useImperativeHandle(ref, () => internalRef.current!, []);

    const [isInternalUpdate, setIsInternalUpdate] = useState(false);

    useEffect(() => {
        if (internalRef.current && !isInternalUpdate) {
            const cleanValue = DOMPurify.sanitize(value);
            if (internalRef.current.innerHTML !== cleanValue) {
                internalRef.current.innerHTML = cleanValue;
            }
        }
    }, [value, isInternalUpdate]);

    const handleInput = () => {
        if (internalRef.current) {
            setIsInternalUpdate(true);
            onChange(internalRef.current.innerHTML);
            setTimeout(() => setIsInternalUpdate(false), 200);
        }
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <div
                ref={internalRef}
                contentEditable
                className="p-3 outline-none overflow-auto"
                data-placeholder={placeholder}
                style={{
                    minHeight,
                    direction: 'rtl',
                    textAlign: 'right',
                    color: baseStyle?.color || 'inherit',
                    fontSize: baseStyle?.fontSize || 'inherit',
                    fontFamily: baseStyle?.fontFamily || 'inherit',
                    fontWeight: baseStyle?.fontWeight as any || 'inherit',
                    fontStyle: baseStyle?.fontStyle || 'inherit',
                    lineHeight: '1.5'
                }}
                onInput={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

