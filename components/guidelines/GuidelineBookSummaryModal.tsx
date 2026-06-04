import React, { useEffect, useMemo, useState } from 'react';
import {
  LuBookOpen,
  LuDownload,
  LuFileText,
  LuLoader,
  LuShieldCheck,
  LuSparkles,
  LuTriangleAlert,
  LuX,
} from 'react-icons/lu';
import type {
  GuidelineCollection,
  GuidelineLanguage,
  GuidelineSource,
} from './guidelinesData';
import {
  getGuidelineBookTextCloud,
  type GuidelineBookTextResponse,
  type GuidelineChatSourceChunk,
} from './guidelineChatSearch';
import { generateGuidelineChatAnswer } from '../../services/guidelineChatService';

type Props = {
  isOpen: boolean;
  language: GuidelineLanguage;
  collection: GuidelineCollection | null;
  source: GuidelineSource | null;
  doctorSpecialty?: string | null;
  onClose: () => void;
};

const cleanText = (value: string) =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();

const compact = (value: string, max = 280) => {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(120, cut.lastIndexOf(' '))).trim()}...`;
};

const splitClinicalSentences = (chunks: GuidelineChatSourceChunk[]) =>
  chunks
    .flatMap((chunk) => cleanText([chunk.heading, chunk.text].filter(Boolean).join('. ')).split(/(?<=[.!?])\s+(?=[A-Z0-9([])/))
    .map((item) => cleanText(item))
    .filter((item) => item.length >= 80 && item.length <= 460);

const uniqueItems = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').slice(0, 110);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const pickByPattern = (sentences: string[], pattern: RegExp, count: number) =>
  uniqueItems(sentences.filter((item) => pattern.test(item))).slice(0, count).map((item) => compact(item));

const buildFallbackSummary = ({
  response,
  source,
  collection,
  language,
}: {
  response: GuidelineBookTextResponse | null;
  source: GuidelineSource;
  collection: GuidelineCollection | null;
  language: GuidelineLanguage;
}) => {
  const chunks = response?.chunks || [];
  const sentences = splitClinicalSentences(chunks);
  const isArabic = language === 'ar';
  const title = source.title || response?.book?.title || 'Guideline file';
  const meta = [
    collection?.school || response?.book?.school,
    collection?.year || response?.book?.year,
    source.folderTitle,
  ].filter(Boolean).join(' | ');

  const management = pickByPattern(
    sentences,
    /\b(recommend|should|management|treat|treatment|therapy|initiat|offer|use|target|algorithm|first-line)\b/i,
    5,
  );
  const diagnosis = pickByPattern(
    sentences,
    /\b(diagnos|criteria|screen|assessment|evaluation|classif|confirm|risk strat|threshold)\b/i,
    4,
  );
  const safety = pickByPattern(
    sentences,
    /\b(avoid|contraindicat|caution|adverse|risk|monitor|renal|hepatic|pregnan|child|elderly|dose|dosage|refer|follow-up|follow up)\b/i,
    5,
  );
  const fallbackItems = uniqueItems(sentences).slice(0, 6).map((item) => compact(item));

  if (isArabic) {
    return [
      `**شرح استشاري مختصر**`,
      `**الملف:** ${title}`,
      meta ? `**التصنيف:** ${meta}` : '',
      '',
      `**الهدف السريري**`,
      `هذا ملخص عملي مستخرج عند الطلب من نص الملف، لمساعدة الطبيب على تكوين صورة سريعة قبل فتح المرجع الأصلي. استخدمه كخريطة قراءة، وليس بديلا عن الجداول والتوصيات الرسمية داخل الملف.`,
      '',
      `**أهم نقاط القرار**`,
      ...(management.length ? management : fallbackItems).map((item) => `- ${item}`),
      '',
      diagnosis.length ? `**التشخيص والتقييم**` : '',
      ...diagnosis.map((item) => `- ${item}`),
      '',
      safety.length ? `**السلامة والمتابعة**` : '',
      ...safety.map((item) => `- ${item}`),
      '',
      `**ملاحظة تطبيقية**`,
      `راجع درجة التوصية، الاستثناءات، وصفحات الجداول في المصدر الأصلي قبل قرار علاجي عالي الخطورة، خصوصا مع الحمل، الأطفال، كبار السن، القصور الكلوي أو الكبدي، والتداخلات الدوائية.`,
    ].filter(Boolean).join('\n');
  }

  return [
    `**Consultant-Level Brief**`,
    `**File:** ${title}`,
    meta ? `**Classification:** ${meta}` : '',
    '',
    `**Clinical purpose**`,
    `This on-demand brief is extracted from the selected file to help the physician orient quickly before opening the primary reference. Use it as a reading map, not as a replacement for the official tables and recommendation statements.`,
    '',
    `**High-yield decision points**`,
    ...(management.length ? management : fallbackItems).map((item) => `- ${item}`),
    '',
    diagnosis.length ? `**Diagnosis and assessment**` : '',
    ...diagnosis.map((item) => `- ${item}`),
    '',
    safety.length ? `**Safety, monitoring, and follow-up**` : '',
    ...safety.map((item) => `- ${item}`),
    '',
    `**Practical note**`,
    `Check recommendation grade, exclusions, and original tables before high-risk treatment decisions, especially in pregnancy, pediatrics, older adults, renal or hepatic impairment, and interacting medications.`,
  ].filter(Boolean).join('\n');
};

const buildSummaryPrompt = (source: GuidelineSource, collection: GuidelineCollection | null, language: GuidelineLanguage) => {
  const title = source.title || 'selected guideline file';
  const context = [collection?.school, collection?.year, source.folderTitle].filter(Boolean).join(' | ');
  if (language === 'ar') {
    return [
      `اكتب شرحا عربيا موجزا بمستوى استشاري للملف التالي: ${title}.`,
      context ? `السياق: ${context}.` : '',
      `المطلوب: ملخص سريري عملي للطبيب يشمل الهدف، أهم نقاط التشخيص أو العلاج، التحذيرات، المتابعة، وما الذي يجب الرجوع إليه في الملف الأصلي.`,
      `استخدم عناوين قصيرة ونقاط واضحة. لا تخترع أرقاما أو درجات توصية غير موجودة في النصوص المسترجعة. ضع علامات المصادر [S1] عند الاعتماد على النص.`,
    ].filter(Boolean).join('\n');
  }
  return [
    `Write a concise consultant-level English brief for this guideline file: ${title}.`,
    context ? `Context: ${context}.` : '',
    `Cover clinical purpose, key diagnosis or treatment decisions, safety cautions, monitoring/follow-up, and what must be checked in the primary file.`,
    `Use short headings and clear bullets. Do not invent thresholds, doses, or grades not present in the retrieved excerpts. Cite retrieved excerpts as [S1].`,
  ].filter(Boolean).join('\n');
};

const stripMarkdown = (value: string) =>
  value.replace(/^#{1,4}\s*/, '').replace(/^\*\*(.*)\*\*$/, '$1').trim();

const renderSummaryContent = (summary: string, isArabic: boolean) => {
  const lines = summary.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return <div key={`gap-${index}`} className="h-1" />;
        const isHeading = /^#{1,4}\s+/.test(text) || (/^\*\*[^*]+\*\*$/.test(text) && text.length < 90);
        const bullet = text.match(/^[-*]\s+(.+)/) || text.match(/^\d+[.)]\s+(.+)/);
        if (isHeading) {
          return (
            <h4 key={`${text}-${index}`} className="mt-3 inline-flex rounded-lg bg-teal-50 px-2.5 py-1 text-sm font-black text-teal-900 ring-1 ring-teal-100">
              {stripMarkdown(text)}
            </h4>
          );
        }
        if (bullet) {
          return (
            <div key={`${text}-${index}`} className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold leading-7 text-slate-800">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              <span className="min-w-0 flex-1">{bullet[1]}</span>
            </div>
          );
        }
        return (
          <p key={`${text}-${index}`} className={`text-sm font-semibold leading-7 text-slate-800 ${isArabic ? 'text-right' : 'text-left'}`}>
            {text}
          </p>
        );
      })}
    </div>
  );
};

export const GuidelineBookSummaryModal: React.FC<Props> = ({
  isOpen,
  language,
  collection,
  source,
  doctorSpecialty,
  onClose,
}) => {
  const isArabic = language === 'ar';
  const [response, setResponse] = useState<GuidelineBookTextResponse | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiFallback, setIsAiFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !source) return undefined;

    let cancelled = false;
    setIsLoading(true);
    setError('');
    setSummary('');
    setResponse(null);
    setIsAiFallback(false);

    const run = async () => {
      const data = await getGuidelineBookTextCloud({
        bookId: source.bookId || null,
        selectedCollectionId: collection?.id || null,
        selectedSourceLocalFile: source.localFile || null,
        sourcePathCandidates: source.localFile ? [source.localFile] : [],
        samplingMode: 'summary',
        limit: 34,
      });
      if (cancelled) return;
      setResponse(data);

      const usableChunks = data.chunks.slice(0, 24);
      const fallback = buildFallbackSummary({ response: data, source, collection, language });
      if (usableChunks.length === 0) {
        setSummary(fallback);
        setError(isArabic ? 'لم أجد نصا مستخرجا لهذا الملف حاليا.' : 'No extracted text was found for this file yet.');
        setIsLoading(false);
        return;
      }

      try {
        const aiSummary = await generateGuidelineChatAnswer({
          question: buildSummaryPrompt(source, collection, language),
          language,
          mode: 'clinical',
          chunks: usableChunks,
          answerMode: 'guideline-first',
          doctorSpecialty,
        });
        if (cancelled) return;
        setSummary(aiSummary.trim() || fallback);
      } catch {
        if (cancelled) return;
        setIsAiFallback(true);
        setSummary(fallback);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [collection, doctorSpecialty, isArabic, isOpen, language, source]);

  const pdfUrl = response?.book?.storagePdfUrl || source?.storagePdfUrl || source?.url || '';
  const fileStats = useMemo(() => {
    const book = response?.book;
    return [
      book?.pageCount || source?.pageCount ? `${book?.pageCount || source?.pageCount} ${isArabic ? 'صفحة' : 'pages'}` : '',
      book?.chunkCount || source?.chunkCount ? `${book?.chunkCount || source?.chunkCount} ${isArabic ? 'جزء نصي' : 'text chunks'}` : '',
      book?.textChars || source?.textChars ? `${Math.round((book?.textChars || source?.textChars || 0) / 1000)}k ${isArabic ? 'حرف' : 'chars'}` : '',
    ].filter(Boolean);
  }, [isArabic, response, source]);

  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[94dvh] w-full max-w-5xl min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-slate-950/25" dir={isArabic ? 'rtl' : 'ltr'}>
        <header className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-teal-800 via-blue-800 to-slate-900 px-4 py-3 text-white sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20">
              <LuBookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black text-teal-50">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/12 px-2 py-1 ring-1 ring-white/15">
                  <LuShieldCheck className="h-3.5 w-3.5" />
                  {isArabic ? 'شرح عند الطلب' : 'On-demand brief'}
                </span>
                {collection && (
                  <span className="rounded-lg bg-white/12 px-2 py-1 ring-1 ring-white/15">
                    {collection.school} {collection.year}
                  </span>
                )}
              </div>
              <h3 className="mt-2 line-clamp-2 break-words text-sm font-black leading-6 sm:text-lg sm:leading-7">
                {source.title}
              </h3>
              {source.folderTitle && (
                <p className="mt-1 text-xs font-bold leading-5 text-blue-50/85">{source.folderTitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label={isArabic ? 'إغلاق' : 'Close'}
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fffb_0%,#ffffff_36%,#fff8ed_100%)] p-3 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
                  <LuSparkles className="h-3.5 w-3.5" />
                  {isArabic ? 'الملخص السريري' : 'Clinical brief'}
                </span>
                {isAiFallback && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800 ring-1 ring-amber-100">
                    <LuTriangleAlert className="h-3.5 w-3.5" />
                    {isArabic ? 'ملخص استخراجي' : 'Extractive fallback'}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/35 text-emerald-800">
                  <LuLoader className="h-8 w-8 animate-spin" />
                  <p className="text-center text-sm font-black">
                    {isArabic ? 'جاري قراءة الملف وتجهيز شرح مركز...' : 'Reading the file and preparing a focused brief...'}
                  </p>
                </div>
              ) : (
                <div className="break-words [overflow-wrap:anywhere]">
                  {renderSummaryContent(summary, isArabic)}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-900">
                  {error}
                </div>
              )}
            </section>

            <aside className="space-y-3">
              <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                  <LuDownload className="h-4 w-4" />
                  {isArabic ? 'تحميل الملف' : 'File download'}
                </div>
                <p className="mt-2 text-xs font-semibold leading-6 text-slate-600">
                  {isArabic
                    ? 'الـ PDF لا يتحمل تلقائيا. اضغط الزر فقط عندما تحتاج تنزيل المرجع الأصلي.'
                    : 'The PDF is not loaded automatically. Use the button only when you need the primary file.'}
                </p>
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
                  >
                    <LuDownload className="h-4 w-4" />
                    {isArabic ? 'تحميل PDF يدويا' : 'Manual PDF download'}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-400"
                  >
                    <LuDownload className="h-4 w-4" />
                    {isArabic ? 'رابط التحميل غير متاح' : 'Download link unavailable'}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                  <LuFileText className="h-4 w-4" />
                  {isArabic ? 'بيانات الملف' : 'File metadata'}
                </div>
                <div className="mt-3 space-y-2 text-xs font-bold text-slate-600">
                  <div className="break-words rounded-lg bg-slate-50 px-2.5 py-2" dir="ltr">{source.localFile || response?.book?.sourcePath || source.title}</div>
                  {fileStats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {fileStats.map((item) => (
                        <span key={item} className="rounded-md bg-teal-50 px-2 py-1 text-teal-800 ring-1 ring-teal-100">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs font-bold leading-6 text-amber-950">
                <LuTriangleAlert className="mb-2 h-4 w-4" />
                {isArabic
                  ? 'هذا الشرح مساعد سريع للطبيب، ولا يغني عن مراجعة الملف الأصلي خصوصا في الجرعات، درجات التوصية، الحالات الخاصة، وبروتوكولات الطوارئ.'
                  : 'This brief supports rapid orientation; it does not replace primary-source review for doses, grades, special populations, and emergency protocols.'}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
