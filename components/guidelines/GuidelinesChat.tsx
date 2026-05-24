import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LuBot,
  LuCheck,
  LuChevronDown,
  LuEraser,
  LuFileText,
  LuGlobe,
  LuLanguages,
  LuLoader,
  LuMaximize2,
  LuMessageCircle,
  LuPanelRightOpen,
  LuSearch,
  LuSend,
  LuSettings2,
  LuShieldCheck,
  LuSparkles,
  LuX,
} from 'react-icons/lu';
import type {
  GuidelineCollection,
  GuidelineCollectionData,
  GuidelineLanguage,
  GuidelineTopic,
} from './guidelinesData';
import {
  buildGuidelineChatIndex,
  formatChunkCitation,
  loadAllGuidelineChatCollections,
  loadFullTextGuidelineChatIndex,
  searchGuidelineChatIndex,
  searchGuidelineChatIndexCloud,
  type GuidelineChatResponseMode,
  type GuidelineChatScope,
  type GuidelineChatSourceChunk,
} from './guidelineChatSearch';
import { generateGuidelineChatAnswer } from '../../services/guidelineChatService';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: GuidelineChatSourceChunk[];
  status?: 'thinking' | 'error';
};

type GuidelinesChatProps = {
  language: GuidelineLanguage;
  selectedCollection: GuidelineCollection | null;
  selectedSourceId: string;
  collectionData: GuidelineCollectionData | null;
  isEmbedded?: boolean;
};

const storageKey = 'drhyper-guidelines-chat-v1';

const starterMessages: Record<GuidelineLanguage, ChatMessage> = {
  ar: {
    id: 'welcome-ar',
    role: 'assistant',
    content:
      'اسألني من الجايدلاينز المضافة. سأبحث في النصوص الرسمية وأجيب بمصادر، ولو المعلومة غير موجودة سأقول ذلك بوضوح.',
    createdAt: Date.now(),
  },
  en: {
    id: 'welcome-en',
    role: 'assistant',
    content:
      'Ask me from the added guidelines. I will search the official source text, answer with citations, and say clearly when the information is not available.',
    createdAt: Date.now(),
  },
};

const scopeLabels: Record<GuidelineChatScope, Record<GuidelineLanguage, string>> = {
  'current-section': { ar: 'هذا الملف تحديداً', en: 'This file specifically' },
  'current-guideline': { ar: 'الجايدلاين الحالي كاملاً', en: 'Entire current guideline' },
  'all-guidelines': { ar: 'جميع الأدلة (شامل)', en: 'All guidelines (global)' },
};

const modeLabels: Record<GuidelineChatResponseMode, Record<GuidelineLanguage, string>> = {
  concise: { ar: 'مختصر', en: 'Concise' },
  detailed: { ar: 'تفصيلي', en: 'Detailed' },
  table: { ar: 'جدول', en: 'Table' },
  official: { ar: 'النص الرسمي', en: 'Official text' },
};

const suggestions: Record<GuidelineLanguage, string[]> = {
  ar: [
    'متى أبدأ iron في CKD not on dialysis؟',
    'ما هدف hemoglobin مع ESA؟',
    'متى أبدأ RRT في AKI؟',
  ],
  en: [
    'When should iron be started in CKD not on dialysis?',
    'What hemoglobin target is recommended with ESA?',
    'When should RRT be started in AKI?',
  ],
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const compactText = (value: string, max = 460) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const readStoredMessages = (language: GuidelineLanguage): ChatMessage[] => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [starterMessages[language]];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [starterMessages[language]];
    return parsed.slice(-40);
  } catch {
    return [starterMessages[language]];
  }
};

export const GuidelinesChat: React.FC<GuidelinesChatProps> = ({
  language,
  selectedCollection,
  selectedSourceId,
  collectionData,
  isEmbedded = false,
}) => {
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(isEmbedded ? true : false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [scope, setScope] = useState<GuidelineChatScope>('all-guidelines');
  const [mode, setMode] = useState<GuidelineChatResponseMode>('concise');
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStoredMessages(language));

  const selectedSource = useMemo(() => {
    if (!selectedCollection || !selectedSourceId) return null;
    return selectedCollection.sources.find((s) => s.id === selectedSourceId) ?? null;
  }, [selectedCollection, selectedSourceId]);

  const selectedGroup = useMemo(() => {
    if (!collectionData?.topics || !selectedSourceId) return undefined;
    const topic = collectionData.topics.find((t) => t.sourceIds.includes(selectedSourceId));
    return topic?.group;
  }, [collectionData, selectedSourceId]);

  useEffect(() => {
    if (isEmbedded && selectedSourceId) {
      setScope('current-section');
    }
  }, [selectedSourceId, isEmbedded]);
  const [index, setIndex] = useState<GuidelineChatSourceChunk[]>([]);
  const [fullTextChunkCount, setFullTextChunkCount] = useState(0);
  const [isIndexLoading, setIsIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState('');
  const [activeSources, setActiveSources] = useState<GuidelineChatSourceChunk[]>([]);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || index.length > 0 || isIndexLoading) return;
    let isMounted = true;
    setIsIndexLoading(true);
    setIndexError('');
    Promise.allSettled([
      loadAllGuidelineChatCollections().then(buildGuidelineChatIndex),
      loadFullTextGuidelineChatIndex(),
    ])
      .then(([structuredResult, fullTextResult]) => {
        if (!isMounted) return;
        const structuredIndex = structuredResult.status === 'fulfilled' ? structuredResult.value : [];
        const fullTextIndex = fullTextResult.status === 'fulfilled' ? fullTextResult.value : [];
        setIndex([...fullTextIndex, ...structuredIndex]);
        setFullTextChunkCount(fullTextIndex.length);

        if (structuredResult.status === 'rejected' && fullTextResult.status === 'rejected') {
          setIndexError(isArabic ? 'تعذر تجهيز فهرس الجايدلاينز.' : 'Could not prepare the guideline index.');
        } else if (fullTextResult.status === 'rejected') {
          setIndexError(isArabic ? 'تم تشغيل الشات على الملخصات فقط؛ لم يتم تحميل النصوص الكاملة.' : 'Chat is running on summaries only; the full-text index did not load.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIndexError(isArabic ? 'تعذر تجهيز فهرس الجايدلاينز.' : 'Could not prepare the guideline index.');
      })
      .finally(() => {
        if (isMounted) setIsIndexLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index.length, isArabic, isOpen]);

  useEffect(() => {
    if (!selectedCollection || !collectionData) return;
    const hasSelected = index.some((chunk) => chunk.collectionId === selectedCollection.id && chunk.kind !== 'full-text');
    if (hasSelected || isIndexLoading) return;
    setIndex((current) => buildGuidelineChatIndex([
      {
        collection: selectedCollection,
        data: collectionData,
      },
    ]).concat(current));
  }, [collectionData, index, isIndexLoading, selectedCollection]);

  const panelWidth = isEmbedded
    ? 'w-full h-[640px] flex flex-col'
    : isExpanded
      ? 'fixed inset-3 z-50'
      : 'fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[430px] rtl:left-4 rtl:right-auto';

  const searchedSources = useMemo(() => {
    if (!input.trim()) return [];
    return searchGuidelineChatIndex(index, input, {
      scope,
      selectedCollectionId: selectedCollection?.id,
    }, 8);
  }, [index, input, scope, selectedCollection?.id]);

  const sendMessage = async (forcedQuestion?: string) => {
    const question = (forcedQuestion ?? input).trim();
    if (!question || isSending || isIndexLoading) return;

    setInput('');
    setIsSending(true);

    let sources = await searchGuidelineChatIndexCloud(question, {
      scope,
      selectedCollectionId: selectedCollection?.id,
      selectedGroup,
    }, 24);

    if (scope === 'current-section' && selectedSourceId) {
      sources = sources.filter((chunk) => chunk.sourceId === selectedSourceId);
    }
    sources = sources.slice(0, 12);

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: question,
      createdAt: Date.now(),
    };
    const thinkingMessage: ChatMessage = {
      id: makeId(),
      role: 'assistant',
      content: isArabic ? 'أبحث في النصوص الرسمية...' : 'Searching the official source text...',
      createdAt: Date.now(),
      sources,
      status: 'thinking',
    };
    setMessages((current) => [...current, userMessage, thinkingMessage]);
    setActiveSources(sources);

    if (sources.length === 0) {
      setMessages((current) => current.map((message) => (
        message.id === thinkingMessage.id
          ? {
            ...message,
            status: undefined,
            content: isArabic
              ? 'لم أجد نصًا رسميًا مطابقًا داخل الجايدلاينز المضافة حاليًا، ومش هخترع إجابة من خارجها. جرّب صياغة السؤال باسم المرض/الاختصار الطبي، أو تأكد أن الفصل الكامل اتضاف كنص قابل للبحث.'
              : 'I could not find matching official text in the guidelines currently added, so I will not invent an answer outside them. Try the disease name/medical abbreviation, or confirm that the full chapter was added as searchable text.',
          }
          : message
      )));
      setIsSending(false);
      return;
    }

    try {
      const answer = await generateGuidelineChatAnswer({
        question,
        language,
        mode,
        chunks: sources,
        history: messages
          .filter((message) => message.status !== 'thinking')
          .slice(-8)
          .map((message) => ({ role: message.role, content: message.content })),
      });
      setMessages((current) => current.map((message) => (
        message.id === thinkingMessage.id
          ? { ...message, status: undefined, content: answer || (isArabic ? 'لم يصل رد من النموذج.' : 'No model response was returned.') }
          : message
      )));
    } catch (error) {
      const fallback = [
        isArabic
          ? 'دي أقرب النصوص الرسمية المطابقة التي وجدتها. سأعرض النصوص نفسها بدون إضافة استنتاجات غير مدعومة:'
          : 'These are the closest matching official excerpts I found. I am showing the source text without adding unsupported conclusions:',
        ...sources.slice(0, 5).map((source, index) => `[S${index + 1}] ${formatChunkCitation(source, language)}\n${compactText(source.text, 800)}`),
      ].join('\n\n');
      setMessages((current) => current.map((message) => (
        message.id === thinkingMessage.id
          ? { ...message, status: 'error', content: fallback }
          : message
      )));
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    const welcome = { ...starterMessages[language], id: makeId(), createdAt: Date.now() };
    setMessages([welcome]);
    setActiveSources([]);
  };

  return (
    <>
      {!isEmbedded && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-900/30 ring-4 ring-white transition hover:scale-105 hover:bg-blue-700 rtl:left-4 rtl:right-auto"
          aria-label={isArabic ? 'افتح شات الجايدلاينز' : 'Open guidelines chat'}
        >
          <LuMessageCircle className="h-7 w-7" />
        </button>
      )}

      {isOpen && (
        <section
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`${panelWidth} overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl ${isEmbedded ? 'shadow-blue-950/5' : 'shadow-slate-950/25'}`}
        >
          <div className={`flex flex-col bg-slate-50 ${isEmbedded ? 'h-full' : 'h-full min-h-[620px] max-h-[calc(100vh-2rem)]'}`}>
            <header className="flex items-center justify-between gap-3 border-b border-blue-100 bg-white px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-900/20">
                  <LuBot className="h-6 w-6" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 rtl:left-0 rtl:right-auto" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-950">
                    {isArabic ? 'مساعد الجايدلاينز' : 'Guidelines Assistant'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <LuShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {isArabic ? 'إجابات من النصوص المضافة فقط' : 'Source-grounded answers only'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded((value) => !value)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                  title={isArabic ? 'تكبير' : 'Expand'}
                >
                  <LuMaximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                  title={isArabic ? 'مسح المحادثة' : 'Clear chat'}
                >
                  <LuEraser className="h-4 w-4" />
                </button>
                {!isEmbedded && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title={isArabic ? 'إغلاق' : 'Close'}
                  >
                    <LuX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </header>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="flex min-h-0 flex-col">
                <div className="border-b border-blue-100 bg-white px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-[11px] font-black text-blue-800 ring-1 ring-blue-100">
                      <LuSearch className="h-3.5 w-3.5" />
                      <select
                        value={scope}
                        onChange={(event) => setScope(event.target.value as GuidelineChatScope)}
                        className="bg-transparent outline-none"
                      >
                        {Object.entries(scopeLabels).map(([value, labels]) => (
                          <option key={value} value={value}>{labels[language]}</option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[11px] font-black text-slate-700 ring-1 ring-slate-200">
                      <LuSettings2 className="h-3.5 w-3.5" />
                      <select
                        value={mode}
                        onChange={(event) => setMode(event.target.value as GuidelineChatResponseMode)}
                        className="bg-transparent outline-none"
                      >
                        {Object.entries(modeLabels).map(([value, labels]) => (
                          <option key={value} value={value}>{labels[language]}</option>
                        ))}
                      </select>
                    </label>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-500 ring-1 ring-slate-200">
                      <LuGlobe className="h-3.5 w-3.5" />
                      {selectedCollection?.school ?? (isArabic ? 'كل المصادر' : 'All sources')}
                    </span>
                    {scope === 'current-section' && selectedSource && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-800 ring-1 ring-emerald-200/50 truncate max-w-[200px]" title={selectedSource.title}>
                        <LuFileText className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>
                          {isArabic ? 'محدود بـ: ' : 'Scoped to: '}
                          {selectedSource.title}
                        </span>
                      </span>
                    )}
                    {isIndexLoading && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-100">
                        <LuLoader className="h-3.5 w-3.5 animate-spin" />
                        {isArabic ? 'تجهيز الفهرس' : 'Indexing'}
                      </span>
                    )}
                    {!isIndexLoading && fullTextChunkCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
                        <LuFileText className="h-3.5 w-3.5" />
                        {isArabic ? `${fullTextChunkCount} مقطع نص كامل` : `${fullTextChunkCount} full-text chunks`}
                      </span>
                    )}
                  </div>
                  {indexError ? <p className="mt-2 text-xs font-bold text-red-600">{indexError}</p> : null}
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_36%,#eef2ff_100%)] px-3 py-4">
                  {messages.map((message) => {
                    const mine = message.role === 'user';
                    return (
                      <div key={message.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                        {!mine && (
                          <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                            <LuBot className="h-4 w-4" />
                          </div>
                        )}
                        <div className={`max-w-[82%] ${mine ? 'text-right' : 'text-left'}`}>
                          <div
                            className={`whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm font-semibold leading-7 shadow-sm ${
                              mine
                                ? 'rounded-br-md bg-blue-600 text-white rtl:rounded-bl-md rtl:rounded-br-3xl'
                                : message.status === 'error'
                                  ? 'rounded-bl-md border border-amber-200 bg-amber-50 text-amber-950 rtl:rounded-bl-3xl rtl:rounded-br-md'
                                  : 'rounded-bl-md border border-slate-100 bg-white text-slate-800 rtl:rounded-bl-3xl rtl:rounded-br-md'
                            }`}
                          >
                            {message.status === 'thinking' ? (
                              <span className="inline-flex items-center gap-2">
                                <LuLoader className="h-4 w-4 animate-spin" />
                                {message.content}
                              </span>
                            ) : message.content}
                          </div>
                          {message.sources?.length ? (
                            <button
                              type="button"
                              onClick={() => setActiveSources(message.sources ?? [])}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-900"
                            >
                              <LuPanelRightOpen className="h-3.5 w-3.5" />
                              {isArabic ? `${message.sources.length} مصادر` : `${message.sources.length} sources`}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-blue-100 bg-white p-3">
                  {messages.length <= 1 && (
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                      {suggestions[language].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => sendMessage(item)}
                          disabled={isIndexLoading}
                          className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2 rounded-3xl border border-blue-100 bg-slate-50 p-2 ring-1 ring-transparent transition focus-within:ring-blue-100">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={isArabic ? 'اسأل من الجايدلاينز الرسمية...' : 'Ask from the official guidelines...'}
                      rows={1}
                      className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isSending || isIndexLoading}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      aria-label={isArabic ? 'إرسال' : 'Send'}
                    >
                      {isSending ? <LuLoader className="h-5 w-5 animate-spin" /> : <LuSend className="h-5 w-5" />}
                    </button>
                  </div>
                  {searchedSources.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <LuCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {isArabic ? `تم العثور مبدئيًا على ${searchedSources.length} مصادر مطابقة` : `${searchedSources.length} matching sources found`}
                    </div>
                  )}
                </div>
              </div>

              <aside className="hidden min-h-0 border-l border-blue-100 bg-white lg:flex lg:flex-col rtl:border-l-0 rtl:border-r">
                <div className="flex items-center justify-between border-b border-blue-100 px-3 py-3">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-slate-700">
                    <LuFileText className="h-4 w-4 text-blue-600" />
                    {isArabic ? 'المصادر المستخدمة' : 'Used Sources'}
                  </div>
                  <LuChevronDown className="h-4 w-4 text-slate-300" />
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                  {activeSources.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-blue-100 bg-blue-50/60 p-4 text-xs font-bold leading-6 text-slate-500">
                      {isArabic ? 'ستظهر هنا النصوص الرسمية التي استخدمها الشات في الإجابة.' : 'The official source excerpts used by the chat will appear here.'}
                    </div>
                  ) : (
                    activeSources.map((source, index) => (
                      <details key={`${source.id}-${index}`} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3" open={index < 2}>
                        <summary className="cursor-pointer text-xs font-black text-blue-900">
                          [S{index + 1}] {formatChunkCitation(source, language)}
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-6 text-slate-600">
                          {compactText(source.text, 900)}
                        </p>
                      </details>
                    ))
                  )}
                </div>
                <div className="border-t border-blue-100 bg-blue-50/60 p-3">
                  <div className="flex items-start gap-2 text-[11px] font-bold leading-5 text-slate-600">
                    <LuLanguages className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {isArabic
                      ? 'الإجابة تتبع لغة الصفحة. غيّر اللغة من أعلى صفحة الجايدلاينز.'
                      : 'Answers follow the page language. Change language from the guidelines page header.'}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
