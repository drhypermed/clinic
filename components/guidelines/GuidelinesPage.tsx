import React, { useEffect, useMemo, useState } from 'react';
import {
  LuBookOpen,
  LuCalendar,
  LuChevronDown,
  LuCircleCheck,
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
  GUIDELINE_GROUP_LABELS,
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
  type GuidelineSourceDigest,
  type GuidelineTopic,
  loadGuidelineCollectionData,
} from './guidelinesData';

const languageLabels: Record<GuidelineLanguage, string> = {
  ar: 'العربية',
  en: 'English',
};

const defaultTopicPalette = {
  active: 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-900/15',
  accent: 'bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400',
  badge: 'bg-blue-50 text-blue-800 ring-blue-100',
  border: 'border-blue-100',
  detail: 'border-blue-100 bg-blue-50/60',
  icon: 'text-blue-600',
  soft: 'bg-blue-50 text-blue-800 ring-1 ring-blue-100',
};

const topicPalettes: Record<GuidelineTopic['group'], typeof defaultTopicPalette> = {
  populationCare: defaultTopicPalette,
  diagnosisClassification: defaultTopicPalette,
  preventionEvaluation: defaultTopicPalette,
  behaviorsGoalsTech: defaultTopicPalette,
  weightPharmacology: defaultTopicPalette,
  complicationsRisk: defaultTopicPalette,
  specialPopulations: defaultTopicPalette,
  ginaIntroduction: defaultTopicPalette,
  ginaDiagnosis: defaultTopicPalette,
  ginaAssessment: defaultTopicPalette,
  ginaGeneralPrinciples: defaultTopicPalette,
  ginaAdultMedication: defaultTopicPalette,
  ginaChildMedication: defaultTopicPalette,
  ginaSpecificPopulations: defaultTopicPalette,
  ginaExacerbations: defaultTopicPalette,
  ginaReferenceTables: defaultTopicPalette,
};

const priorityTagFragments = [
  'a1c',
  'fpg',
  'ogtt',
  'cgm',
  'dka',
  'hhs',
  'ascvd',
  'ckd',
  'egfr',
  'uacr',
  'insulin',
  'statin',
  'pregnancy',
  'gdm',
  'hypoglycemia',
  'metformin',
  'sglt2',
  'glp-1',
];

const getTopicPalette = (group: GuidelineTopic['group']) => topicPalettes[group] ?? defaultTopicPalette;

const getPriorityTags = (tags: string[]) =>
  tags.filter((tag) => priorityTagFragments.some((fragment) => tag.toLowerCase().includes(fragment))).slice(0, 5);

const getLanguageDirection = (language: GuidelineLanguage) => (language === 'ar' ? 'rtl' : 'ltr');

const getLanguageTextAlign = (language: GuidelineLanguage) => (language === 'ar' ? 'text-right' : 'text-left');

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHighlightTerms = (value: string) =>
  value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

const renderHighlightedText = (text: string, terms: string[]) => {
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => {
    const isMatch = terms.some((term) => part.localeCompare(term, undefined, { sensitivity: 'accent' }) === 0)
      || terms.some((term) => part.toLowerCase() === term.toLowerCase());
    if (!isMatch) return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    return (
      <mark key={`${part}-${index}`} className="rounded bg-amber-200 px-1 font-black text-amber-950">
        {part}
      </mark>
    );
  });
};
const clinicalRegex = /((?:<|>|≥|≤|>=|<=|~)?\s*\b\d+(?:[,.]\d+)*(?:\s*-\s*\d+(?:[,.]\d+)*)?(?:\s*\/\s*\d+(?:[,.]\d+)*)?\s*(?:%|mg\/dL|mmHg|mmol\/L|kg\/m2|U(?:\/L)?|units?(?:\/dose)?|g(?:\/dL)?|mg|mcg|mEq|L|mL(?:\/min(?:\/1\.73\s*m2)?)?|h|m2|kg|cm|hours?|weeks?|months?|years?|days?|أشهر|شهر|أسابيع|أسبوع|أيام|يوم|ساعات|ساعة|سنة|سنوات|مرات|مرة|جرعات|جرعة|حبات|حبة)?)/gi;
const renderTextWithPills = (text: string, highlightTerms: string[]) => {
  if (!text) return text;
  const tokens = text.split(clinicalRegex);
  return tokens.map((token, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-bold text-xs ring-1 ring-blue-200/50" dir="ltr">
          {token.trim()}
        </span>
      );
    } else {
      return renderHighlightedText(token, highlightTerms);
    }
  });
};

const buildTopicSearchText = (topic: GuidelineTopic, collection: GuidelineCollection) =>
  normalizeSearchText([
    collection.school,
    collection.year,
    collection.title.ar,
    collection.title.en,
    topic.title.ar,
    topic.title.en,
    topic.summary.ar,
    topic.summary.en,
    topic.points.ar.join(' '),
    topic.points.en.join(' '),
    topic.details?.map((block) => [
      block.title.ar,
      block.title.en,
      block.items.ar.join(' '),
      block.items.en.join(' '),
    ].join(' ')).join(' '),
    topic.practiceNote?.ar,
    topic.practiceNote?.en,
    topic.visuals?.map((visual) => [
      visual.title.ar,
      visual.title.en,
      visual.label,
      visual.takeaways?.ar.join(' '),
      visual.takeaways?.en.join(' '),
    ].join(' ')).join(' '),
    topic.tags.join(' '),
  ].filter(Boolean).join(' '));

const buildSourceDigestSearchText = (digest: GuidelineSourceDigest, collection: GuidelineCollection) =>
  normalizeSearchText([
    collection.school,
    collection.year,
    digest.title,
    digest.sourcePdf,
    digest.recommendations.map((recommendation) => [
      recommendation.id,
      recommendation.grade,
      recommendation.page,
      recommendation.text,
    ].join(' ')).join(' '),
  ].filter(Boolean).join(' '));

export const GuidelinesPage: React.FC = () => {
  const [language, setLanguage] = useState<GuidelineLanguage>('ar');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GuidelineTopic['group']>('populationCare');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSchool, setExpandedSchool] = useState(GUIDELINE_COLLECTIONS[0]?.school ?? '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    if (selectedCollectionId.startsWith('gina')) {
      setSelectedGroup('ginaIntroduction');
    } else if (selectedCollectionId.startsWith('ada')) {
      setSelectedGroup('populationCare');
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCollectionId]);

  const selectedCollection = useMemo(
    () => GUIDELINE_COLLECTIONS.find((item) => item.id === selectedCollectionId) ?? null,
    [selectedCollectionId],
  );

  const query = normalizeSearchText(searchTerm);
  const highlightTerms = useMemo(() => buildHighlightTerms(searchTerm), [searchTerm]);

  const filteredTopics = useMemo(() => {
    if (!selectedCollection || !collectionData) return [];
    return collectionData.topics.filter((topic) => {
      if (topic.group !== selectedGroup) return false;
      if (!query) return true;
      return buildTopicSearchText(topic, selectedCollection).includes(query);
    });
  }, [query, selectedCollection, collectionData, selectedGroup]);

  const selectedGroupTopicCount = useMemo(
    () => collectionData?.topics.filter((topic) => topic.group === selectedGroup).length ?? 0,
    [collectionData, selectedGroup],
  );

  const sourcesById = useMemo(() => {
    const entries = selectedCollection?.sources.map((source) => [source.id, source] as const) ?? [];
    return new Map(entries);
  }, [selectedCollection]);

  const groupSourceIds = useMemo(() => {
    if (!collectionData) return null;
    return new Set(
      collectionData.topics
        .filter((topic) => topic.group === selectedGroup)
        .flatMap((topic) => [
          ...topic.sourceIds,
          ...(topic.visuals?.map((visual) => visual.sourceId) ?? []),
        ]),
    );
  }, [collectionData, selectedGroup]);

  const filteredSourceDigests = useMemo(() => {
    if (!collectionData?.recommendationDigest) return [];
    return collectionData.recommendationDigest.filter((digest) => {
      if (groupSourceIds && !groupSourceIds.has(digest.sourceId)) return false;
      if (!query) return true;
      return buildSourceDigestSearchText(digest, selectedCollection).includes(query);
    });
  }, [groupSourceIds, query, selectedCollection, collectionData]);

  const filteredRecommendationCount = useMemo(
    () => filteredSourceDigests.reduce((total, digest) => total + digest.recommendations.length, 0),
    [filteredSourceDigests],
  );

  const filteredVisualCount = useMemo(
    () => filteredTopics.reduce((total, topic) => total + (topic.visuals?.length ?? 0), 0),
    [filteredTopics],
  );

  const isArabic = language === 'ar';
  const localizedDirection = getLanguageDirection(language);
  const localizedTextAlign = getLanguageTextAlign(language);
  const englishTextClass = 'text-left [unicode-bidi:plaintext]';
  const groups = useMemo<GuidelineTopic['group'][]>(() => {
    if (selectedCollectionId.startsWith('gina')) {
      return [
        'ginaIntroduction',
        'ginaDiagnosis',
        'ginaAssessment',
        'ginaGeneralPrinciples',
        'ginaAdultMedication',
        'ginaChildMedication',
        'ginaSpecificPopulations',
        'ginaExacerbations',
        'ginaReferenceTables',
      ];
    }
    return [
      'populationCare',
      'diagnosisClassification',
      'preventionEvaluation',
      'behaviorsGoalsTech',
      'weightPharmacology',
      'complicationsRisk',
      'specialPopulations',
    ];
  }, [selectedCollectionId]);



  const selectedGroupLabel = GUIDELINE_GROUP_LABELS[selectedGroup][language];

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
                {selectedCollection ? renderHighlightedText(selectedCollection.title[language], highlightTerms) : (isArabic ? 'مكتبة الأدلة الإرشادية الطبية' : 'Medical Guidelines Library')}
              </h1>
              <p dir={localizedDirection} className={`mt-3 max-w-3xl text-sm font-semibold leading-7 text-blue-50/90 sm:text-base ${localizedTextAlign}`}>
                {selectedCollection ? renderHighlightedText(selectedCollection.subtitle[language], highlightTerms) : (isArabic ? 'اختر التخصص أو المدرسة من القائمة لبدء تصفح المراجع السريرية الأحدث الموثقة عالمياً.' : 'Select a specialty or school from the menu to start browsing the latest internationally verified clinical references.')}
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
                  ? 'هذا القسم عبارة عن منصة بحثية ومساعد علمي تدريبي للأطباء والممارسين الصحيين، يجمع ويلخص الأدلة الإرشادية العالمية من مصادرها الرسمية المعتمدة (مثل ADA, AHA, ESC, GINA وغيرها). هذا التلخيص التفاعلي مُصمم لتسهيل الوصول السريع للمعلومة ولا يُغني إطلاقاً عن تقدير الطبيب السريري الشخصي، ولا يحل محل النسخ الكاملة والأدلة الأصلية الصادرة عن الهيئات المختصة. اتخاذ قرار العلاج والتشخيص النهائي والرجوع للمصادر يقع بالكامل على عاتق الطبيب المعالج.'
                  : 'This section serves as a clinical reference and educational study aid for healthcare professionals, consolidating and summarizing international guidelines from official authoritative bodies (e.g., ADA, AHA, ESC, GINA). These interactive digests are designed to facilitate quick reference and must not substitute for the full official text or the physician’s independent clinical judgment. The treating physician bears sole responsibility for final diagnosis, treatment decisions, and primary source verification.'}
              </p>
              </div>
            </details>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
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
                          <div className={`mt-1 space-y-1 border-blue-100 ${isArabic ? 'mr-4 border-r-2 pr-2' : 'ml-4 border-l-2 pl-2'}`}>
                            {collections.map((c, idx) => {
                              const isActive = c.id === selectedCollectionId;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setSelectedCollectionId(c.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-black transition ${
                                    isActive ? 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-800 ring-1 ring-blue-200' : 'text-slate-600 hover:bg-blue-50'
                                  }`}
                                >
                                  <LuFileText className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span>{c.year}</span>
                                  {idx === 0 && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
                                      {isArabic ? 'الأحدث' : 'Latest'}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-500">
                  {isArabic ? 'بحث سريع' : 'Quick Search'}
                </label>
                <div className="relative">
                  <LuSearch className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isArabic ? 'right-3' : 'left-3'}`} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={isArabic ? 'ابحث: DKA، CGM، القلب، السمنة...' : 'Search: DKA, CGM, ASCVD, obesity...'}
                    dir={localizedDirection}
                    className={`w-full rounded-xl border border-blue-100 bg-blue-50/50 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                  />
                </div>
              </div>

              {selectedCollectionId && (
                <div>
                  <div className="mb-2 text-xs font-black text-slate-500">
                    {isArabic ? 'الفهرس' : 'Table of Contents'}
                  </div>
                  <div className="space-y-1.5">
                    {groups.map((group) => {
                      const active = selectedGroup === group;
                      const palette = getTopicPalette(group);
                      const label = GUIDELINE_GROUP_LABELS[group][language];
                      const count = collectionData?.topics.filter((topic) => topic.group === group).length ?? 0;
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => setSelectedGroup(group)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-black transition ${
                            active ? palette.active : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                          }`}
                        >
                          <span>{label}</span>
                          <span className={`rounded-md px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            {!selectedCollection ? (
              <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center shadow-lg shadow-blue-950/5">
                <LuBookOpen className="mb-4 h-16 w-16 text-blue-200" />
                <h2 className="mb-2 text-xl font-black text-slate-900">
                  {isArabic ? 'مرحباً بك في مكتبة الجايدلاينز' : 'Welcome to the Guidelines Library'}
                </h2>
                <p className="max-w-md text-sm font-semibold text-slate-500">
                  {isArabic ? 'يرجى اختيار إحدى المدارس والإصدارات من القائمة لبدء التصفح.' : 'Please select a school and edition from the menu to start browsing.'}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    <LuFolderOpen className="h-4 w-4" />
                    {isArabic ? 'اختر المدرسة' : 'Select School'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                    <LuFileText className="h-4 w-4" />
                    {isArabic ? 'اختر الإصدار' : 'Select Edition'}
                  </span>
                </div>
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
                <section className="sticky top-2 z-30 mb-4 overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-lg shadow-blue-950/5 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 lg:p-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-blue-700">
                        {isArabic ? 'التقسيم الحالي' : 'Current Section'}
                      </div>
                      <h2 className="text-lg font-black leading-tight text-slate-950">
                        {renderHighlightedText(selectedGroupLabel, highlightTerms)}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 ring-1 ring-blue-100">
                        <span className="text-sm font-black text-blue-700">{filteredTopics.length}</span>
                        <span className="text-[10px] font-bold text-blue-600">{isArabic ? 'موضوع' : 'Topics'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 ring-1 ring-blue-100">
                        <span className="text-sm font-black text-blue-700">{filteredRecommendationCount}</span>
                        <span className="text-[10px] font-bold text-blue-600">{isArabic ? 'توصية' : 'Recs'}</span>
                      </div>
                    </div>
                  </div>
                  {filteredTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-blue-50 bg-blue-50/50 px-3 py-2.5">
                      <div className="mr-1 flex shrink-0 items-center text-[11px] font-black text-slate-500 rtl:ml-1 rtl:mr-0">
                        {isArabic ? 'انتقال سريع:' : 'Jump to:'}
                      </div>
                      {filteredTopics.map((topic) => (
                        <a
                          key={topic.id}
                          href={`#${topic.id}`}
                          className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-blue-800 ring-1 ring-blue-200 transition hover:bg-blue-600 hover:text-white"
                        >
                          {topic.title[language]}
                        </a>
                      ))}
                    </div>
                  )}
                </section>

            {filteredTopics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center shadow-lg shadow-blue-950/5">
                <div className="text-base font-black text-slate-900">
                  {isArabic ? 'لا توجد نتيجة مطابقة' : 'No matching result'}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {isArabic ? 'جرب كلمة أبسط أو اختَر تقسيمًا آخر من القائمة.' : 'Try a simpler term or choose another section.'}
                </p>
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const palette = getTopicPalette(topic.group);
                const priorityTags = getPriorityTags(topic.tags);
                const visiblePriorityTags = priorityTags.length > 0 ? priorityTags : topic.tags.slice(0, 3);

                return (
                  <article
                    key={topic.id}
                    id={topic.id}
                    className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-blue-950/5 ${palette.border} ${isArabic ? 'text-right' : 'text-left'}`}
                    dir={localizedDirection}
                  >
                    <div className={`h-1 ${palette.accent}`} />
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`mb-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-black ring-1 ${palette.badge}`}>
                            {renderHighlightedText(GUIDELINE_GROUP_LABELS[topic.group][language], highlightTerms)}
                          </div>
                          <h2 dir={localizedDirection} className={`text-xl font-black leading-tight text-slate-950 ${localizedTextAlign}`}>
                            {renderHighlightedText(topic.title[language], highlightTerms)}
                          </h2>
                          <p dir={localizedDirection} className={`mt-2 text-sm font-semibold leading-7 text-slate-600 ${localizedTextAlign}`}>
                            {renderTextWithPills(topic.summary[language], highlightTerms)}
                          </p>
                          {visiblePriorityTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-400">
                                {isArabic ? 'مفاتيح عملية' : 'Practical keys'}
                              </span>
                              {visiblePriorityTags.map((tag) => (
                                <span key={tag} className={`rounded-md px-2.5 py-1 text-xs font-black ${palette.soft}`}>
                                  {renderHighlightedText(tag, highlightTerms)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Layer 1: Practical Summary */}
                      <div className="mt-5">
                        <div className="mb-3 flex items-center gap-1.5 text-xs font-black text-blue-700">
                          <LuCircleCheck className="h-4 w-4" />
                          {isArabic ? 'الخلاصة العملية' : 'Practical Summary'}
                        </div>
                        <ul className="grid gap-2">
                          {topic.points[language].map((point) => (
                            <li key={point} className="flex gap-2.5 rounded-xl border border-blue-50 bg-gradient-to-r from-blue-50/80 to-white p-3 text-sm font-semibold leading-7 text-slate-700">
                              <LuSparkles className={`mt-1 h-4 w-4 shrink-0 ${palette.icon}`} />
                              <span>{renderTextWithPills(point, highlightTerms)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>


                      {/* Layer 3: Visuals & Takeaways */}
                      {topic.visuals && topic.visuals.length > 0 && (
                        <div className="mt-5">
                          <div className="mb-3 flex items-center gap-1.5 text-xs font-black text-blue-700">
                            <LuImage className="h-4 w-4" />
                            {isArabic ? 'الخوارزميات والجداول المهمة' : 'Key Algorithms & Tables'}
                          </div>
                          <div className="grid gap-4 lg:grid-cols-2">
                            {topic.visuals.map((visual) => (
                              <figure key={visual.imageSrc} className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50">
                                <a href={visual.imageSrc} target="_blank" rel="noreferrer" className="block bg-white p-2">
                                  <img
                                    src={visual.imageSrc}
                                    alt={`${visual.label}: ${visual.title[language]}`}
                                    loading="lazy"
                                    className="max-h-[520px] w-full object-contain"
                                  />
                                </a>
                                <figcaption className="flex items-start gap-2 border-t border-blue-100 p-3 text-xs font-bold leading-6 text-slate-600">
                                  <LuImage className={`mt-1 h-4 w-4 shrink-0 ${palette.icon}`} />
                                  <span>
                                    <span className="font-black text-slate-900">{visual.label}</span>
                                    {' - '}
                                    {renderHighlightedText(visual.title[language], highlightTerms)}
                                    {' '}
                                    <span className="text-slate-400" dir="ltr">(p. {visual.page})</span>
                                  </span>
                                </figcaption>
                                {visual.takeaways?.[language]?.length ? (
                                  <ul className="space-y-2 border-t border-blue-100 bg-white p-3">
                                    {visual.takeaways[language].map((item) => (
                                      <li key={item} className="flex gap-2 text-xs font-semibold leading-6 text-slate-700">
                                        <LuCircleCheck className={`mt-1 h-3.5 w-3.5 shrink-0 ${palette.icon}`} />
                                        <span>{renderTextWithPills(item, highlightTerms)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Layer 4: Official Text & Details (Collapsed) */}
                      {(topic.details && topic.details.length > 0) || topic.practiceNote ? (
                        <details className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 transition-all">
                          <summary className="cursor-pointer p-3 text-sm font-black text-blue-800 hover:bg-blue-50/80">
                            <span className="inline-flex items-center gap-2">
                              <LuFileText className="h-4 w-4" />
                              {isArabic ? 'تفاصيل سريرية إضافية وملاحظات' : 'Additional Clinical Details & Notes'}
                            </span>
                          </summary>
                          <div className="border-t border-blue-100 p-4">
                            {topic.practiceNote && (
                              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                                <div className="text-xs font-black text-blue-900">
                                  {isArabic ? 'ملاحظة تطبيقية' : 'Practice Note'}
                                </div>
                                <p className="mt-1 text-sm font-semibold leading-7 text-blue-950">
                                  {renderTextWithPills(topic.practiceNote[language], highlightTerms)}
                                </p>
                              </div>
                            )}
                            
                            {topic.details && topic.details.length > 0 && (
                              <div className="grid gap-3 lg:grid-cols-2">
                                {topic.details.map((block) => (
                                  <section key={block.title[language]} className={`rounded-xl border p-3 ${palette.detail}`}>
                                    <h3 className="text-sm font-black text-slate-900">
                                      {renderHighlightedText(block.title[language], highlightTerms)}
                                    </h3>
                                    <ul className="mt-2 space-y-2">
                                      {block.items[language].map((item) => (
                                        <li key={item} className="flex gap-2 text-sm font-semibold leading-7 text-slate-700">
                                          <LuFileText className={`mt-1.5 h-4 w-4 shrink-0 ${palette.icon}`} />
                                          <span>{renderTextWithPills(item, highlightTerms)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      ) : null}


                      <footer className="mt-4 border-t border-blue-50 pt-3">
                        <details>
                          <summary className="cursor-pointer text-xs font-black text-slate-500 marker:text-slate-400">
                            {isArabic ? 'المصادر المرتبطة' : 'Linked Sources'}
                          </summary>
                          <div className="mt-3 space-y-2">
                            {topic.sourceIds.map((sourceId) => {
                              const source = sourcesById.get(sourceId);
                              if (!source) return null;
                              return (
                                <div key={source.id} className="rounded-xl bg-blue-50/70 p-3">
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-black text-blue-700 hover:text-blue-900"
                                    dir="ltr"
                                  >
                                    <LuExternalLink className="h-4 w-4" />
                                    {renderHighlightedText(source.title, highlightTerms)}
                                  </a>
                                  <p className="mt-1 text-xs font-semibold leading-6 text-slate-500" dir="ltr">
                                    {renderHighlightedText(source.citation, highlightTerms)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      </footer>
                    </div>
                  </article>
                );
              })
            )}

            {collectionData?.recommendationDigest?.length ? (
              <section dir={localizedDirection} className={`rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-950/5 sm:p-5 ${localizedTextAlign}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 ring-1 ring-blue-100">
                      <LuFileText className="h-4 w-4" />
                      {isArabic ? 'النص الرسمي' : 'Official Text'}
                    </div>
                    <h2 className="mt-3 text-lg font-black leading-tight text-slate-950">
                      {isArabic ? `توصيات ${selectedCollection?.school ?? ''} الأصلية للمراجعة` : `Original ${selectedCollection?.school ?? ''} Recommendations for Review`}
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm font-semibold leading-7 text-slate-600">
                      {isArabic
                        ? selectedCollectionId.startsWith('gina')
                          ? `استخدم هذا الجزء عند الحاجة لمراجعة صور صفحات الدليل الأصلي كما وردت في ${selectedCollection?.school ?? ''}. الملخص العملي موجود بالأعلى، وهذا الجزء للتوثيق والمراجعة الدقيقة.`
                          : `استخدم هذا الجزء عند الحاجة لمراجعة نص التوصية الأصلي كما ورد في ${selectedCollection?.school ?? ''}، مع رقم التوصية، درجة الدليل، ورقم الصفحة. الملخص العملي موجود بالأعلى، وهذا الجزء للتوثيق والمراجعة الدقيقة.`
                        : selectedCollectionId.startsWith('gina')
                          ? `Use this section when you need to review the original pages from the ${selectedCollection?.school ?? ''} report. The practical digest is above; this section is for source-level review.`
                          : `Use this section when you need the original ${selectedCollection?.school ?? ''} recommendation text, with recommendation number, evidence grade, and page. The practical digest is above; this section is for source-level review.`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    <span dir="ltr">
                      {filteredSourceDigests.length} {isArabic ? 'فصل' : 'chapters'} · {filteredRecommendationCount > 0 ? `${filteredRecommendationCount} ${isArabic ? 'توصية' : 'recommendations'}` : `${filteredSourceDigests.reduce((acc, d) => acc + (d.tablesAndFigures?.length || 0), 0)} ${isArabic ? 'صفحة رسمية' : 'official pages'}`}
                    </span>
                  </div>
                </div>

                {filteredSourceDigests.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-5 text-sm font-bold text-slate-500">
                    {isArabic ? 'لا توجد توصيات مصدر مطابقة للبحث الحالي.' : 'No source recommendations match the current search.'}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {filteredSourceDigests.map((digest) => {
                      const source = sourcesById.get(digest.sourceId);
                      return (
                        <details key={digest.sourceId} className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/70">
                          <summary dir="ltr" className={`cursor-pointer p-3 marker:text-blue-400 ${englishTextClass}`}>
                            <span className="inline-flex flex-wrap items-center justify-start gap-2 text-sm font-black text-slate-900">
                              <LuBookOpen className="h-4 w-4 text-blue-600" />
                              <span>{renderHighlightedText(digest.title, highlightTerms)}</span>
                              <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                                {digest.recommendations.length > 0 
                                  ? `${digest.recommendations.length} ${isArabic ? 'توصية' : 'recommendations'}` 
                                  : `${digest.tablesAndFigures?.length || 0} ${isArabic ? 'صفحة رسمية' : 'official pages'}`}
                              </span>
                            </span>
                          </summary>
                          <div className="border-t border-blue-100 bg-white p-3">
                            {source && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mb-3 inline-flex items-center gap-2 text-xs font-black text-blue-700 hover:text-blue-900"
                                dir="ltr"
                              >
                                <LuExternalLink className="h-4 w-4" />
                                {renderHighlightedText(source.citation, highlightTerms)}
                              </a>
                            )}

                            {digest.recommendations.length > 0 && (
                              <ol dir="ltr" className={`space-y-2 ${englishTextClass}`}>
                                {digest.recommendations.map((recommendation) => (
                                  <li key={`${digest.sourceId}-${recommendation.id}`} className="rounded-xl border border-blue-50 bg-blue-50/60 p-3 text-left">
                                    <div className="flex flex-wrap items-center justify-start gap-2 text-xs font-black text-blue-700">
                                      <span className="rounded-md bg-blue-700 px-2 py-1 text-white">{recommendation.id}</span>
                                      <span>Grade {recommendation.grade}</span>
                                      <span>p. {recommendation.page}</span>
                                    </div>
                                    <p className={`mt-2 text-sm font-semibold leading-7 text-slate-700 ${englishTextClass}`}>
                                      {renderHighlightedText(recommendation.text, highlightTerms)}
                                    </p>
                                  </li>
                                ))}
                              </ol>
                            )}

                            {digest.tablesAndFigures?.length > 0 && (
                              <div className="mt-4 space-y-4 border-t border-blue-100 pt-4">
                                {digest.tablesAndFigures.map((item) => (
                                  <figure key={`${digest.sourceId}-${item.id}`} className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50">
                                    <a href={item.imageSrc} target="_blank" rel="noreferrer" className="block bg-white p-1">
                                      <img
                                        src={item.imageSrc}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full object-contain"
                                      />
                                    </a>
                                  </figure>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null}

            {/* Official Sources & References */}
            {selectedCollection && (
              <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-950/5">
                <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-blue-900">
                    <LuBookOpen className="h-5 w-5 text-blue-600" />
                    {isArabic ? 'المصادر والمراجع الرسمية' : 'Official Sources & References'}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {selectedCollection.school} {selectedCollection.year} — {selectedCollection.sourceDate}
                  </p>
                </div>
                <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedCollection.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      dir="ltr"
                      className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/30 p-3 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <LuExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span>{source.title}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
            </>
          )}
          </main>
        </section>
      </div>
    </div>
  );
};
