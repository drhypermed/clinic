import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuBookOpen,
  LuCalendar,
  LuChevronRight,
  LuExternalLink,
  LuFileText,
  LuImage,
  LuShieldCheck,
  LuSparkles,
  LuStethoscope,
} from 'react-icons/lu';
import {
  GUIDELINE_COLLECTIONS,
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
  loadGuidelineCollectionData,
} from './guidelinesData';
import { ADA_2026_EXPLANATIONS } from './data/ada2026/adaExplanations';
import { GuidelineSourceTree, localizeNumber, renderHighlightedText } from './GuidelineSourceTree';

type GuidelinesAccountType = 'free' | 'premium' | 'plus' | 'pro_max';

const getLanguageDirection = (language: GuidelineLanguage) => (language === 'ar' ? 'rtl' : 'ltr');

const getLanguageTextAlign = (language: GuidelineLanguage) => (language === 'ar' ? 'text-right' : 'text-left');

const normalizeGuidelineReference = (value: string | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const clinicalRegex = /((?:<|>|≥|≤|>=|<=|~)?\s*\b\d+(?:[,.]\d+)*(?:\s*-\s*\d+(?:[,.]\d+)*)?(?:\s*\/\s*\d+(?:[,.]\d+)*)?\s*(?:%|mg\/dL|mmHg|mmol\/L|kg\/m2|U(?:\/L)?|units?(?:\/dose)?|g(?:\/dL)?|mg|mcg|mEq|L|mL(?:\/min(?:\/1\.73\s*m2)?)?|h|m2|kg|cm|hours?|weeks?|months?|years?|days?|أشهر|شهر|أسابيع|أسبوع|أيام|يوم|ساعات|ساعة|سنة|سنوات|مرات|مرة|جرعات|جرعة|حبات|حبة)?)/gi;

const renderTextWithPills = (text: string, highlightTerms: string[], isArabic: boolean = false) => {
  if (!text) return text;
  const tokens = text.split(clinicalRegex);
  return tokens.map((token, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-bold text-xs ring-1 ring-blue-200/50" dir="ltr">
          {localizeNumber(token.trim(), isArabic)}
        </span>
      );
    } else {
      return renderHighlightedText(token, highlightTerms, isArabic);
    }
  });
};

const renderMarkdownText = (text: string, highlightTerms: string[], isArabic: boolean = false) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    const lineContent = boldParts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-black text-slate-900">
            {renderTextWithPills(part, highlightTerms, isArabic)}
          </strong>
        );
      } else {
        return renderTextWithPills(part, highlightTerms, isArabic);
      }
    });

    return (
      <React.Fragment key={lineIndex}>
        {lineContent}
        {lineIndex < lines.length - 1 && <br className="mb-2 block content-['']" />}
      </React.Fragment>
    );
  });
};
export const GuidelinesLibraryPage: React.FC<{
  onBack?: () => void;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  accountType?: GuidelinesAccountType;
  showNotification?: (msg: string, type?: unknown, options?: unknown) => void;
}> = ({
  onBack,
  accountType = 'free',
  showNotification,
}) => {
  const [language, setLanguage] = useState<GuidelineLanguage>('ar');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedSourceSnapshot, setSelectedSourceSnapshot] = useState<{
    collectionId: string;
    source: GuidelineCollection['sources'][number];
  } | null>(null);
  const [collectionData, setCollectionData] = useState<GuidelineCollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedCollectionId) {
      setCollectionData(null);
      setSelectedSourceId('');
      setSelectedSourceSnapshot(null);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    setIsLoading(true);
    setCollectionData(null);
    loadGuidelineCollectionData(selectedCollectionId).then((data) => {
      if (isMounted) {
        setCollectionData(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCollectionId]);

  const selectedCollection = useMemo(
    () => {
      const collection = GUIDELINE_COLLECTIONS.find((item) => item.id === selectedCollectionId) ?? null;
      return collection;
    },
    [selectedCollectionId],
  );

  const selectedSource = useMemo(() => {
    const collectionSource = selectedCollection?.sources.find((source) => source.id === selectedSourceId) ?? null;
    if (collectionSource) return collectionSource;
    if (
      selectedSourceSnapshot &&
      selectedSourceSnapshot.collectionId === selectedCollectionId &&
      selectedSourceSnapshot.source.id === selectedSourceId
    ) {
      return selectedSourceSnapshot.source;
    }
    return null;
  }, [selectedCollection, selectedCollectionId, selectedSourceId, selectedSourceSnapshot]);

  const selectGuidelineSource = useCallback((collectionId: string, source: GuidelineCollection['sources'][number]) => {
    setSelectedCollectionId(collectionId);
    setSelectedSourceId(source.id);
    setSelectedSourceSnapshot({ collectionId, source });
  }, []);

  const activeDigest = useMemo(() => {
    if (!collectionData?.recommendationDigest) return null;
    return collectionData.recommendationDigest.find((digest) => digest.sourceId === selectedSourceId) ?? null;
  }, [collectionData, selectedSourceId]);

  const highlightTerms: string[] = [];

  const filteredRecommendations = useMemo(() => {
    if (!activeDigest) return [];
    return activeDigest.recommendations;
  }, [activeDigest]);

  const activeTopics = useMemo(() => {
    if (!collectionData?.topics || !selectedSource) return [];
    const sourceReferences = [
      selectedSource.id,
      selectedSource.fileTopicId,
      selectedSource.folderTopicId,
      selectedSource.title,
      selectedSource.localFile,
      selectedSource.structuredTextPath,
      selectedSource.rawTextPath,
    ]
      .map(normalizeGuidelineReference)
      .filter(Boolean);
    
    return collectionData.topics.filter(t => {
      return t.sourceIds.some(sid => {
        const normalizedSid = normalizeGuidelineReference(sid);
        if (!normalizedSid) return false;
        return sourceReferences.some(
          (sourceReference) =>
            sourceReference === normalizedSid ||
            sourceReference.includes(normalizedSid) ||
            normalizedSid.includes(sourceReference),
        );
      });
    });
  }, [collectionData?.topics, selectedSource]);

  const isArabic = language === 'ar';
  const isFreeGuidelinesPlan = accountType !== 'premium' && accountType !== 'plus' && accountType !== 'pro_max';
  const localizedDirection = getLanguageDirection(language);
  const localizedTextAlign = getLanguageTextAlign(language);
  const englishTextClass = 'text-left [unicode-bidi:plaintext]';
  const arabicTextClass = 'text-right [unicode-bidi:plaintext]';

  useEffect(() => {
    if (!isFreeGuidelinesPlan || !selectedCollectionId || selectedCollectionId === 'ada-2026') return;
    setSelectedCollectionId('');
    setSelectedSourceId('');
    setSelectedSourceSnapshot(null);
  }, [isFreeGuidelinesPlan, selectedCollectionId]);

  return (
    <div className="flex flex-col bg-slate-50/30" dir={localizedDirection}>
      <div className="flex flex-col gap-4 p-2 sm:p-4">
        {/* Top Header / Intro Section */}
        <section className="hidden max-w-full shrink-0 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm sm:rounded-[2rem] lg:block">
          <div>
            <div className="bg-white p-3 text-slate-900 sm:p-6">
              <div className="mb-3 flex flex-col items-stretch justify-between gap-3 sm:mb-5 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-100 transition border border-slate-100 cursor-pointer"
                    >
                      {isArabic ? 'العودة' : 'Back'}
                    </button>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-black text-slate-800 border border-slate-100 shadow-sm">
                    <LuBookOpen className="h-4 w-4 text-emerald-600" />
                    {isArabic ? 'مكتبة الجايدلاينز' : 'Guidelines Library'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-black text-slate-800 border border-slate-100 shadow-sm">
                    <LuShieldCheck className="h-4 w-4 text-emerald-600" />
                    {isArabic ? 'ملخص موثق بالمصادر' : 'Source-linked digest'}
                  </span>
                </div>
                <div className="flex w-full items-center gap-1 rounded-[1.25rem] bg-slate-50 p-1 border border-slate-100 sm:w-auto">
                  {(['ar', 'en'] as GuidelineLanguage[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      className={`flex-1 rounded-2xl px-4 py-2 text-xs font-black transition sm:flex-none ${
                        language === item ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                      }`}
                    >
                      {item === 'ar' ? 'العربية' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <h1 dir={localizedDirection} className={`text-xl font-black leading-tight text-slate-900 sm:text-3xl ${localizedTextAlign}`}>
                {selectedCollection ? renderHighlightedText(selectedCollection.title[language], highlightTerms, isArabic) : (isArabic ? 'مكتبة الأدلة الإرشادية الطبية' : 'Medical Guidelines Library')}
              </h1>
              <p dir={localizedDirection} className={`mt-2 max-w-3xl text-xs font-semibold leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7 ${localizedTextAlign}`}>
                {selectedCollection ? renderHighlightedText(selectedCollection.subtitle[language], highlightTerms, isArabic) : (isArabic ? 'اختر مدرسة أو ملفًا من الفهرس. المحتوى هنا مساعد بحثي يعرض ما هو متاح من نصوص الجايدلاينز والمصادر المرفوعة، مع ضرورة الرجوع للمرجع الأصلي عند اتخاذ قرار علاجي.' : 'Choose a school or file from the index. This workspace helps search the uploaded guideline texts and sources, while clinical decisions still require checking the original reference.')}
              </p>

              {selectedCollection && (
                <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-4">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                      <LuSparkles className="h-4 w-4" />
                      {isArabic ? 'المدرسة' : 'School'}
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-800">{selectedCollection.school}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                      <LuCalendar className="h-4 w-4" />
                      {isArabic ? 'السنة' : 'Year'}
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-800">{selectedCollection.year}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                      <LuFileText className="h-4 w-4" />
                      {isArabic ? 'آخر مراجعة' : 'Last Review'}
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-800">{selectedCollection.sourceDate}</div>
                  </div>
                </div>
              )}
            </div>

            <details className="border-t border-slate-100 bg-slate-50/30">
              <summary className="cursor-pointer px-3 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-100 sm:px-6">
                <span className="inline-flex items-center gap-2">
                  <LuShieldCheck className="h-3.5 w-3.5" />
                  {isArabic ? 'مهم قبل الاستخدام — اضغط للقراءة' : 'Important — Click to read'}
                </span>
              </summary>
              <div className="border-t border-slate-100 px-3 py-3 sm:px-6">
              <p className="mt-1 text-xs font-semibold leading-6 text-slate-700 sm:mt-2 sm:text-sm sm:leading-7">
                {isArabic
                  ? 'هذا القسم عبارة عن منصة بحثية ومساعد علمي تدريبي للأطباء والممارسين الصحيين، يجمع ويلخص الأدلة الإرشادية العالمية من مصادرها الرسمية المعتمدة (مثل ADA, AHA, ESC, GINA وغيرها). اتخاذ قرار العلاج والتشخيص النهائي والرجوع للمصادر يقع بالكامل على عاتق الطبيب المعالج.'
                  : 'This section serves as a clinical reference and educational study aid for healthcare professionals, consolidating guidelines from official authoritative bodies (e.g., ADA, AHA, ESC, GINA). The treating physician bears sole responsibility for final diagnosis, treatment decisions, and primary source verification.'}
              </p>
              </div>
            </details>
          </div>
        </section>

        <section className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-50 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
              >
                {isArabic ? 'العودة' : 'Back'}
              </button>
            )}
            <span className="min-w-0 truncate text-sm font-black text-slate-900">
              {isArabic ? 'مكتبة الجايدلاينز' : 'Guidelines Library'}
            </span>
          </div>

          <div className="inline-flex shrink-0 rounded-xl bg-slate-50 p-1 ring-1 ring-slate-100">
            {(['ar', 'en'] as GuidelineLanguage[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                className={`h-8 rounded-lg px-3 text-xs font-black transition ${
                  language === item
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                {item === 'ar' ? 'عربي' : 'English'}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-4 pb-2">
          <aside className={`flex shrink-0 flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm lg:w-80 ${!selectedSource ? 'w-full' : 'hidden lg:flex'}`}>
            <GuidelineSourceTree
              language={language}
              selectedCollectionId={selectedCollectionId}
              selectedSourceId={selectedSourceId}
              onSelectSource={selectGuidelineSource}
              isFreeGuidelinesPlan={isFreeGuidelinesPlan}
              onLockedGuidelineClick={() => {
                const message = isArabic
                  ? 'هذا الجايدلاين مفتوح للحسابات المدفوعة: Plus أو برو أو برو ماكس.'
                  : 'This guideline is open for paid plans: Plus, Pro, or Pro Max.';
                if (showNotification) {
                  showNotification(message, 'warning');
                } else {
                  window.alert(message);
                }
              }}
            />
          </aside>

          <main className={`min-w-0 flex-1 flex-col rounded-[2rem] border border-slate-100 bg-white shadow-sm ${!selectedSource ? 'hidden lg:flex lg:self-start lg:mt-4' : 'flex'}`}>
            {!selectedCollection || !selectedSource ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <LuBookOpen className="mb-4 h-16 w-16 text-slate-200" />
                <h2 className="mb-2 text-xl font-black text-slate-900">
                  {isArabic ? 'مرحباً بك في مكتبة الأدلة الإرشادية' : 'Welcome to the Guidelines Library'}
                </h2>
                <p className="max-w-md text-sm font-semibold text-slate-500">
                  {isArabic ? 'يرجى اختيار أحد فصول الكتاب من القائمة الجانبية لبدء التصفح والبحث.' : 'Please select a chapter or file from the menu to start browsing.'}
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex h-[60vh] items-center justify-center text-slate-600">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-slate-700"></div>
                  <div className="text-sm font-black">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div>
                </div>
              </div>
            ) : (
              <>
                <article className="min-w-0 max-w-full" dir={localizedDirection}>
                  <div className="flex min-w-0 flex-col p-0">
                    <div className="flex shrink-0 flex-col items-stretch justify-between gap-2 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-6">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSourceId('');
                            setSelectedSourceSnapshot(null);
                          }}
                          className="lg:hidden inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                        >
                          <LuChevronRight className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
                          {isArabic ? 'القائمة' : 'List'}
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-800">
                          <LuBookOpen className="h-3.5 w-3.5" />
                          {selectedCollection.school} {selectedCollection.year}
                        </span>
                      </div>
                      <a
                        href={selectedSource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
                        dir="ltr"
                      >
                        <LuExternalLink className="h-3.5 w-3.5" />
                        {isArabic ? 'المصدر الرسمي' : 'Official source'}
                      </a>
                    </div>

                    <div className="min-w-0 flex-1 max-w-full px-4 py-6 sm:px-8">
                      <h2 dir="ltr" className="mb-4 text-xl text-left [unicode-bidi:plaintext] font-black leading-tight text-slate-950 sm:text-2xl">
                        {renderHighlightedText(selectedSource.title, highlightTerms, isArabic)}
                      </h2>

                      {activeTopics.length > 0 && (
                        <div className="space-y-6">
                          {activeTopics.map((topic) => (
                            <details key={topic.id} className="group rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden mb-6">
                              <summary className="border-b border-slate-50 bg-slate-50/50 p-5 sm:p-6 cursor-pointer hover:bg-slate-100/50 transition-colors [&::-webkit-details-marker]:hidden">
                                <div className="flex items-start justify-between gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
                                  <div className="flex-1" style={{ textAlign: isArabic ? 'right' : 'left' }}>
                                    <h3 className="text-lg font-black text-slate-900">
                                      {topic.title[language]}
                                    </h3>
                                    {topic.summary && (
                                      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                                        {topic.summary[language]}
                                      </p>
                                    )}
                                  </div>
                                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 transition-transform group-open:rotate-180">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </summary>
                              <div className="p-5 bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
                                {topic.points?.[language] && topic.points[language].length > 0 && (
                                  <ul className="space-y-4" style={{ textAlign: isArabic ? 'right' : 'left' }}>
                                    {topic.points[language].map((point, idx) => (
                                      <li key={idx} className="flex gap-3 text-sm font-semibold leading-8 text-slate-700">
                                        <div className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                        <span className="flex-1">{renderMarkdownText(point, highlightTerms, isArabic)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}

                    {/* Collapsible Manual Browse for recommendations & figures */}
                    {(filteredRecommendations.length > 0 || (activeDigest?.tablesAndFigures && activeDigest.tablesAndFigures.length > 0)) ? (
                      <div className="mt-4 shrink-0 rounded-3xl border border-slate-200/70 bg-white transition-all sm:mt-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 bg-white p-4 text-sm font-black text-slate-800 sm:p-5">
                            <LuShieldCheck className="h-5 w-5 text-teal-600" />
                            {isArabic 
                              ? 'التوصيات والجداول الرسمية المكتوبة للكتاب' 
                              : 'Official written recommendations & tables'}
                        </div>
                        <div className="p-4 sm:p-5">
                          {/* Recommendations Render */}
                          {filteredRecommendations.length > 0 && (
                            <div className="space-y-3">
                              <ol className="space-y-3" dir="ltr">
                                {filteredRecommendations.map((recommendation) => {
                                  const explanation = ADA_2026_EXPLANATIONS[recommendation.id];
                                  return (
                                  <li key={recommendation.id} className="min-w-0 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm p-5 text-left sm:p-6">
                                    <div className="flex flex-wrap items-center justify-start gap-2 text-xs font-black text-slate-700">
                                      <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-white">{localizeNumber(recommendation.id, isArabic)}</span>
                                      {recommendation.grade && (
                                        <span className="rounded-xl bg-white px-3 py-1.5 text-emerald-800 font-bold ring-1 ring-emerald-100 shadow-sm">Grade {recommendation.grade}</span>
                                      )}
                                      <span className="text-slate-500">{isArabic ? 'ص' : 'p.'} {localizeNumber(recommendation.page, isArabic)}</span>
                                    </div>
                                    <p className={`mt-1 break-words text-xs font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere] sm:mt-2 sm:text-sm sm:leading-7 ${englishTextClass}`}>
                                      {renderHighlightedText(recommendation.text, highlightTerms, isArabic)}
                                    </p>
                                    
                                    {/* Local Explanation Injector */}
                                    {explanation && (
                                      <div className="mt-4 rounded-2xl bg-teal-50/80 p-4 border border-teal-100/50">
                                        <h4 className="flex items-center gap-1.5 text-xs font-black text-teal-800 mb-2">
                                          <LuStethoscope className="h-4 w-4" />
                                          {isArabic ? 'الشرح السريري المبسط' : 'Clinical Explanation'}
                                        </h4>
                                        <p className={`text-xs font-bold leading-6 text-teal-900 ${arabicTextClass}`}>
                                          {explanation}
                                        </p>
                                      </div>
                                    )}
                                  </li>
                                )})}
                              </ol>
                            </div>
                          )}

                          {/* Tables & Figures Render */}
                          {activeDigest?.tablesAndFigures && activeDigest.tablesAndFigures.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <div className="grid gap-4 lg:grid-cols-2">
                                {activeDigest.tablesAndFigures.map((item) => (
                                  <figure key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
                                    <a href={item.imageSrc} target="_blank" rel="noreferrer" className="block bg-white p-3">
                                      <img
                                        src={item.imageSrc}
                                        alt={item.caption || item.title}
                                        loading="lazy"
                                        className="w-full object-contain max-h-[520px]"
                                      />
                                    </a>
                                    {item.caption && (
                                      <figcaption className="border-t border-blue-100 p-3 text-xs font-bold leading-6 text-slate-600">
                                        <LuImage className="mt-1 h-4 w-4 shrink-0 text-blue-600 inline-block mr-1.5" />
                                        <span>{item.caption} (p. {item.page})</span>
                                      </figcaption>
                                    )}
                                  </figure>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : activeTopics.length === 0 ? (
                      <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
                        <p className="mb-2 text-lg">
                          {isArabic ? 'جاري إضافة ملخصات احترافية لهذا الفصل قريباً...' : 'Professional summaries for this chapter are currently being added...'}
                        </p>
                        <p className="text-blue-600 text-base">
                          {isArabic ? 'المحتوى متاح حالياً بالكامل، يمكنك التوجه لصفحة "المساعد الطبي" للبحث الذكي بداخله، أو النقر على الرابط أعلاه لتصفح المرجع الرسمي.' : 'The content is fully available now. You can head to the "Medical Assistant" page for smart search within it, or click the link above to browse the official reference.'}
                        </p>
                      </div>
                    ) : null}
                    </div>
                  </div>
                </article>
              </>
            )}
          </main>
        </section>

      </div>
    </div>
  );
};

