import type { GuidelineCollection, GuidelineLanguage } from './guidelinesData';
import type {
  GuidelineChatResponseMode,
  GuidelineChatScope,
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

  if (anchors.length > 0 && !anchorFoundInPreviousSources && !hasContextualWording(question)) {
    return false;
  }

  // Smart Rule: Treat short Arabic sentences with no English medical anchors as follow-ups
  if (anchors.length === 0 && question.split(/\s+/).filter(Boolean).length <= 7) {
    return true;
  }

  if (hasDoseEllipsis(question)) return true;
  if (isFollowUpQuestion(question)) return true;
  if (hasContextualWording(question)) return true;
  if (hasAgeOrPopulationRefinement(question) && anchors.length === 0) return true;

  return anchors.length > 0 && anchorFoundInPreviousSources;
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
