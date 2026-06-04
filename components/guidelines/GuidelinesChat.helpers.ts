import type { GuidelineLanguage } from './guidelinesData';
import type { GuidelineChatSourceChunk } from './guidelineChatSearch';
import { hasReliablePdfPageNumbers } from './guidelineSourceUtils';
import { isLegacyCorruptedWelcomeMessage, trimChatMessages } from '../../services/guidelineChatHistoryService';
import type { ChatMessage } from './guidelinesChatUtils';

const storageKey = 'drhyper-guidelines-chat-v7';

const getStorageKey = (uid?: string | null) => uid ? `${storageKey}:${uid}` : storageKey;

const cleanProfileText = (value?: string | null) => String(value || '').replace(/\s+/g, ' ').trim();

const cleanupGuidelinesChatStorage = () => {
  try {
    Object.keys(window.localStorage)
      .filter((key) => (
        key.startsWith('drhyper-guidelines-chat') &&
        key !== storageKey &&
        !key.startsWith(`${storageKey}:`)
      ))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Local storage can be unavailable in private browsing or strict browser settings.
  }
};

const getFailureText = (error: unknown) => {
  if (!error) return '';
  if (typeof error === 'string') return error.toLowerCase();
  const typed = error as { code?: unknown; details?: unknown; message?: unknown; name?: unknown };
  return [typed.code, typed.name, typed.message, typed.details]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ');
};

const explainAssistantFailure = (error: unknown, language: GuidelineLanguage) => {
  const text = getFailureText(error);
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const isArabic = language === 'ar';

  if (offline || text.includes('err_internet_disconnected') || text.includes('offline')) {
    return isArabic
      ? 'الإنترنت فاصل أو الجهاز مش قادر يوصل للسيرفر.'
      : 'The internet connection is offline or the device cannot reach the server.';
  }

  if (
    text.includes('aborted')
    || text.includes('aborterror')
    || text.includes('cancelled')
    || text.includes('canceled')
    || text.includes('deadline-exceeded')
    || text.includes('failed to fetch')
    || text.includes('load failed')
    || text.includes('network')
    || text.includes('timeout')
    || text.includes('unavailable')
  ) {
    return isArabic
      ? 'الاتصال بالسيرفر اتقطع أو كان بطيء أثناء توليد الرد.'
      : 'The server connection was interrupted or too slow while generating the answer.';
  }

  if (text.includes('unauthenticated')) {
    return isArabic
      ? 'جلسة تسجيل الدخول انتهت أو محتاجة تتحدث.'
      : 'The sign-in session expired or needs to be refreshed.';
  }

  if (text.includes('appcheck') || text.includes('app check') || text.includes('app attestation')) {
    return isArabic
      ? 'الاتصال الآمن بالتطبيق فشل مؤقتا. غالبا تحديث الصفحة يحله.'
      : 'The secure app connection failed temporarily. Refreshing the page usually fixes it.';
  }

  if (text.includes('permission-denied')) {
    return isArabic
      ? 'الحساب الحالي معندوش صلاحية كافية لتنفيذ الطلب ده.'
      : 'The current account does not have enough permission for this request.';
  }

  if (text.includes('resource-exhausted') || text.includes('daily_limit_reached')) {
    return isArabic
      ? 'تم استهلاك الحد المتاح لاستخدام المساعد دلوقتي.'
      : 'The current assistant usage limit has been reached.';
  }

  return isArabic
    ? 'حصل عطل مؤقت في توليد الرد.'
    : 'A temporary answer-generation failure occurred.';
};

export const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const writeStoredMessages = (messages: ChatMessage[], uid?: string | null) => {
  try {
    const persistableMessages = trimChatMessages(
      messages.filter(isStoredChatMessage).filter(isLocalPersistableChatMessage),
    );

    if (persistableMessages.length === 0) {
      clearStoredMessages(uid);
      return;
    }

    window.localStorage.setItem(getStorageKey(uid), JSON.stringify(persistableMessages));
  } catch {
    // Local storage remains a best-effort offline cache.
  }
};

export const clearStoredMessages = (uid?: string | null) => {
  try {
    const keys = new Set<string>([storageKey, getStorageKey(uid)]);
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('drhyper-guidelines-chat'))
      .forEach((key) => keys.add(key));
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Local storage remains a best-effort offline cache.
  }
};

export const getMessagesSignature = (messages: ChatMessage[]) => JSON.stringify(trimChatMessages(messages));

export const isOnlyWelcomeMessage = (messages: ChatMessage[]) =>
  messages.length === 1 && messages[0]?.id.startsWith('welcome-');

const isStoredChatMessage = (message: unknown): message is ChatMessage => {
  if (!message || typeof message !== 'object') return false;
  const item = message as Partial<ChatMessage>;
  return (
    (item.role === 'assistant' || item.role === 'user') &&
    typeof item.content === 'string' &&
    typeof item.createdAt === 'number'
  );
};

const isLocalPersistableChatMessage = (message: ChatMessage) =>
  !message.id.startsWith('welcome-')
  && message.status !== 'thinking'
  && message.status !== 'streaming'
  && !isLegacyCorruptedWelcomeMessage(message);

export const getContentDirection = (value: string) => {
  const arabicChars = (value.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (value.match(/[A-Za-z]/g) || []).length;
  return arabicChars > latinChars ? 'rtl' : 'ltr';
};

export const getContentAlignClass = (value: string) =>
  getContentDirection(value) === 'rtl' ? 'text-right' : 'text-left';

export const getSourceFileName = (source: GuidelineChatSourceChunk) =>
  source.fileTitle || source.sourceTitle || source.label || source.localFile || source.sourcePath || 'Guideline source';

export const getSourcePageLabel = (source: GuidelineChatSourceChunk) => {
  if (!hasReliablePdfPageNumbers(source)) return '';
  const start = source.pageStart || source.page || 0;
  const end = source.pageEnd || source.endPage || start;
  if (!start) return '';
  return end && end !== start ? `p. ${start}-${end}` : `p. ${start}`;
};

export const getSourcePreview = (source: GuidelineChatSourceChunk) => {
  const raw = [source.heading, source.text].filter(Boolean).join(' ');
  return raw.replace(/\s+/g, ' ').trim().split(' ').slice(0, 16).join(' ');
};

export const welcomeMessage = (
  language: GuidelineLanguage,
  doctorName?: string | null,
  doctorSpecialty?: string | null,
): ChatMessage => {
  const name = cleanProfileText(doctorName);
  const specialty = cleanProfileText(doctorSpecialty);
  const arabicName = name ? ` ${name}` : '';
  const arabicSpecialty = specialty || 'تخصصك';
  const englishName = name ? ` ${name}` : '';
  const englishSpecialty = specialty || 'your specialty';

  return {
    id: `welcome-${language}`,
    role: 'assistant',
    content: language === 'ar'
      ? `أهلا بك يا دكتور${arabicName}. جاهز أساعدك في أي سؤال في تخصص ${arabicSpecialty}. هبحث أولا في الجايدلاينز المرفوعة، ولو النقطة مش موجودة فيها بوضوح هكمل من مراجع ومعرفة طبية موثوقة خارج النص المرفوع، مع توضيح الفرق بين الكلام المدعوم بمصدر والكلام الاستدلالي.`
      : `Welcome, Dr.${englishName}. I am ready to help with clinical questions in ${englishSpecialty}. I will search the uploaded guidelines first; if the exact point is not clearly covered there, I will continue using trusted specialist medical knowledge outside the uploaded text and clearly separate sourced guidance from clinical reasoning.`,
    createdAt: Date.now(),
  };
};

export const readStoredMessages = (
  language: GuidelineLanguage,
  doctorName?: string | null,
  doctorSpecialty?: string | null,
  uid?: string | null,
): ChatMessage[] => {
  try {
    cleanupGuidelinesChatStorage();
    const keys = uid ? [getStorageKey(uid), storageKey] : [storageKey];
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      const cleaned = parsed.filter(isStoredChatMessage).filter(isLocalPersistableChatMessage);
      if (cleaned.length === 0) {
        window.localStorage.removeItem(key);
        continue;
      }
      const trimmed = trimChatMessages(cleaned);
      if (trimmed.length !== parsed.length) {
        window.localStorage.setItem(key, JSON.stringify(trimmed));
      }
      return trimmed;
    }
    return [welcomeMessage(language, doctorName, doctorSpecialty)];
  } catch {
    return [welcomeMessage(language, doctorName, doctorSpecialty)];
  }
};

export const getMessageTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(timestamp);

export const mergeRankedSources = (limit: number, ...groups: GuidelineChatSourceChunk[][]) => {
  const byKey = new Map<string, GuidelineChatSourceChunk>();
  for (const source of groups.flat()) {
    const key = source.id || `${source.sourcePath || source.localFile || source.fileTitle}:${source.chunkIndex || source.page || source.text.slice(0, 80)}`;
    const existing = byKey.get(key);
    if (!existing || Number(source.score || 0) > Number(existing.score || 0)) byKey.set(key, source);
  }
  return [...byKey.values()]
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, limit);
};

export const buildGuidelineSearchQueries = ({
  question,
  contextualQuery,
  followUp,
}: {
  question: string;
  contextualQuery: string;
  followUp: boolean;
}) => {
  const queries = new Set<string>();
  const add = (value: string) => {
    const query = value.replace(/\s+/g, ' ').trim();
    if (query.length >= 2) queries.add(query);
  };

  add(contextualQuery);
  add(question);
  if (followUp) add(`${contextualQuery}\n${question}`);

  const lower = question.toLowerCase();
  if (/\b(dose|dosage|mg|unit|units)\b|جرع/.test(lower)) {
    add(`${contextualQuery}\ndose dosage administration contraindications monitoring`);
  }
  if (/\b(child|children|pediatric|paediatric|pregnan|elderly|adult)\b|طفل|اطفال|الأطفال|الاطفال|الحمل|حامل|كبار السن/.test(lower)) {
    add(`${contextualQuery}\npopulation children pediatric pregnancy adult elderly`);
  }
  if (/\b(treat|treatment|management|protocol|algorithm|emergency|acute)\b|علاج|بروتوكول|اتعامل|تعامل|حاد|طوارئ/.test(lower)) {
    add(`${contextualQuery}\nmanagement treatment protocol algorithm emergency monitoring`);
  }
  if (/\b(diagnosis|criteria|classif|confirm)\b|تشخيص|معايير/.test(lower)) {
    add(`${contextualQuery}\ndiagnosis diagnostic criteria classification confirmation`);
  }

  return Array.from(queries).slice(0, 4);
};

export const buildAssistantFailureMessage = (
  error: unknown,
  language: GuidelineLanguage,
  hasPreviousSources: boolean,
) => {
  const reason = explainAssistantFailure(error, language);
  if (language === 'ar') {
    return [
      'ماقدرتش أطلع الرد دلوقتي.',
      `**سبب الفشل:** ${reason}`,
      hasPreviousSources
        ? 'المصادر السابقة لسه موجودة، وجرب تبعت نفس السؤال تاني بعد ما الاتصال يستقر.'
        : 'جرب تبعت نفس السؤال تاني بعد ما الاتصال يستقر.',
    ].join('\n\n');
  }

  return [
    'I could not generate the answer right now.',
    `**Failure reason:** ${reason}`,
    hasPreviousSources
      ? 'The previous sources are still available. Retry the same question after the connection stabilizes.'
      : 'Retry the same question after the connection stabilizes.',
  ].join('\n\n');
};
