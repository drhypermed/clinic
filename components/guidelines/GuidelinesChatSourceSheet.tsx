import {
  LuArrowLeft,
  LuCopy,
  LuExternalLink,
  LuQuote,
} from 'react-icons/lu';
import type { GuidelineLanguage } from './guidelinesData';
import { formatChunkCitation, type GuidelineChatSourceChunk } from './guidelineChatSearch';
import {
  getContentAlignClass,
  getContentDirection,
  getSourceFileName,
  getSourcePageLabel,
  getSourcePreview,
} from './GuidelinesChat.helpers';
import { getSourceReason } from './guidelinesChatUtils';

type GuidelinesChatSourceSheetProps = {
  activeSources: GuidelineChatSourceChunk[];
  highlightedSourceIndex: number;
  isArabic: boolean;
  language: GuidelineLanguage;
  onClose: () => void;
  onCopy: (value: string) => void | Promise<void>;
  open: boolean;
  singleSourceNumber: number | null;
};

export const GuidelinesChatSourceSheet = ({
  activeSources,
  highlightedSourceIndex,
  isArabic,
  language,
  onClose,
  onCopy,
  open,
  singleSourceNumber,
}: GuidelinesChatSourceSheetProps) => {
  if (!open) return null;

  const isSingleSourceView = activeSources.length === 1 && singleSourceNumber !== null;

  return (
    <div
      className="fixed inset-0 z-[1200] bg-slate-950/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        dir={isArabic ? 'rtl' : 'ltr'}
        onClick={(event) => event.stopPropagation()}
        className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col bg-[#f7f8fa] shadow-2xl sm:my-4 sm:h-[calc(100dvh-2rem)] sm:overflow-hidden sm:rounded-2xl"
      >
        <header className="sticky top-0 z-10 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200 bg-[#111b21] px-2 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white sm:px-4 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="relative z-20 inline-flex h-11 min-w-[5.25rem] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 text-sm font-black transition hover:bg-white/15 sm:h-10"
            aria-label={isArabic ? 'إغلاق المصادر' : 'Close sources'}
          >
            <LuArrowLeft className="h-4 w-4" />
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-base font-black sm:text-lg">
              {isArabic
                ? (isSingleSourceView ? 'المصدر' : 'المصادر')
                : (isSingleSourceView ? 'Source' : 'Sources')}
            </div>
            <div className="mt-0.5 text-xs font-bold text-slate-300">
              {isSingleSourceView
                ? `S${singleSourceNumber}`
                : (isArabic ? `${activeSources.length} مصادر` : `${activeSources.length} sources`)}
            </div>
          </div>
          <div className="h-11 w-3 shrink-0 sm:h-10 sm:w-[84px]" />
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {activeSources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm font-bold text-slate-500">
              {isArabic ? 'لا توجد مصادر معروضة حاليا.' : 'No sources are currently open.'}
            </div>
          ) : (
            activeSources.map((source, index) => {
              const highlighted = highlightedSourceIndex === index;
              const sourceNumber = singleSourceNumber ?? index + 1;
              return (
                <article
                  key={`${source.id}-${index}`}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                    highlighted ? 'border-[#25d366] ring-2 ring-[#25d366]/25' : 'border-slate-200'
                  }`}
                >
                  <div className="bg-[#202c33] px-4 py-3 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-[#25d366] px-2 py-1 text-[10px] font-black text-[#063d31]">
                            S{sourceNumber}
                          </span>
                          {getSourcePageLabel(source) ? (
                            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-black text-white">
                              {getSourcePageLabel(source)}
                            </span>
                          ) : null}
                          {source.school ? (
                            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-black text-slate-200">
                              {source.school}{source.year ? ` ${source.year}` : ''}
                            </span>
                          ) : null}
                        </div>
                        <h4
                          dir={getContentDirection(getSourceFileName(source))}
                          className={`truncate text-sm font-black leading-6 ${getContentAlignClass(getSourceFileName(source))}`}
                        >
                          {getSourceFileName(source)}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCopy(source.text)}
                        className="shrink-0 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/15"
                        title={isArabic ? 'نسخ النص' : 'Copy text'}
                      >
                        <LuCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <details open={highlighted} className="group">
                    <summary className="cursor-pointer list-none px-4 py-3">
                      <div className="flex items-start gap-3">
                        <LuQuote className="mt-1 h-4 w-4 shrink-0 text-[#128c7e]" />
                        <div className="min-w-0 flex-1">
                          <div
                            dir={getContentDirection(source.heading || getSourcePreview(source))}
                            className={`text-xs font-black leading-5 text-slate-800 ${getContentAlignClass(source.heading || getSourcePreview(source))}`}
                          >
                            {source.heading || getSourcePreview(source) || formatChunkCitation(source, language)}
                          </div>
                          <div
                            dir={getContentDirection(getSourcePreview(source))}
                            className={`mt-1 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-500 ${getContentAlignClass(getSourcePreview(source))}`}
                          >
                            {getSourcePreview(source)}
                          </div>
                        </div>
                      </div>
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4">
                      <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-bold leading-5 text-[#075e54]">
                        {getSourceReason(source, language)}
                      </div>
                      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-bold leading-5 text-slate-500">
                        {formatChunkCitation(source, language)}
                        {source.chunkIndex ? ` · chunk ${source.chunkIndex}` : ''}
                      </div>
                      <blockquote
                        dir={getContentDirection(source.text)}
                        className={`mt-3 whitespace-pre-wrap rounded-lg border border-slate-100 bg-white p-3 text-sm font-semibold leading-7 text-slate-800 ${getContentAlignClass(source.text)}`}
                      >
                        {source.text}
                      </blockquote>
                      {(source.storagePdfUrl || source.url) ? (
                        <a
                          href={source.storagePdfUrl || source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-[#075e54] hover:text-[#063d31]"
                        >
                          <LuExternalLink className="h-3.5 w-3.5" />
                          {isArabic ? 'فتح الملف الأصلي' : 'Open original file'}
                        </a>
                      ) : null}
                    </div>
                  </details>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

