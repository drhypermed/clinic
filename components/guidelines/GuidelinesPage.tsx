import React, { useMemo, useState } from 'react';
import {
  LuBookOpen,
  LuCalendar,
  LuCircleCheck,
  LuExternalLink,
  LuFileText,
  LuImage,
  LuLanguages,
  LuSearch,
  LuShieldCheck,
  LuSparkles,
} from 'react-icons/lu';
import {
  GUIDELINE_COLLECTIONS,
  GUIDELINE_GROUP_LABELS,
  type GuidelineCollection,
  type GuidelineLanguage,
  type GuidelineSourceDigest,
  type GuidelineTopic,
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

const clinicalRegex = /((?:<|>|>=|<=)?\s*\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?(?:-\d+(?:\.\d+)?)?\s*(?:%|mg\/dL|mmHg|mmol\/L|kg\/m2|units(?:\/dose)?|g|h|m2|kg|mL\/min\/1\.73\s*m2|hours|weeks|months|years|days|أشهر|شهر|أسابيع|أسبوع|أيام|يوم|ساعات|ساعة|سنة|سنوات|مرات|مرة)|(?:<|>|>=|<=)\s*\d+(?:\.\d+)?|\b\d+\/\d+\b|\b\d+-\d+\b)/gi;

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
  const [selectedCollectionId, setSelectedCollectionId] = useState(GUIDELINE_COLLECTIONS[0]?.id ?? '');
  const [selectedGroup, setSelectedGroup] = useState<GuidelineTopic['group']>('populationCare');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCollection = useMemo(
    () => GUIDELINE_COLLECTIONS.find((item) => item.id === selectedCollectionId) ?? GUIDELINE_COLLECTIONS[0],
    [selectedCollectionId],
  );

  const query = normalizeSearchText(searchTerm);
  const highlightTerms = useMemo(() => buildHighlightTerms(searchTerm), [searchTerm]);

  const filteredTopics = useMemo(() => {
    if (!selectedCollection) return [];
    return selectedCollection.topics.filter((topic) => {
      if (topic.group !== selectedGroup) return false;
      if (!query) return true;
      return buildTopicSearchText(topic, selectedCollection).includes(query);
    });
  }, [query, selectedCollection, selectedGroup]);

  const selectedGroupTopicCount = useMemo(
    () => selectedCollection?.topics.filter((topic) => topic.group === selectedGroup).length ?? 0,
    [selectedCollection, selectedGroup],
  );

  const sourcesById = useMemo(() => {
    const entries = selectedCollection?.sources.map((source) => [source.id, source] as const) ?? [];
    return new Map(entries);
  }, [selectedCollection]);

  const groupSourceIds = useMemo(() => {
    if (!selectedCollection) return null;
    return new Set(
      selectedCollection.topics
        .filter((topic) => topic.group === selectedGroup)
        .flatMap((topic) => [
          ...topic.sourceIds,
          ...(topic.visuals?.map((visual) => visual.sourceId) ?? []),
        ]),
    );
  }, [selectedCollection, selectedGroup]);

  const filteredSourceDigests = useMemo(() => {
    if (!selectedCollection?.recommendationDigest) return [];
    return selectedCollection.recommendationDigest.filter((digest) => {
      if (groupSourceIds && !groupSourceIds.has(digest.sourceId)) return false;
      if (!query) return true;
      return buildSourceDigestSearchText(digest, selectedCollection).includes(query);
    });
  }, [groupSourceIds, query, selectedCollection]);

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
  const groups: GuidelineTopic['group'][] = [
    'populationCare',
    'diagnosisClassification',
    'preventionEvaluation',
    'behaviorsGoalsTech',
    'weightPharmacology',
    'complicationsRisk',
    'specialPopulations',
  ];

  if (!selectedCollection) {
    return null;
  }

  const selectedGroupLabel = GUIDELINE_GROUP_LABELS[selectedGroup][language];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0,#f8fafc_42%,#eef6ff_100%)]" dir={localizedDirection}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-950/10">
          <div>
            <div className="bg-gradient-to-br from-blue-950 via-blue-800 to-sky-700 p-4 text-white sm:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1.5 text-xs font-black text-blue-50 ring-1 ring-white/20">
                  <LuBookOpen className="h-4 w-4" />
                  {isArabic ? 'مكتبة الجايدلاينز' : 'Guidelines Library'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1.5 text-xs font-black text-blue-50 ring-1 ring-white/20">
                  <LuShieldCheck className="h-4 w-4" />
                  {isArabic ? 'ملخص موثق بالمصادر' : 'Source-linked digest'}
                </span>
              </div>

              <h1 dir={localizedDirection} className={`text-2xl font-black leading-tight text-white sm:text-3xl ${localizedTextAlign}`}>
                {renderHighlightedText(selectedCollection.title[language], highlightTerms)}
              </h1>
              <p dir={localizedDirection} className={`mt-3 max-w-3xl text-sm font-semibold leading-7 text-blue-50/90 sm:text-base ${localizedTextAlign}`}>
                {renderHighlightedText(selectedCollection.subtitle[language], highlightTerms)}
              </p>

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
            </div>

            <aside className="max-h-72 overflow-y-auto border-t border-blue-100 bg-blue-50/80 p-4 text-slate-900">
              <div className="text-xs font-black uppercase text-blue-700">
                {isArabic ? 'مهم قبل الاستخدام' : 'Before clinical use'}
              </div>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">
                {isArabic
                  ? 'هذا القسم عبارة عن منصة بحثية ومساعد علمي تدريبي للأطباء والممارسين الصحيين، يجمع ويلخص الأدلة الإرشادية العالمية من مصادرها الرسمية المعتمدة (مثل ADA, AHA, ESC, GINA وغيرها). هذا التلخيص التفاعلي مُصمم لتسهيل الوصول السريع للمعلومة ولا يُغني إطلاقاً عن تقدير الطبيب السريري الشخصي، ولا يحل محل النسخ الكاملة والأدلة الأصلية الصادرة عن الهيئات المختصة. اتخاذ قرار العلاج والتشخيص النهائي والرجوع للمصادر يقع بالكامل على عاتق الطبيب المعالج.'
                  : 'This section serves as a clinical reference and educational study aid for healthcare professionals, consolidating and summarizing international guidelines from official authoritative bodies (e.g., ADA, AHA, ESC, GINA). These interactive digests are designed to facilitate quick reference and must not substitute for the full official text or the physician’s independent clinical judgment. The treating physician bears sole responsibility for final diagnosis, treatment decisions, and primary source verification.'}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCollection.sources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="flex items-start justify-start gap-2 rounded-xl border border-blue-100 bg-white p-3 text-left text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <LuExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{source.title}</span>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-xl shadow-blue-950/10 lg:sticky lg:top-4 lg:self-start">
            <div className="space-y-4">
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

              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-500">
                  <LuLanguages className="h-4 w-4" />
                  {isArabic ? 'اللغة' : 'Language'}
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-blue-50 p-1 ring-1 ring-blue-100">
                  {(['ar', 'en'] as GuidelineLanguage[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      dir={getLanguageDirection(item)}
                      className={`rounded-md px-3 py-2 text-xs font-black transition ${
                        language === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-blue-800'
                      }`}
                    >
                      {languageLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-black text-slate-500">
                  {isArabic ? 'المدرسة والسنة' : 'School and Year'}
                </div>
                <div className="space-y-2">
                  {GUIDELINE_COLLECTIONS.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => setSelectedCollectionId(collection.id)}
                      dir={localizedDirection}
                      className={`w-full rounded-lg border px-3 py-2.5 text-start transition ${
                        collection.id === selectedCollection.id
                          ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-sky-50 text-blue-900 shadow-sm'
                          : 'border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <span className="block text-sm font-black">{collection.school} {collection.year}</span>
                      <span className="block text-xs font-semibold text-slate-500">{collection.title[language]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-black text-slate-500">
                  {isArabic ? 'نوع المحتوى' : 'Content Type'}
                </div>
                <div className="space-y-1.5">
                  {groups.map((group) => {
                    const active = selectedGroup === group;
                    const palette = getTopicPalette(group);
                    const label = GUIDELINE_GROUP_LABELS[group][language];
                    const count = selectedCollection.topics.filter((topic) => topic.group === group).length;
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
            </div>
          </aside>

          <main className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-xl shadow-blue-950/5">
              <div className="border-b border-blue-50 bg-gradient-to-r from-blue-50 to-white p-4">
                <div className="text-xs font-black uppercase text-blue-700">
                  {isArabic ? 'التقسيم الحالي' : 'Current Section'}
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-950">
                    {renderHighlightedText(selectedGroupLabel, highlightTerms)}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(filteredTopics.flatMap((topic) => topic.tags))).slice(0, 6).map((tag) => (
                      <span key={tag} className="rounded-lg bg-white px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                        {renderHighlightedText(tag, highlightTerms)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-2 p-4 sm:grid-cols-4">
                <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="text-xs font-black text-blue-700">{isArabic ? 'موضوعات عملية' : 'Practical Topics'}</div>
                  <div className="mt-1 text-xl font-black text-slate-950" dir="ltr">{filteredTopics.length}/{selectedGroupTopicCount}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="text-xs font-black text-blue-700">{isArabic ? 'توصيات رسمية' : 'Official Recommendations'}</div>
                  <div className="mt-1 text-xl font-black text-slate-950" dir="ltr">{filteredRecommendationCount}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="text-xs font-black text-blue-700">{isArabic ? 'صور داعمة' : 'Supporting Visuals'}</div>
                  <div className="mt-1 text-xl font-black text-slate-950" dir="ltr">{filteredVisualCount}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="text-xs font-black text-blue-700">{isArabic ? 'فصول مصدرية' : 'Source Chapters'}</div>
                  <div className="mt-1 text-xl font-black text-slate-950" dir="ltr">{filteredSourceDigests.length}</div>
                </div>
              </div>
              {filteredTopics.length > 0 && (
                <div className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-t border-blue-100 bg-white/95 px-4 py-3 backdrop-blur shadow-sm">
                  <div className="flex shrink-0 items-center text-xs font-black text-slate-500 mr-2 rtl:ml-2 rtl:mr-0">
                    {isArabic ? 'انتقال سريع:' : 'Jump to:'}
                  </div>
                  {filteredTopics.map((topic) => (
                    <a
                      key={topic.id}
                      href={`#${topic.id}`}
                      className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 ring-1 ring-blue-200 transition hover:bg-blue-600 hover:text-white"
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

                      {/* Layer 2: Quick Decision */}
                      {topic.quickDecision && (
                        <div className="mt-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 ring-1 ring-amber-200/60 shadow-sm">
                          <div className="mb-3 flex items-center gap-2 text-sm font-black text-amber-900">
                            <LuShieldCheck className="h-5 w-5 text-amber-600" />
                            {isArabic ? 'قرار سريع (Cheat Sheet)' : 'Quick Decision'}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {topic.quickDecision.when && (
                              <div className="rounded-xl border border-amber-100/80 bg-white/80 p-3 shadow-sm">
                                <div className="mb-1 text-xs font-black text-amber-800">{isArabic ? 'متى؟' : 'When?'}</div>
                                <div className="text-sm font-bold text-slate-800">{renderTextWithPills(topic.quickDecision.when[language], highlightTerms)}</div>
                              </div>
                            )}
                            {topic.quickDecision.start && (
                              <div className="rounded-xl border border-emerald-100/80 bg-white/80 p-3 shadow-sm">
                                <div className="mb-1 text-xs font-black text-emerald-800">{isArabic ? 'أبدأ بإيه؟' : 'Start with?'}</div>
                                <div className="text-sm font-bold text-slate-800">{renderTextWithPills(topic.quickDecision.start[language], highlightTerms)}</div>
                              </div>
                            )}
                            {topic.quickDecision.followUp && (
                              <div className="rounded-xl border border-blue-100/80 bg-white/80 p-3 shadow-sm">
                                <div className="mb-1 text-xs font-black text-blue-800">{isArabic ? 'أتابع إمتى؟' : 'Follow up?'}</div>
                                <div className="text-sm font-bold text-slate-800">{renderTextWithPills(topic.quickDecision.followUp[language], highlightTerms)}</div>
                              </div>
                            )}
                            {topic.quickDecision.warn && (
                              <div className="rounded-xl border border-red-100/80 bg-white/80 p-3 shadow-sm">
                                <div className="mb-1 text-xs font-black text-red-800">{isArabic ? 'أحذر إمتى؟' : 'Warn/Refer?'}</div>
                                <div className="text-sm font-bold text-slate-800">{renderTextWithPills(topic.quickDecision.warn[language], highlightTerms)}</div>
                              </div>
                            )}
                            {topic.quickDecision.customBlocks?.map((block, i) => {
                              const colorStyles = {
                                amber: 'border-amber-100/80 text-amber-800',
                                emerald: 'border-emerald-100/80 text-emerald-800',
                                blue: 'border-blue-100/80 text-blue-800',
                                red: 'border-red-100/80 text-red-800',
                                purple: 'border-purple-100/80 text-purple-800',
                                slate: 'border-slate-100/80 text-slate-800',
                              }[block.color || 'slate'];
                              const [borderClass, textClass] = (colorStyles || 'border-slate-100/80 text-slate-800').split(' ');

                              return (
                                <div key={i} className={`rounded-xl border ${borderClass} bg-white/80 p-3 shadow-sm`}>
                                  <div className={`mb-1 text-xs font-black ${textClass}`}>{renderHighlightedText(block.title[language], highlightTerms)}</div>
                                  <div className="text-sm font-bold text-slate-800">{renderTextWithPills(block.content[language], highlightTerms)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

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

            {selectedCollection.recommendationDigest?.length ? (
              <section dir={localizedDirection} className={`rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-950/5 sm:p-5 ${localizedTextAlign}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 ring-1 ring-blue-100">
                      <LuFileText className="h-4 w-4" />
                      {isArabic ? 'النص الرسمي' : 'Official Text'}
                    </div>
                    <h2 className="mt-3 text-lg font-black leading-tight text-slate-950">
                      {isArabic ? 'توصيات ADA الأصلية للمراجعة' : 'Original ADA Recommendations for Review'}
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm font-semibold leading-7 text-slate-600">
                      {isArabic
                        ? 'استخدم هذا الجزء عند الحاجة لمراجعة نص التوصية الأصلي كما ورد في ADA، مع رقم التوصية، درجة الدليل، ورقم الصفحة. الملخص العملي موجود بالأعلى، وهذا الجزء للتوثيق والمراجعة الدقيقة.'
                        : 'Use this section when you need the original ADA recommendation text, with recommendation number, evidence grade, and page. The practical digest is above; this section is for source-level review.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    <span dir="ltr">
                      {filteredSourceDigests.length} {isArabic ? 'فصل' : 'chapters'} · {filteredRecommendationCount} {isArabic ? 'توصية' : 'recommendations'}
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
                                {digest.recommendations.length} {isArabic ? 'توصية' : 'recommendations'}
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
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null}

          </main>
        </section>
      </div>
    </div>
  );
};
