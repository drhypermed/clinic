import type { GuidelineCollection, GuidelineLanguage } from './guidelinesData';
import type {
  GuidelineChatResponseMode,
  GuidelineChatScope,
  GuidelineSearchAdminDiagnostics,
  GuidelineChatSourceChunk,
} from './guidelineChatSearch';

export type ChatRole = 'assistant' | 'user';
export type EvidenceConfidence = 'strong' | 'medium' | 'weak';

export type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: {
    results: ArrayLike<{
      isFinal: boolean;
      0: { transcript: string };
    }>;
  }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onstart?: (() => void) | null;
  onspeechstart?: (() => void) | null;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: GuidelineChatSourceChunk[];
  adminDiagnostics?: GuidelineSearchAdminDiagnostics[];
  confidence?: EvidenceConfidence;
  confidenceSummary?: string;
  status?: 'thinking' | 'streaming' | 'error';
};

const compactText = (value: string, max = 900) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

export const normalizeLoose = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export const isSmallTalk = (question: string) => {
  const q = normalizeLoose(question);
  return /^(hi|hello|hey|thanks|thank you|ok|okay|تمام|تسلم|شكرا|شكر|اهلا|هاي|حاضر|ماشي|جميل|كويس)$/.test(q);
};

export const buildSmallTalkReply = (question: string, language: GuidelineLanguage) => {
  const q = normalizeLoose(question);
  if (/(thanks|thank|شكرا|شكر|تسلم)/.test(q)) {
    return language === 'ar'
      ? 'العفو يا دكتور. ابعتلي الحالة أو السؤال اللي بعده ونكمل على نفس السياق.'
      : 'You are welcome. Send the next clinical question and I will keep the same context.';
  }
  return language === 'ar'
    ? 'تمام يا دكتور، معاك. اسألني في النقطة اللي عايزها أو قول لي نكمل على آخر إجابة.'
    : 'Sure, doctor. Ask the next point or tell me to continue from the last answer.';
};

export const isFollowUpQuestion = (question: string) => {
  const q = normalizeLoose(question);
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  const populationOnlyFollowUp = /^(what about |in |for )?(children|child|pediatric|paediatric|pregnancy|pregnant|elderly|adults|adult|renal|kidney|liver|hepatic)\??$/.test(q)
    || /^(طب )?(الأطفال|الاطفال|الحمل|الحوامل|كبار السن|الكبار|البالغين|الكلى|الكبد)\??$/.test(q);
  const followUpTokens = [
    'وضح', 'اشرح', 'يعني', 'ليه', 'ازاي', 'طب', 'كمل', 'اختصر', 'مثال', 'عمليا',
    'فين', 'المصدر', 'مصدر', 'الجرعه', 'الجرعة', 'الجرعات', 'موانع', 'الحمل', 'الاطفال',
    'الأطفال', 'كبار السن', 'البديل', 'بديل', 'متى', 'امتى', 'كم', 'الاعراض',
    'الأعراض', 'اسماء تجارية', 'اسماء تجاريه', 'الاسماء التجارية', 'الأسماء التجارية',
    'ادوية', 'أدوية', 'ادويه', 'أدويه', 'why', 'how', 'explain',
    'continue', 'summarize', 'dose', 'doses', 'table', 'exceptions', 'source', 'reference',
    'citation', 'trade names', 'brand names', 'brands'
  ];

  if (populationOnlyFollowUp && wordCount <= 4) return true;
  if (followUpTokens.some((token) => q.includes(normalizeLoose(token)))) return true;
  return false;
};

const commonAnchorStopWords = new Set([
  'with', 'from', 'what', 'when', 'where', 'which', 'dose', 'table', 'source', 'children', 'child',
  'adult', 'adults', 'years', 'year', 'old', 'patient', 'case', 'doctor', 'guideline', 'explain',
]);

const extractContextAnchors = (value: string) => {
  const rawLatin = value.match(/\b[A-Za-z][A-Za-z0-9-]{2,}\b/g) || [];
  const acronyms = value.match(/\b[A-Z]{2,8}\b/g) || [];
  return Array.from(new Set([...rawLatin, ...acronyms]
    .map((token) => token.toLowerCase())
    .filter((token) => !commonAnchorStopWords.has(token))));
};

const hasContextualWording = (question: string) => {
  const q = normalizeLoose(question);
  const hasArabicContext = [
    'ده', 'دي', 'دا', 'ذلك', 'نفس', 'السابق', 'اللي فوق', 'الكلام ده', 'الحالة دي',
  ].some((token) => q.includes(normalizeLoose(token)));
  const hasEnglishContext = /\b(this|that|it|same|above|previous|the case|the patient)\b/.test(q);
  return hasArabicContext || hasEnglishContext;
};

const hasDoseEllipsis = (question: string) => {
  const q = normalizeLoose(question);
  return /(جرعته|جرعتها|جرعتة|جرعه|جرعة|الجرعه|الجرعة)/.test(q)
    || /\b(dose|dosage)\b/.test(q);
};

const hasAgeOrPopulationRefinement = (question: string) => {
  const q = normalizeLoose(question);
  return /\b(child|children|pediatric|paediatric|adult|adults|elderly|pregnant|pregnancy|years?|old)\b/.test(q)
    || /(طفل|اطفال|الأطفال|الاطفال|عمره|سنه|سنة|سنين|شهور|الحمل|حامل|الحوامل|كبار السن|البالغين)/.test(q);
};

const hasStandaloneClinicalSignal = (question: string) => {
  const q = normalizeLoose(question);
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  const hasEnglishClinicalTopic = /\b(asthma|copd|diabetes|dka|hhs|hypertension|blood pressure|ckd|aki|kidney|renal|liver|cirrhosis|heart failure|afib|atrial fibrillation|acs|stroke|sepsis|pneumonia|gout|thyroid|obesity|pregnancy|anemia|anaemia|infection|antibiotic|vaccine|vaccination)\b/.test(q);
  const hasEnglishClinicalAction = /\b(treat|treatment|manage|management|diagnosis|diagnose|criteria|dose|dosage|drug|medication|screen|monitor|follow up|contraindication|avoid)\b/.test(q);
  const arabicClinicalTopics = [
    '\u0631\u0628\u0648', '\u062d\u0633\u0627\u0633\u064a\u0629 \u0635\u062f\u0631', '\u0633\u0643\u0631', '\u0627\u0644\u0633\u0643\u0631',
    '\u0636\u063a\u0637', '\u0627\u0644\u0636\u063a\u0637', '\u0636\u063a\u0637 \u0627\u0644\u062f\u0645',
    '\u0643\u0644\u0649', '\u0627\u0644\u0643\u0644\u0649', '\u0643\u0644\u0648\u064a', '\u0643\u0628\u062f', '\u0627\u0644\u0643\u0628\u062f',
    '\u0642\u0644\u0628', '\u0627\u0644\u0642\u0644\u0628', '\u062c\u0644\u0637\u0629', '\u062d\u0645\u0644', '\u0627\u0644\u062d\u0645\u0644',
    '\u062d\u0627\u0645\u0644', '\u0627\u0644\u062d\u0648\u0627\u0645\u0644', '\u0627\u0646\u064a\u0645\u064a\u0627', '\u0627\u0644\u062a\u0647\u0627\u0628',
    '\u0639\u062f\u0648\u0649', '\u0645\u0636\u0627\u062f \u062d\u064a\u0648\u064a', '\u0644\u0642\u0627\u062d', '\u062a\u0637\u0639\u064a\u0645',
    '\u063a\u062f\u0629', '\u0633\u0645\u0646\u0629', '\u0646\u0642\u0631\u0633',
  ];
  const arabicClinicalActions = [
    '\u0639\u0644\u0627\u062c', '\u0627\u0639\u0627\u0644\u062c', '\u0627\u062a\u0639\u0627\u0645\u0644', '\u062a\u0639\u0627\u0645\u0644',
    '\u062a\u0634\u062e\u064a\u0635', '\u0645\u0639\u0627\u064a\u064a\u0631', '\u062c\u0631\u0639\u0629', '\u062c\u0631\u0639\u0647',
    '\u0627\u062f\u0648\u064a\u0629', '\u0623\u062f\u0648\u064a\u0629', '\u062f\u0648\u0627\u0621', '\u0645\u0648\u0627\u0646\u0639',
    '\u0645\u0645\u0646\u0648\u0639', '\u0645\u062a\u0627\u0628\u0639\u0629', '\u0627\u0639\u0631\u0627\u0636', '\u0623\u0639\u0631\u0627\u0636',
  ];
  const hasArabicTopic = arabicClinicalTopics.some((token) => q.includes(normalizeLoose(token)));
  const hasArabicAction = arabicClinicalActions.some((token) => q.includes(normalizeLoose(token)));
  return hasEnglishClinicalTopic
    || (hasEnglishClinicalAction && wordCount >= 3)
    || hasArabicTopic
    || hasArabicAction;
};

const hasHighValueGuidelineSignal = (question: string) => {
  const q = normalizeLoose(question);
  return /\b(dose|dosage|mg|units?|contraindication|avoid|emergency|acute|severe|shock|bleeding|dka|hhs|hyperkalemia|pregnan|child|children|pediatric|paediatric|neonate|infant|elderly|renal|kidney|hepatic|liver|compare|versus|vs)\b/.test(q)
    || [
      '\u062c\u0631\u0639\u0629', '\u062c\u0631\u0639\u0647', '\u0645\u0645\u0646\u0648\u0639', '\u0645\u0648\u0627\u0646\u0639',
      '\u062d\u0627\u062f', '\u0637\u0648\u0627\u0631\u0626', '\u0646\u0632\u064a\u0641', '\u0635\u062f\u0645\u0629',
      '\u062d\u0645\u0644', '\u062d\u0627\u0645\u0644', '\u0627\u0644\u062d\u0648\u0627\u0645\u0644',
      '\u0637\u0641\u0644', '\u0627\u0637\u0641\u0627\u0644', '\u0627\u0644\u0623\u0637\u0641\u0627\u0644',
      '\u0643\u0644\u0649', '\u0643\u0644\u0648\u064a', '\u0643\u0628\u062f', '\u0643\u0628\u062f\u064a',
      '\u0642\u0627\u0631\u0646', '\u0645\u0642\u0627\u0631\u0646\u0629', '\u0641\u0631\u0642',
    ].some((token) => q.includes(normalizeLoose(token)));
};

const hasAnchorInPreviousSources = (anchors: string[], previousSources: GuidelineChatSourceChunk[]) => {
  if (!anchors.length) return true;
  const previousText = normalizeLoose(previousSources
    .slice(0, 6)
    .map((source) => [
      source.fileTitle,
      source.sourceTitle,
      source.heading,
      source.school,
      source.text?.slice(0, 1200),
    ].filter(Boolean).join(' '))
    .join(' '));
  return anchors.some((anchor) => previousText.includes(normalizeLoose(anchor)));
};

export const shouldUseConversationContext = ({
  question,
  previousSources,
}: {
  question: string;
  previousSources: GuidelineChatSourceChunk[];
}) => {
  if (previousSources.length === 0) return false;

  const anchors = extractContextAnchors(question);
  const anchorFoundInPreviousSources = hasAnchorInPreviousSources(anchors, previousSources);
  const standaloneClinicalSignal = hasStandaloneClinicalSignal(question);

  if (anchors.length > 0 && !anchorFoundInPreviousSources && !hasContextualWording(question)) {
    return false;
  }

  if (standaloneClinicalSignal && !hasContextualWording(question) && (anchors.length === 0 || !anchorFoundInPreviousSources)) {
    return false;
  }

  // Treat short anchorless questions as follow-ups only when they look elliptical.
  if (anchors.length === 0 && question.split(/\s+/).filter(Boolean).length <= 7) {
    return hasContextualWording(question)
      || hasDoseEllipsis(question)
      || isFollowUpQuestion(question)
      || hasAgeOrPopulationRefinement(question);
  }

  if (hasDoseEllipsis(question)) return true;
  if (isFollowUpQuestion(question)) return true;
  if (hasContextualWording(question)) return true;
  if (hasAgeOrPopulationRefinement(question) && anchors.length === 0) return true;

  return anchors.length > 0 && anchorFoundInPreviousSources;
};

export const shouldReusePreviousSourcesForAnswer = ({
  question,
  previousSources,
}: {
  question: string;
  previousSources: GuidelineChatSourceChunk[];
}) => {
  if (previousSources.length === 0) return false;
  if (!shouldUseConversationContext({ question, previousSources })) return false;
  if (hasStandaloneClinicalSignal(question) && !hasContextualWording(question)) return false;
  return hasContextualWording(question)
    || hasDoseEllipsis(question)
    || isFollowUpQuestion(question)
    || hasAgeOrPopulationRefinement(question);
};

export const shouldUseModelReformulation = ({
  question,
  previousSources,
}: {
  question: string;
  previousSources: GuidelineChatSourceChunk[];
}) => {
  const anchors = extractContextAnchors(question);
  const wordCount = question.split(/\s+/).filter(Boolean).length;

  if (hasHighValueGuidelineSignal(question)) {
    return true;
  }

  if (previousSources.length === 0) return false;

  const anchorFoundInPreviousSources = hasAnchorInPreviousSources(anchors, previousSources);

  if (anchors.length === 0 && !hasStandaloneClinicalSignal(question) && wordCount <= 7) {
    return true;
  }

  if (anchors.length > 0 && !anchorFoundInPreviousSources && hasContextualWording(question)) {
    return true;
  }

  return wordCount <= 3 && hasContextualWording(question);
};

export const shouldRetryGuidelineSearchWithModel = ({
  question,
  sources,
  alreadyReformulated,
}: {
  question: string;
  sources: GuidelineChatSourceChunk[];
  alreadyReformulated: boolean;
}) => {
  if (alreadyReformulated) return false;
  const primarySources = sources.filter((source) => !source.contextOnly);
  const topScore = Math.max(0, ...sources.map((source) => Number(source.score || 0)));

  if (sources.length === 0) return true;
  if (primarySources.length === 0) return true;
  if (topScore < 55) return true;
  if (hasHighValueGuidelineSignal(question) && (primarySources.length < 2 || topScore < 110)) return true;
  return false;
};

export const shouldPreferSearchRetrySources = (
  retrySources: GuidelineChatSourceChunk[],
  currentSources: GuidelineChatSourceChunk[],
) => {
  if (retrySources.length === 0) return false;
  if (currentSources.length === 0) return true;
  const retryTopScore = Math.max(0, ...retrySources.map((source) => Number(source.score || 0)));
  const currentTopScore = Math.max(0, ...currentSources.map((source) => Number(source.score || 0)));
  const retryPrimaryCount = retrySources.filter((source) => !source.contextOnly).length;
  const currentPrimaryCount = currentSources.filter((source) => !source.contextOnly).length;
  return retryPrimaryCount > currentPrimaryCount || retryTopScore >= currentTopScore + 15;
};

const wantsCurrentFileScope = (question: string) => {
  const q = normalizeLoose(question);
  return [
    'الملف الحالي',
    'المصدر الحالي',
    'الكتاب الحالي',
    'الصفحه دي',
    'الصفحة دي',
    'في الملف ده',
    'من المصدر ده',
    'current file',
    'this file',
    'this source',
    'selected file',
  ].some((token) => q.includes(normalizeLoose(token)));
};

const wantsCurrentGuidelineScope = (question: string) => {
  const q = normalizeLoose(question);
  return [
    'الاصدار الحالي',
    'الإصدار الحالي',
    'الجايدلاين الحالي',
    'الكتاب ده',
    'current guideline',
    'this guideline',
    'this edition',
  ].some((token) => q.includes(normalizeLoose(token)));
};

export const isComparisonQuestion = (question: string) => {
  const q = normalizeLoose(question);
  return /\b(vs|versus|compare|difference|ada kdigo|kdigo ada|gina easl|easl gina)\b/.test(q)
    || ['فرق', 'قارن', 'مقارنة'].some((token) => q.includes(normalizeLoose(token)));
};

export const inferSearchScope = ({
  question,
  preferredScope,
  selectedSource,
  selectedCollection,
}: {
  question: string;
  preferredScope: GuidelineChatScope;
  selectedSource: GuidelineCollection['sources'][number] | null;
  selectedCollection: GuidelineCollection | null;
}): GuidelineChatScope => {
  if (isComparisonQuestion(question)) return 'all-guidelines';
  if (preferredScope === 'current-file' && selectedSource) return 'current-file';
  if (preferredScope === 'current-guideline' && selectedCollection) return 'current-guideline';
  if (selectedSource && wantsCurrentFileScope(question)) return 'current-file';
  if (selectedCollection && wantsCurrentGuidelineScope(question)) return 'current-guideline';
  return 'all-guidelines';
};

export const inferResponseMode = (question: string): GuidelineChatResponseMode => {
  const q = normalizeLoose(question);
  if (['جدول', 'table', 'compare table'].some((token) => q.includes(normalizeLoose(token)))) return 'table';
  if (['النص الرسمي', 'official wording', 'official text', 'quote'].some((token) => q.includes(normalizeLoose(token)))) return 'official';
  if (['اختصر', 'مختصر', 'brief', 'short', 'summary'].some((token) => q.includes(normalizeLoose(token)))) return 'concise';
  if (['اشرح', 'وضح', 'ليه', 'لماذا', 'why', 'explain', 'details'].some((token) => q.includes(normalizeLoose(token)))) return 'detailed';
  return 'clinical';
};

const findLastUserQuestion = (messages: ChatMessage[]) =>
  [...messages].reverse().find((message) => message.role === 'user')?.content || '';

export const findLastSources = (messages: ChatMessage[]) =>
  [...messages].reverse().find((message) => message.sources && message.sources.length > 0)?.sources || [];

export const buildContextualSearchQuery = ({
  question,
  messages,
  previousSources,
}: {
  question: string;
  messages: ChatMessage[];
  previousSources: GuidelineChatSourceChunk[];
}) => {
  if (!shouldUseConversationContext({ question, previousSources })) return question;
  const lastQuestion = findLastUserQuestion(messages);
  const sourceHints = previousSources
    .slice(0, 4)
    .map((source) => [source.sourceTitle, source.heading, source.school, source.year].filter(Boolean).join(' '))
    .join(' ');
  return [lastQuestion, question, sourceHints].filter(Boolean).join('\n');
};

export const buildCompactHistory = (messages: ChatMessage[]) =>
  messages
    .filter((message) => message.status !== 'thinking' && message.status !== 'streaming')
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: compactText(
        [
          message.content,
          message.sources?.length ? `Sources: ${message.sources.slice(0, 4).map((_, index) => `[S${index + 1}]`).join(', ')}` : '',
        ].filter(Boolean).join('\n'),
        message.role === 'assistant' ? 700 : 420,
      ),
    }));

export const assessEvidenceConfidence = ({
  sources,
  reusedPreviousSources,
  language,
}: {
  sources: GuidelineChatSourceChunk[];
  reusedPreviousSources: boolean;
  language: GuidelineLanguage;
}): { confidence: EvidenceConfidence; summary: string } => {
  const primarySources = sources.filter((source) => !source.contextOnly);
  const topScore = Math.max(0, ...sources.map((source) => Number(source.score || 0)));
  const distinctBooks = new Set(sources.map((source) => source.bookId || source.sourcePath || source.fileTitle || source.sourceTitle).filter(Boolean)).size;

  let confidence: EvidenceConfidence = 'weak';
  if (primarySources.length >= 2 && topScore >= 150) confidence = 'strong';
  else if (primarySources.length >= 1 && topScore >= 75) confidence = 'medium';
  if (reusedPreviousSources && confidence === 'strong') confidence = 'medium';

  const summary = language === 'ar'
    ? confidence === 'strong'
      ? `ثقة قوية: لقيت ${primarySources.length} مصادر مباشرة من ${distinctBooks || 1} ملف.`
      : confidence === 'medium'
        ? 'ثقة متوسطة: المصادر مفيدة، لكن راجع النص الأصلي قبل القرار العلاجي.'
        : 'ثقة ضعيفة: المصادر قليلة أو غير مباشرة، فاعتبر الإجابة إرشادية فقط.'
    : confidence === 'strong'
      ? `Strong confidence: ${primarySources.length} direct sources from ${distinctBooks || 1} file(s).`
      : confidence === 'medium'
        ? 'Medium confidence: useful sources, but check the original text before clinical decisions.'
        : 'Weak confidence: limited or indirect sources, so treat the answer as guidance only.';

  return { confidence, summary };
};

export const getSourceReason = (source: GuidelineChatSourceChunk, language: GuidelineLanguage) => {
  const tags = [...(source.intentTags || []), ...(source.concepts || [])].slice(0, 3);
  if (language === 'ar') {
    if (source.contextOnly) return 'سياق مجاور لفهم النص وترتيبه.';
    if (tags.length) return `اتختار لأنه مرتبط بـ ${tags.join(', ')}.`;
    if (source.heading) return `اتختار لأنه تحت عنوان: ${source.heading}.`;
    return 'اتختار لأنه من أعلى النتائج تطابقا مع السؤال.';
  }
  if (source.contextOnly) return 'Neighboring context used to preserve continuity.';
  if (tags.length) return `Selected because it matches: ${tags.join(', ')}.`;
  if (source.heading) return `Selected from heading: ${source.heading}.`;
  return 'Selected as one of the highest matching sources.';
};

export const getSpeechRecognitionFactory = () => {
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
