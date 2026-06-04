import React, { useEffect, useRef, useState } from 'react';
import {
  LuBookOpen,
  LuChevronDown,
  LuFileText,
  LuPanelRightOpen,
  LuX,
} from 'react-icons/lu';
import type { GuidelineCollection, GuidelineLanguage } from './guidelinesData';
import type { GuidelineChatScope } from './guidelineChatSearch';
import { GuidelineSourceTree } from './GuidelineSourceTree';

export type AnswerStyle = 'scientific' | 'concise';

const scopeLabels: Record<'all-guidelines' | 'current-file', Record<GuidelineLanguage, string>> = {
  'all-guidelines': { ar: 'كل الكتب', en: 'All books' },
  'current-file': { ar: 'الملف الحالي', en: 'Current file' },
};

type ChatToolbarProps = {
  isArabic: boolean;
  language: GuidelineLanguage;
  onLanguageChange?: (lang: GuidelineLanguage) => void;
  answerStyle: AnswerStyle;
  setAnswerStyle: (s: AnswerStyle) => void;
  scope: GuidelineChatScope;
  setScope: (s: GuidelineChatScope) => void;
  selectedSource: GuidelineCollection['sources'][number] | null;
  selectedCollection: GuidelineCollection | null;
  showBookPicker?: boolean;
  onSelectSource?: (collectionId: string, sourceId: string) => void;
};

export const ChatToolbar: React.FC<ChatToolbarProps> = ({
  isArabic,
  language,
  onLanguageChange,
  answerStyle,
  setAnswerStyle,
  scope,
  setScope,
  selectedSource,
  selectedCollection,
  showBookPicker,
  onSelectSource,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const handleSelectSource = (collectionId: string, source: GuidelineCollection['sources'][number]) => {
    onSelectSource?.(collectionId, source.id);
    setScope('current-file');
    setPickerOpen(false);
  };

  const handleClearSource = () => {
    onSelectSource?.('', '');
    setScope('all-guidelines');
    setPickerOpen(false);
  };

  return (
    <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-[#d7cec0] bg-[#f0f2f5] px-2 py-1.5 sm:px-3 sm:py-2">
      {onLanguageChange ? (
        <div className="inline-flex shrink-0 rounded-full bg-white p-0.5 ring-1 ring-slate-200">
          {(['ar', 'en'] as GuidelineLanguage[]).map((item) => {
            const active = language === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onLanguageChange(item)}
                className={`h-7 rounded-full px-2.5 text-[11px] font-black transition ${
                  active
                    ? 'bg-[#075e54] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-emerald-50 hover:text-[#075e54]'
                }`}
              >
                {item === 'ar' ? 'عربي' : 'EN'}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="inline-flex shrink-0 rounded-full bg-white p-0.5 ring-1 ring-slate-200">
        {([
          { value: 'scientific' as const, label: isArabic ? 'نقاش علمي' : 'Scientific' },
          { value: 'concise' as const, label: isArabic ? 'مختصر' : 'Brief' },
        ]).map((item) => {
          const active = answerStyle === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setAnswerStyle(item.value)}
              className={`h-7 rounded-full px-2.5 text-[11px] font-black transition ${
                active
                  ? 'bg-[#075e54] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-emerald-50 hover:text-[#075e54]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {showBookPicker ? (
        <div className="relative shrink-0" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((value) => !value)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-black transition ${
              selectedSource
                ? 'bg-[#075e54] text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-[#075e54]'
            }`}
          >
            <LuBookOpen className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate sm:max-w-[200px]">
              {selectedSource ? selectedSource.title : (isArabic ? 'اختر كتاب' : 'Choose a book')}
            </span>
            <LuChevronDown className={`h-3 w-3 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {pickerOpen && (
            <div className="fixed inset-x-4 top-24 z-50 mx-auto flex max-h-[60vh] w-auto max-w-[400px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:absolute sm:inset-x-auto sm:start-0 sm:top-full sm:mt-1.5 sm:max-h-[70vh] sm:w-[400px]">
              {selectedSource && (
                <button
                  type="button"
                  onClick={handleClearSource}
                  className="flex w-full shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
                >
                  <LuX className="h-3.5 w-3.5" />
                  {isArabic ? 'إلغاء اختيار الكتاب (بحث في الكل)' : 'Clear selection (search all)'}
                </button>
              )}
              <GuidelineSourceTree
                language={language}
                selectedCollectionId={selectedCollection?.id || ''}
                selectedSourceId={selectedSource?.id || ''}
                onSelectSource={handleSelectSource}
                autoFocusSearch
                className="min-h-0 flex-1"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {(['all-guidelines', 'current-file'] as const).map((value) => {
            const disabled = value === 'current-file' && !selectedSource;
            const active = scope === value && !disabled;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => setScope(value)}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-black transition ${
                  active
                    ? 'bg-[#075e54] text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-[#075e54] disabled:cursor-not-allowed disabled:opacity-45'
                }`}
              >
                {value === 'current-file' ? <LuFileText className="h-3.5 w-3.5" /> : <LuPanelRightOpen className="h-3.5 w-3.5" />}
                {scopeLabels[value][language]}
              </button>
            );
          })}
          {selectedSource ? (
            <span className="min-w-0 truncate rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200" title={selectedSource.title}>
              {selectedSource.title}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
};
