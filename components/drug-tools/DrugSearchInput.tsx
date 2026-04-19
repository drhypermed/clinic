/**
 * مكون البحث الموحد لأدوات الأدوية (Drug Search Input):
 * شريط بحث مشترك يُستخدم في جميع أدوات الأدوية الذكية (التفاعلات، الكلى، الحمل).
 * يدعم البحث الذكي (fuzzy)، القائمة المنسدلة، والتحكم الخارجي بالقيمة.
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Medication } from '../../types';
import { fuzzySearch } from '../../utils/fuzzySearch';
import { MedicationSearchDropdown } from '../common/MedicationSearchDropdown';
import { useMedications } from '../../hooks/medications';

interface DrugSearchInputProps {
  /** نص البحث عند عدم تحديد value */
  placeholder?: string;
  /** يُستدعى عند اختيار دواء من القائمة */
  onSelect: (med: Medication) => void;
  /** مسح شريط البحث بعد الاختيار (مفيد لإضافة أدوية متعددة) */
  clearOnSelect?: boolean;
  /** قيمة خارجية — إذا مُررت يعمل المكون بنمط controlled */
  value?: string;
  /** إخطار الأب بتغير النص */
  onValueChange?: (value: string) => void;
  /** يُستدعى عند ضغط Enter */
  onSubmit?: () => void;
}

export const DrugSearchInput: React.FC<DrugSearchInputProps> = ({
  placeholder = 'ابحث عن دواء...',
  onSelect,
  clearOnSelect = false,
  value,
  onValueChange,
  onSubmit,
}) => {
  const medications = useMedications();
  const [internalValue, setInternalValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // controlled vs uncontrolled
  const isControlled = value !== undefined;
  const searchText = isControlled ? value : internalValue;

  const updateValue = useCallback((v: string) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  }, [isControlled, onValueChange]);

  // fuzzy search
  const filteredMeds = useMemo(() => {
    if (!searchText || searchText.trim() === '') return [];
    return fuzzySearch(medications, searchText, ['name', 'genericName', 'matchKeywords']).slice(0, 10);
  }, [medications, searchText]);

  // click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (med: Medication) => {
    onSelect(med);
    setIsOpen(false);
    if (clearOnSelect) {
      updateValue('');
    } else {
      updateValue(med.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      onSubmit?.();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchText}
        onChange={handleChange}
        onFocus={() => { if (filteredMeds.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
        placeholder={placeholder}
        dir="rtl"
      />
      {isOpen && filteredMeds.length > 0 && (
        <MedicationSearchDropdown
          medications={filteredMeds}
          onSelect={handleSelect}
          searchTerm={searchText}
          variant="simple"
        />
      )}
    </div>
  );
};
