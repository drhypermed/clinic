import React, { useEffect, useMemo, useState } from 'react';
import {
  LuBookOpen,
  LuCalendar,
  LuChevronDown,
  LuExternalLink,
  LuFileText,
  LuFolder,
  LuFolderOpen,
  LuImage,
  LuMenu,
  LuSearch,
  LuShieldCheck,
  LuSparkles,
  LuX,
} from 'react-icons/lu';
import {
  GUIDELINE_COLLECTIONS,
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
  loadGuidelineCollectionData,
} from './guidelinesData';
import { GuidelinesChat } from './GuidelinesChat';

const languageLabels: Record<GuidelineLanguage, string> = {
  ar: 'العربية',
  en: 'English',
};

const getLanguageDirection = (language: GuidelineLanguage) => (language === 'ar' ? 'rtl' : 'ltr');

const getLanguageTextAlign = (language: GuidelineLanguage) => (language === 'ar' ? 'text-right' : 'text-left');

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim();

export const localizeNumber = (text: string | number | undefined, isArabic: boolean): string => {
  if (text === undefined || text === null) return '';
  return String(text);
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHighlightTerms = (value: string) =>
  value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

const renderHighlightedText = (text: string, terms: string[], isArabic: boolean = false) => {
  if (terms.length === 0) return localizeNumber(text, isArabic);
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => {
    const isMatch = terms.some((term) => part.localeCompare(term, undefined, { sensitivity: 'accent' }) === 0)
      || terms.some((term) => part.toLowerCase() === term.toLowerCase());
    if (!isMatch) return <React.Fragment key={`${part}-${index}`}>{localizeNumber(part, isArabic)}</React.Fragment>;
    return (
      <mark key={`${part}-${index}`} className="rounded bg-amber-200 px-1 font-black text-amber-950">
        {localizeNumber(part, isArabic)}
      </mark>
    );
  });
};

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

export const GuidelinesPage: React.FC = () => {
  const [language, setLanguage] = useState<GuidelineLanguage>('ar');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSchool, setExpandedSchool] = useState(GUIDELINE_COLLECTIONS[0]?.school ?? '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((current) => ({
      ...current,
      [folderName]: !current[folderName],
    }));
  };

  const collectionsBySchool = useMemo(() => {
    const map = new Map<string, GuidelineCollection[]>();
    for (const c of GUIDELINE_COLLECTIONS) {
      const arr = map.get(c.school) || [];
      arr.push(c);
      map.set(c.school, arr);
    }
    return map;
  }, []);

  const [collectionData, setCollectionData] = useState<GuidelineCollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setCollectionData(null);
    loadGuidelineCollectionData(selectedCollectionId).then((data) => {
      if (isMounted) {
        setCollectionData(data);
        setIsLoading(false);
      }
    });

    const collection = GUIDELINE_COLLECTIONS.find((item) => item.id === selectedCollectionId);
    if (collection && collection.sources.length > 0) {
      setSelectedSourceId(collection.sources[0].id);
    } else {
      setSelectedSourceId('');
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCollectionId]);

  const selectedCollection = useMemo(
    () => GUIDELINE_COLLECTIONS.find((item) => item.id === selectedCollectionId) ?? null,
    [selectedCollectionId],
  );

  const selectedSource = useMemo(
    () => selectedCollection?.sources.find((source) => source.id === selectedSourceId) ?? null,
    [selectedCollection, selectedSourceId],
  );

  const collectionFolders = useMemo(() => {
    if (!selectedCollection) return null;
    const hasFolders = selectedCollection.sources.some(s => s.folderTitle);
    if (!hasFolders) return null;

    const map = new Map<string, { title: string; sources: GuidelineCollection['sources'] }>();
    for (const source of selectedCollection.sources) {
      const folderTitle = source.folderTitle ?? 'KDIGO';
      const existing = map.get(folderTitle);
      if (existing) {
        existing.sources.push(source);
      } else {
        map.set(folderTitle, {
          title: folderTitle,
          sources: [source],
        });
      }
    }
    return Array.from(map.values());
  }, [selectedCollection]);

  const activeDigest = useMemo(() => {
    if (!collectionData?.recommendationDigest) return null;
    return collectionData.recommendationDigest.find((digest) => digest.sourceId === selectedSourceId) ?? null;
  }, [collectionData, selectedSourceId]);

  const query = normalizeSearchText(searchTerm);
  const highlightTerms = useMemo(() => buildHighlightTerms(searchTerm), [searchTerm]);

  const filteredRecommendations = useMemo(() => {
    if (!activeDigest) return [];
    if (!query) return activeDigest.recommendations;
    return activeDigest.recommendations.filter((rec) =>
      normalizeSearchText(rec.id + ' ' + rec.text).includes(query)
    );
  }, [activeDigest, query]);

  const isArabic = language === 'ar';
  const localizedDirection = getLanguageDirection(language);
  const localizedTextAlign = getLanguageTextAlign(language);
  const englishTextClass = 'text-left [unicode-bidi:plaintext]';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0,#f8fafc_42%,#eef6ff_100%)]" dir={localizedDirection}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-950/10">
          <div>
            <div className="bg-gradient-to-br from-blue-950 via-blue-800 to-sky-700 p-4 text-white sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1.5 text-xs font-black text-blue-50 ring-1 ring-white/20">
                    <LuBookOpen className="h-4 w-4" />
                    {isArabic ? 'مكتبة الجايدلاينز' : 'Guidelines Library'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1.5 text-xs font-black text-blue-50 ring-1 ring-white/20">
                    <LuShieldCheck className="h-4 w-4" />
                    {isArabic ? 'ملخص موثق بالمصادر' : 'Source-linked digest'}
                  </span>
                </div>
                {/* Language Switcher */}
                <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/20">
                  {(['ar', 'en'] as GuidelineLanguage[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                        language === item ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item === 'ar' ? 'العربية' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <h1 dir={localizedDirection} className={`text-2xl font-black leading-tight text-white sm:text-3xl ${localizedTextAlign}`}>
                {selectedCollection ? renderHighlightedText(selectedCollection.title[language], highlightTerms, isArabic) : (isArabic ? 'مكتبة الأدلة الإرشادية الطبية' : 'Medical Guidelines Library')}
              </h1>
              <p dir={localizedDirection} className={`mt-3 max-w-3xl text-sm font-semibold leading-7 text-blue-50/90 sm:text-base ${localizedTextAlign}`}>
                {selectedCollection ? renderHighlightedText(selectedCollection.subtitle[language], highlightTerms, isArabic) : (isArabic ? 'اختر التخصص أو المدرسة من القائمة لبدء تصفح المراجع السريرية الأحدث الموثقة عالمياً.' : 'Select a specialty or school from the menu to start browsing the latest internationally verified clinical references.')}
              </p>

              {selectedCollection && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-100">
                      <LuSparkles className="h-4 w-4" />
                      {isArabic ? 'المدرسة' : 'School'}
                    </div>
                    <div className="mt-1 text-lg font-black text-white">{selectedCollection.school}</div>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-100">
                      <LuCalendar className="h-4 w-4" />
                      {isArabic ? 'السنة' : 'Year'}
                    </div>
                    <div className="mt-1 text-lg font-black text-white">{selectedCollection.year}</div>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-100">
                      <LuFileText className="h-4 w-4" />
                      {isArabic ? 'آخر مراجعة مصدرية' : 'Source review'}
                    </div>
                    <div className="mt-1 text-sm font-black text-white">{selectedCollection.sourceDate}</div>
                  </div>
                </div>
              )}
            </div>

            <details className="border-t border-blue-100 bg-blue-50/60">
              <summary className="cursor-pointer px-4 py-2.5 text-xs font-black text-blue-700 hover:bg-blue-50/80">
                <span className="inline-flex items-center gap-2">
                  <LuShieldCheck className="h-3.5 w-3.5" />
                  {isArabic ? 'مهم قبل الاستخدام — اضغط للقراءة' : 'Important — Click to read'}
                </span>
              </summary>
              <div className="border-t border-blue-100 px-4 py-3">
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">
                {isArabic
                  ? 'هذا القسم عبارة عن منصة بحثية ومساعد علمي تدريبي للأطباء والممارسين الصحيين، يجمع ويلخص الأدلة الإرشادية العالمية من مصادرها الرسمية المعتمدة (مثل ADA, AHA, ESC, GINA وغيرها). اتخاذ قرار العلاج والتشخيص النهائي والرجوع للمصادر يقع بالكامل على عاتق الطبيب المعالج.'
                  : 'This section serves as a clinical reference and educational study aid for healthcare professionals, consolidating guidelines from official authoritative bodies (e.g., ADA, AHA, ESC, GINA). The treating physician bears sole responsibility for final diagnosis, treatment decisions, and primary source verification.'}
              </p>
              </div>
            </details>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white p-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-95"
            >
              {isMobileMenuOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
              {isArabic ? 'تصفح المدارس والأقسام' : 'Browse Schools & Sections'}
            </button>
          </div>
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-xl shadow-blue-950/10 lg:sticky lg:top-4 lg:self-start lg:block`}>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-black text-slate-500">
                  {isArabic ? 'المدارس والإصدارات' : 'Schools & Editions'}
                </div>
                <div className="space-y-1">
                  {Array.from(collectionsBySchool.entries()).map(([school, collections]) => {
                    const isOpen = expandedSchool === school;
                    return (
                      <div key={school}>
                        <button
                          type="button"
                          onClick={() => setExpandedSchool(isOpen ? '' : school)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-black text-slate-800 transition hover:bg-blue-50"
                        >
                          {isOpen ? <LuFolderOpen className="h-4 w-4 text-blue-600" /> : <LuFolder className="h-4 w-4 text-slate-400" />}
                          <span className="flex-1 text-start">{school}</span>
                          <LuChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className={`mt-1 space-y-2 border-blue-100 ${isArabic ? 'mr-4 border-r-2 pr-2' : 'ml-4 border-l-2 pl-2'}`}>
                            {collections.map((c) => {
                              const isCollectionActive = c.id === selectedCollectionId;
                              return (
                                <div key={c.id} className="space-y-1">
                                  <div className="px-2 py-1 text-xs font-black text-slate-400 uppercase">
                                    {c.school} {c.year === 2026 && c.school === 'KDIGO' ? (isArabic ? 'المكتبة' : 'Library') : localizeNumber(c.year, isArabic)}
                                  </div>
                                  <div className="space-y-1">
                                    {collectionFolders && isCollectionActive ? (
                                      <div className="space-y-2">
                                        {collectionFolders.map((folder) => {
                                          const isFolderOpen = !!expandedFolders[folder.title] || folder.sources.some(s => s.id === selectedSourceId);
                                          return (
                                            <div key={folder.title} className="rounded-xl border border-blue-50 bg-blue-50/20 p-1.5">
                                              <button
                                                type="button"
                                                onClick={() => toggleFolder(folder.title)}
                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-xs font-black text-slate-800 transition hover:bg-white hover:text-blue-800"
                                              >
                                                {isFolderOpen ? <LuFolderOpen className="h-4 w-4 shrink-0 text-blue-600" /> : <LuFolder className="h-4 w-4 shrink-0 text-blue-600" />}
                                                <span className="min-w-0 flex-1 leading-5">{folder.title}</span>
                                                <LuChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isFolderOpen ? 'rotate-180' : ''}`} />
                                              </button>
                                              
                                              {isFolderOpen && (
                                                <div className={`mt-1.5 space-y-1 ${isArabic ? 'mr-3 border-r border-blue-100 pr-1.5' : 'ml-3 border-l border-blue-100 pl-1.5'}`}>
                                                  {folder.sources.map((source) => {
                                                    const isActive = isCollectionActive && source.id === selectedSourceId;
                                                    return (
                                                      <button
                                                        key={source.id}
                                                        type="button"
                                                        onClick={() => {
                                                          setSelectedCollectionId(c.id);
                                                          setSelectedSourceId(source.id);
                                                          setIsMobileMenuOpen(false);
                                                        }}
                                                        className={`flex w-full items-start gap-1.5 rounded-lg px-2 py-2 text-start text-[11px] font-bold leading-5 transition ${
                                                          isActive
                                                            ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-900/15'
                                                            : 'text-slate-600 hover:bg-white hover:text-blue-800'
                                                        }`}
                                                      >
                                                        <LuFileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                        <span className="min-w-0 flex-1 block">
                                                          {source.title}
                                                        </span>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      c.sources.map((source) => {
                                        const isActive = isCollectionActive && source.id === selectedSourceId;
                                        return (
                                          <button
                                            key={source.id}
                                            type="button"
                                            onClick={() => {
                                              setSelectedCollectionId(c.id);
                                              setSelectedSourceId(source.id);
                                              setIsMobileMenuOpen(false);
                                            }}
                                            className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-start text-xs font-bold leading-5 transition ${
                                              isActive
                                                ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-900/15'
                                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'
                                            }`}
                                          >
                                            <LuFileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="min-w-0 flex-1 block">
                                              {source.title}
                                            </span>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            {!selectedCollection || !selectedSource ? (
              <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center shadow-lg shadow-blue-950/5">
                <LuBookOpen className="mb-4 h-16 w-16 text-blue-200" />
                <h2 className="mb-2 text-xl font-black text-slate-900">
                  {isArabic ? 'مرحباً بك في مكتبة الأدلة الإرشادية' : 'Welcome to the Guidelines Library'}
                </h2>
                <p className="max-w-md text-sm font-semibold text-slate-500">
                  {isArabic ? 'يرجى اختيار أحد فصول الكتاب من القائمة الجانبية لبدء التصفح والبحث الذكي.' : 'Please select a chapter or file from the menu to start browsing and smart search.'}
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-blue-100 bg-white/50 text-blue-800">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="text-sm font-black">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div>
                </div>
              </div>
            ) : (
              <>
                <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-950/5" dir={localizedDirection}>
                  <div className="h-1 bg-gradient-to-r from-blue-700 to-sky-600" />
                  <div className="p-4 sm:p-6">
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800 ring-1 ring-blue-100">
                        <LuBookOpen className="h-3.5 w-3.5" />
                        {selectedCollection.school} {selectedCollection.year}
                      </span>
                    </div>

                    <h2 className="text-xl font-black leading-tight text-slate-950">
                      {renderHighlightedText(selectedSource.title, highlightTerms, isArabic)}
                    </h2>
                    
                    <div className="mt-4 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                      <div className="text-xs font-black text-blue-900 mb-1">
                        {isArabic ? 'المصدر والتوثيق الرسمي' : 'Official Citation & Source'}
                      </div>
                      <p className="text-xs font-semibold leading-6 text-slate-600 font-sans" dir="ltr">
                        {selectedSource.citation}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={selectedSource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-600 hover:text-white"
                          dir="ltr"
                        >
                          <LuExternalLink className="h-3.5 w-3.5" />
                          {isArabic ? 'الموقع الرسمي للمرجع' : 'Official Reference URL'}
                        </a>
                      </div>
                    </div>

                    {/* Embedded conversational AI Assistant */}
                    <div className="mt-6">
                      <GuidelinesChat
                        language={language}
                        selectedCollection={selectedCollection}
                        selectedSourceId={selectedSourceId}
                        collectionData={collectionData}
                        isEmbedded={true}
                      />
                    </div>

                    {/* Collapsible Manual Browse for recommendations & figures */}
                    {(filteredRecommendations.length > 0 || (activeDigest?.tablesAndFigures && activeDigest.tablesAndFigures.length > 0)) ? (
                      <details className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/20 transition-all overflow-hidden">
                        <summary className="cursor-pointer p-4 text-sm font-black text-blue-900 bg-white hover:bg-blue-50/50 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <LuShieldCheck className="h-4 w-4 text-blue-700" />
                            {isArabic 
                              ? 'تصفح التوصيات والجداول الرسمية المكتوبة للكتاب يدوياً' 
                              : 'Browse official written recommendations & tables manually'}
                          </span>
                        </summary>
                        <div className="border-t border-blue-100 bg-white p-4">
                          {/* Recommendations Render */}
                          {filteredRecommendations.length > 0 && (
                            <div className="space-y-3">
                              <ol className="space-y-3" dir="ltr">
                                {filteredRecommendations.map((recommendation) => (
                                  <li key={recommendation.id} className="rounded-xl border border-blue-50 bg-blue-50/40 p-4 text-left">
                                    <div className="flex flex-wrap items-center justify-start gap-2 text-xs font-black text-blue-700">
                                      <span className="rounded-md bg-blue-700 px-2 py-1 text-white">{localizeNumber(recommendation.id, isArabic)}</span>
                                      {recommendation.grade && (
                                        <span className="rounded-md bg-blue-100 px-2 py-1 text-blue-800 font-bold ring-1 ring-blue-200">Grade {recommendation.grade}</span>
                                      )}
                                      <span className="text-slate-500">{isArabic ? 'ص' : 'p.'} {localizeNumber(recommendation.page, isArabic)}</span>
                                    </div>
                                    <p className={`mt-2 text-sm font-semibold leading-7 text-slate-700 ${englishTextClass}`}>
                                      {renderHighlightedText(recommendation.text, highlightTerms, isArabic)}
                                    </p>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Tables & Figures Render */}
                          {activeDigest?.tablesAndFigures && activeDigest.tablesAndFigures.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <div className="grid gap-4 lg:grid-cols-2">
                                {activeDigest.tablesAndFigures.map((item) => (
                                  <figure key={item.id} className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50">
                                    <a href={item.imageSrc} target="_blank" rel="noreferrer" className="block bg-white p-2">
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
                      </details>
                    ) : (
                      /* If file is full text only and has no recommendations/images */
                      <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-center">
                        <LuFileText className="mx-auto mb-3 h-10 w-10 text-blue-200" />
                        <h4 className="text-sm font-black text-slate-900 mb-1">
                          {isArabic ? 'هذا الملف متوفر كنص كامل للبحث والدردشة' : 'This file is available as full-text search & chat'}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                          {isArabic 
                            ? 'لا توجد قائمة توصيات مفصولة لهذا الملف، ولكن محتواه الكامل مفهرس برمجياً في السحابة. اكتب أي سؤال أو كلمة بحث في خانة البحث بالأعلى لمحادثة الذكاء الاصطناعي حول محتوى هذا الملف!'
                            : 'No isolated recommendation list exists for this file, but its entire content is fully indexed in the cloud. Type keywords in the search bar above to chat about this file!'}
                        </p>
                      </div>
                    )}
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
