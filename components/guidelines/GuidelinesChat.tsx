import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  LuArrowLeft,
  LuBot,
  LuCopy,
  LuEraser,
  LuExternalLink,
  LuFolder,
  LuLoader,
  LuMessageCircle,
  LuMic,
  LuMicOff,
  LuPanelRightOpen,
  LuQuote,
  LuSearch,
  LuSend,
  LuX,
} from 'react-icons/lu';
import type {
  GuidelineCollection,
  GuidelineCollectionData,
  GuidelineLanguage,
} from './guidelinesData';
import {
  formatChunkCitation,
  GuidelineChatSearchError,
  searchGuidelineChatIndexCloud,
  type GuidelineChatScope,
  type GuidelineChatResponseMode,
  type GuidelineChatSourceChunk,
} from './guidelineChatSearch';
import { generateGuidelineChatAnswer, reformulateGuidelineQuery } from '../../services/guidelineChatService';
import { useAuth } from '../../hooks/useAuth';
import { deleteCloudChatHistory, saveCloudChatHistory, subscribeCloudChatHistory, trimChatMessages } from '../../services/guidelineChatHistoryService';
import { ChatToolbar, type AnswerStyle } from './GuidelinesChatToolbar';
import {
  buildAssistantFailureMessage,
  buildGuidelineSearchQueries,
  getContentAlignClass,
  getContentDirection,
  getMessageTime,
  getMessagesSignature,
  getSourceFileName,
  getSourcePageLabel,
  getSourcePreview,
  isOnlyWelcomeMessage,
  makeId,
  mergeRankedSources,
  readStoredMessages,
  clearStoredMessages,
  welcomeMessage,
  writeStoredMessages,
} from './GuidelinesChat.helpers';
import {
  buildCompactHistory,
  buildContextualSearchQuery,
  buildSmallTalkReply,
  findLastSources,
  getSourceReason,
  getSpeechRecognitionFactory,
  inferResponseMode,
  inferSearchScope,
  isComparisonQuestion,
  isSmallTalk,
  shouldUseConversationContext,
  type BrowserSpeechRecognition,
  type ChatMessage,
} from './guidelinesChatUtils';

type GuidelinesChatProps = {
  language: GuidelineLanguage;
  onLanguageChange?: (language: GuidelineLanguage) => void;
  selectedCollection: GuidelineCollection | null;
  selectedSourceId: string;
  collectionData: GuidelineCollectionData | null;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  isEmbedded?: boolean;
  /** When true, show a built-in book picker in the toolbar instead of relying on external selection */
  showBookPicker?: boolean;
  onSelectSource?: (collectionId: string, sourceId: string) => void;
};

import { renderMessageContent } from './GuidelinesChat.renderers';

const hasTransientMessages = (messages: ChatMessage[]) =>
  messages.some((message) => message.status === 'thinking' || message.status === 'streaming');

const THINKING_STEP_MS = 900;
const STREAM_REVEAL_TICK_MS = 36;

const waitForThinkingStep = (durationMs = THINKING_STEP_MS) =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(resolve, durationMs);
      });
    });
  });

const waitUntilThinkingStepElapsed = async (startedAt: number, durationMs = THINKING_STEP_MS) => {
  const remainingMs = durationMs - (Date.now() - startedAt);
  if (remainingMs > 0) await waitForThinkingStep(remainingMs);
};

const collectSearchGroups = (
  settled: PromiseSettledResult<GuidelineChatSourceChunk[]>[],
) => {
  const groups: GuidelineChatSourceChunk[][] = [];
  const errors: unknown[] = [];

  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value.length > 0) groups.push(result.value);
    } else {
      errors.push(result.reason);
    }
  });

  return { groups, errors };
};

export const GuidelinesChat: React.FC<GuidelinesChatProps> = ({
  language,
  onLanguageChange,
  selectedCollection,
  selectedSourceId,
  collectionData,
  doctorName,
  doctorSpecialty,
  isEmbedded = false,
  showBookPicker = false,
  onSelectSource,
}) => {
  const { user } = useAuth();
  const uid = user?.uid;

  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [scope, setScope] = useState<GuidelineChatScope>('all-guidelines');
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>('scientific');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStoredMessages(language, doctorName, doctorSpecialty, uid));
  const [activeSources, setActiveSources] = useState<GuidelineChatSourceChunk[]>([]);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [singleSourceNumber, setSingleSourceNumber] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [highlightedSourceIndex, setHighlightedSourceIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const speechRef = useRef<BrowserSpeechRecognition | null>(null);
  const messagesRef = useRef(messages);
  const cloudHistoryReadyRef = useRef(false);
  const applyingCloudHistoryRef = useRef(false);
  const lastCloudSignatureRef = useRef('');
  const lastLocalSignatureRef = useRef('');
  const clearRequestedRef = useRef(false);

  const selectedSource = useMemo(() => {
    if (!selectedCollection || !selectedSourceId) return null;
    return selectedCollection.sources.find((source) => source.id === selectedSourceId) ?? null;
  }, [selectedCollection, selectedSourceId]);

  const selectedGroup = useMemo(() => {
    if (!collectionData?.topics || !selectedSourceId) return undefined;
    const topic = collectionData.topics.find((item) => item.sourceIds.includes(selectedSourceId));
    return topic?.group;
  }, [collectionData, selectedSourceId]);

  const scrollToLatestMessage = (behavior: ScrollBehavior = 'auto', settleAfterRender = false) => {
    const scroll = (mode: ScrollBehavior) => {
      const container = messagesScrollRef.current;
      if (container) {
        const target = container.scrollHeight + container.clientHeight;
        container.scrollTop = target;
        container.scrollTo({ top: target, behavior: mode });
      }
      bottomRef.current?.scrollIntoView({ behavior: mode, block: 'end' });
    };

    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scroll(behavior);
      if (settleAfterRender) {
        window.setTimeout(() => scroll('auto'), 60);
        window.setTimeout(() => scroll('auto'), 180);
        window.setTimeout(() => scroll('auto'), 360);
        window.setTimeout(() => scroll('auto'), 700);
      }
    });
  };

  const resizeInput = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const maxHeight = 112;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    if (isEmbedded) setIsOpen(true);
  }, [isEmbedded]);

  useEffect(() => {
    setMessages((current) => {
      const hasOnlyWelcome = current.length === 1 && current[0]?.id.startsWith('welcome-');
      return hasOnlyWelcome ? [welcomeMessage(language, doctorName, doctorSpecialty)] : current;
    });
  }, [doctorName, doctorSpecialty, language]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    lastLocalSignatureRef.current = '';
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      cloudHistoryReadyRef.current = false;
      lastCloudSignatureRef.current = '';
      return;
    }

    let active = true;
    cloudHistoryReadyRef.current = false;
    lastCloudSignatureRef.current = '';

    const unsubscribe = subscribeCloudChatHistory(
      uid,
      (cloudMessages) => {
        if (!active) return;

        if (cloudMessages && cloudMessages.length > 0) {
          if (clearRequestedRef.current) {
            void deleteCloudChatHistory(uid);
            return;
          }

          const trimmed = trimChatMessages(cloudMessages);
          const signature = getMessagesSignature(trimmed);
          cloudHistoryReadyRef.current = true;

          if (hasTransientMessages(messagesRef.current)) {
            return;
          }

          clearRequestedRef.current = false;
          lastCloudSignatureRef.current = signature;

          if (signature !== getMessagesSignature(messagesRef.current)) {
            applyingCloudHistoryRef.current = true;
            setMessages(trimmed);
          }
          return;
        }

        if (clearRequestedRef.current) {
          const clearedMessages = [welcomeMessage(language, doctorName, doctorSpecialty)];
          clearRequestedRef.current = false;
          applyingCloudHistoryRef.current = true;
          cloudHistoryReadyRef.current = true;
          lastCloudSignatureRef.current = getMessagesSignature(clearedMessages);
          messagesRef.current = clearedMessages;
          clearStoredMessages(uid);
          setMessages(clearedMessages);
          return;
        }

        if (hasTransientMessages(messagesRef.current)) {
          cloudHistoryReadyRef.current = true;
          return;
        }

        const localMessages = readStoredMessages(language, doctorName, doctorSpecialty, uid);
        const currentMessages = isOnlyWelcomeMessage(messagesRef.current) && !isOnlyWelcomeMessage(localMessages)
          ? localMessages
          : messagesRef.current;
        const trimmed = trimChatMessages(currentMessages);
        const signature = getMessagesSignature(trimmed);
        cloudHistoryReadyRef.current = true;
        lastCloudSignatureRef.current = signature;

        if (getMessagesSignature(messagesRef.current) !== signature) {
          setMessages(trimmed);
        }
        void saveCloudChatHistory(uid, trimmed);
      },
      () => {
        cloudHistoryReadyRef.current = true;
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [doctorName, doctorSpecialty, language, uid]);

  useEffect(() => {
    const trimmed = trimChatMessages(messages);
    const hasTransient = hasTransientMessages(trimmed);
    const localPersistableMessages = hasTransient
      ? trimmed.filter((message) => message.status !== 'thinking' && message.status !== 'streaming')
      : trimmed;
    const localSignature = getMessagesSignature(localPersistableMessages);
    if (localSignature !== lastLocalSignatureRef.current) {
      lastLocalSignatureRef.current = localSignature;
      writeStoredMessages(localPersistableMessages, uid);
    }

    if (uid && cloudHistoryReadyRef.current && !applyingCloudHistoryRef.current && !hasTransient) {
      const signature = getMessagesSignature(trimmed);
      if (signature !== lastCloudSignatureRef.current) {
        lastCloudSignatureRef.current = signature;
        void saveCloudChatHistory(uid, trimmed);
      }
    }
    applyingCloudHistoryRef.current = false;

    if (trimmed.length !== messages.length) setMessages(trimmed);
  }, [messages, uid]);

  useLayoutEffect(() => {
    if (isOpen) scrollToLatestMessage('auto', true);
  }, [messages, isOpen, isSending]);

  useLayoutEffect(() => {
    resizeInput();
  }, [input, isOpen, resizeInput]);

  useEffect(() => () => {
    speechRef.current?.stop();
    speechRef.current = null;
    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  const panelClass = isEmbedded
    ? 'h-full min-h-0 w-full'
    : 'fixed bottom-3 right-3 z-50 h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[560px] rtl:left-3 rtl:right-auto';

  const clearChat = () => {
    const clearedMessages = [welcomeMessage(language, doctorName, doctorSpecialty)];
    clearRequestedRef.current = true;
    applyingCloudHistoryRef.current = true;
    lastCloudSignatureRef.current = getMessagesSignature(clearedMessages);
    messagesRef.current = clearedMessages;
    clearStoredMessages(uid);
    setMessages(clearedMessages);
    setActiveSources([]);
    setSourceSheetOpen(false);
    setSingleSourceNumber(null);
    if (uid) void deleteCloudChatHistory(uid);
  };

  const copyText = async (value: string) => {
    await navigator.clipboard?.writeText(value).catch(() => undefined);
  };

  const addAssistantMessage = (content: string) => {
    const message: ChatMessage = {
      id: makeId(),
      role: 'assistant',
      content,
      createdAt: Date.now(),
    };
    setMessages((current) => trimChatMessages([...current, message]));
  };

  const revealAssistantText = (
    messageId: string,
    fullText: string,
    sources: GuidelineChatSourceChunk[],
  ) => {
    const tokens = fullText.split(/(\s+)/);
    let index = 0;
    const step = Math.max(6, Math.ceil(tokens.length / 80));

    const tick = () => {
      index = Math.min(tokens.length, index + step);
      const partial = tokens.slice(0, index).join('');
      setMessages((current) => current.map((message) => (
        message.id === messageId
          ? {
            ...message,
            status: index < tokens.length ? 'streaming' : undefined,
            sources,
            content: partial || fullText,
          }
          : message
      )));
      scrollToLatestMessage('auto');
      if (index < tokens.length) {
        window.setTimeout(tick, STREAM_REVEAL_TICK_MS);
      } else {
        scrollToLatestMessage('auto', true);
      }
    };

    tick();
  };

  const jumpToSource = (sourceIndex: number, sources?: GuidelineChatSourceChunk[]) => {
    const source = sources?.[sourceIndex];
    if (source) {
      setActiveSources([source]);
      setSingleSourceNumber(sourceIndex + 1);
      setHighlightedSourceIndex(0);
    } else if (sources?.length) {
      setActiveSources(sources);
      setSingleSourceNumber(null);
      setHighlightedSourceIndex(Math.min(sourceIndex, sources.length - 1));
    } else {
      setSingleSourceNumber(null);
      setHighlightedSourceIndex(sourceIndex);
    }
    setSourceSheetOpen(true);
  };



  const toggleVoiceInput = () => {
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognitionFactory();
    if (!SpeechRecognition) {
      addAssistantMessage(language === 'ar'
        ? 'المتصفح الحالي لا يدعم الإملاء الصوتي. جرب Chrome أو Edge.'
        : 'This browser does not support voice dictation. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInput((finalText || interimText).trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    speechRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const sendMessage = async (forcedQuestion?: string) => {
    const question = (forcedQuestion ?? input).trim();
    if (!question || isSending) return;

    setInput('');
    setIsSending(true);
    let thinkingStepStartedAt = Date.now();

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: question,
      createdAt: Date.now(),
    };

    const intentThinkingId = makeId();
    const intentThinkingMessage: ChatMessage = {
      id: intentThinkingId,
      role: 'assistant',
      content: isArabic ? 'جاري فهم السؤال والسياق' : 'Understanding the question and context',
      createdAt: Date.now(),
      status: 'thinking',
    };

    const updateThinkingMessage = async (
      content: string,
      options: { waitBefore?: boolean; durationMs?: number; sources?: GuidelineChatSourceChunk[] } = {},
    ) => {
      if (options.waitBefore !== false) {
        await waitUntilThinkingStepElapsed(thinkingStepStartedAt, options.durationMs);
      }

      setMessages((current) => current.map((message) => (
        message.id === intentThinkingId
          ? {
            ...message,
            content,
            ...(options.sources ? { sources: options.sources } : {}),
          }
          : message
      )));
      scrollToLatestMessage('auto', true);
      thinkingStepStartedAt = Date.now();
    };

    setMessages((current) => trimChatMessages([...current, userMessage, intentThinkingMessage]));
    scrollToLatestMessage('auto', true);

    const candidatePreviousSources = activeSources.length ? activeSources : findLastSources(messages);
    const shouldAnalyzeFollowUp = shouldUseConversationContext({
      question,
      previousSources: candidatePreviousSources,
    });
    const historyForModel = buildCompactHistory([...messages, userMessage]);

    const intentAnalysis = shouldAnalyzeFollowUp
      ? await reformulateGuidelineQuery(question, historyForModel)
      : { isFollowUp: false, reformulatedQuery: question, shouldClearSources: true };

    const followUp = !intentAnalysis.shouldClearSources;
    const previousSources = followUp ? candidatePreviousSources : [];
    if (!followUp) {
      setActiveSources([]);
      setSingleSourceNumber(null);
      setHighlightedSourceIndex(null);
    }

    const reformulatedQuestion = intentAnalysis.reformulatedQuery || question;

    if (isSmallTalk(reformulatedQuestion) || isSmallTalk(question)) {
      setMessages((current) => current.filter(m => m.id !== intentThinkingId));
      addAssistantMessage(buildSmallTalkReply(question, language));
      scrollToLatestMessage('auto', true);
      setIsSending(false);
      return;
    }

    try {
      const comparisonQuestion = isComparisonQuestion(reformulatedQuestion);
      const effectiveScope = inferSearchScope({ question: reformulatedQuestion, preferredScope: scope, selectedSource, selectedCollection });
      const contextualQuery = followUp ? buildContextualSearchQuery({ question: reformulatedQuestion, messages, previousSources }) : reformulatedQuestion;
      const responseMode: GuidelineChatResponseMode = answerStyle === 'concise'
        ? 'concise'
        : inferResponseMode(question);
      const answerSourceLimit = comparisonQuestion || responseMode === 'table' ? 8 : responseMode === 'concise' ? 5 : 6;
      const searchQueries = buildGuidelineSearchQueries({ question: reformulatedQuestion, contextualQuery, followUp })
        .slice(0, comparisonQuestion ? 3 : 2);
      const selectedCollectionScope = effectiveScope === 'current-guideline' ? selectedCollection?.id : undefined;

      await updateThinkingMessage(isArabic ? 'جاري البحث في الجايدلاينز وترتيب أفضل المصادر' : 'Searching guidelines and ranking the best sources');

      const searchTasks: Promise<GuidelineChatSourceChunk[]>[] = [];
      if (effectiveScope === 'current-file' && selectedSource) {
        searchTasks.push(searchGuidelineChatIndexCloud(contextualQuery, {
          scope: 'current-file',
          selectedCollectionId: selectedCollection?.id,
          selectedGroup,
        }, comparisonQuestion ? 8 : 6, selectedSource));
      }

      searchQueries.forEach((query) => {
        searchTasks.push(searchGuidelineChatIndexCloud(query, {
          scope: selectedCollectionScope ? 'current-guideline' : 'all-guidelines',
          selectedCollectionId: selectedCollectionScope,
          selectedGroup: undefined,
        }, comparisonQuestion ? 12 : 10, null));
      });

      const { groups: sourceGroups, errors: searchErrors } = collectSearchGroups(await Promise.allSettled(searchTasks));
      if (sourceGroups.length === 0 && searchErrors.length > 0) {
        throw searchErrors[0];
      }
      if (searchErrors.length > 0) {
        console.warn('[GuidelinesChat] Some guideline searches failed; continuing with partial results:', searchErrors);
      }

      const foundSources = mergeRankedSources(answerSourceLimit, ...sourceGroups);
      const sources = foundSources.length > 0
        ? foundSources
        : (followUp ? previousSources : []);
      setActiveSources(sources);
      setSingleSourceNumber(null);

      await updateThinkingMessage(
        sources.length > 0
          ? (isArabic ? 'جاري تجهيز الإجابة النهائية' : 'Preparing the final answer')
          : (isArabic ? 'جاري تجهيز إجابة من مصادر طبية أخرى لأن النص المرفوع لا يغطي النقطة بوضوح' : 'Preparing an answer from other medical sources because the uploaded text does not clearly cover this point'),
        { sources },
      );

      const answer = await generateGuidelineChatAnswer({
        question,
        language,
        mode: responseMode,
        chunks: sources,
        history: historyForModel,
        answerMode: sources.length > 0 ? 'guideline-first' : 'general-medical',
        doctorSpecialty,
      });

      revealAssistantText(
        intentThinkingId,
        answer || (isArabic ? 'النموذج مرجعش إجابة واضحة. جرب تعيد السؤال بصياغة تانية.' : 'The model did not return a clear answer. Try rephrasing the question.'),
        sources,
      );
    } catch (err: any) {
      const details = (err as { details?: { limitReachedMessage?: string; limit?: number } })?.details;
      const quotaMessage = details?.limitReachedMessage;
      const isSearchError = err instanceof GuidelineChatSearchError || err?.name === 'GuidelineChatSearchError';

      if (quotaMessage) {
        setMessages((current) => current.map((message) => (
          message.id === intentThinkingId
            ? {
              ...message,
              status: 'error',
              sources: previousSources,
              content: String(quotaMessage).replace(/\{\s*limit\s*\}/gi, String(Number(details?.limit || 0))),
            }
            : message
        )));
        scrollToLatestMessage('auto', true);
        return;
      }

      if (isSearchError) {
        setActiveSources([]);
        setSingleSourceNumber(null);
        setMessages((current) => current.map((message) => (
          message.id === intentThinkingId
            ? {
              ...message,
              status: 'thinking',
              sources: [],
              content: isArabic
                ? 'ماوصلتش لمعلومة واضحة من الجايدلاينز المرفوعة للنقطة دي. هكمل بإجابة طبية عامة من خارج الملفات مع توضيح ذلك.'
                : 'I did not reach a clear answer from the uploaded guidelines for this point. I will continue with a general medical answer outside the uploaded files and label it clearly.',
            }
            : message
        )));
        scrollToLatestMessage('auto', true);

        try {
          const responseMode: GuidelineChatResponseMode = answerStyle === 'concise'
            ? 'concise'
            : inferResponseMode(question);
          const answer = await generateGuidelineChatAnswer({
            question,
            language,
            mode: responseMode,
            chunks: [],
            history: historyForModel,
            answerMode: 'general-medical',
            doctorSpecialty,
          });
          const prefix = isArabic
            ? '**تنبيه:** لم أصل لمعلومة واضحة في الملفات المرفوعة لهذه النقطة، لذلك الإجابة التالية من معرفة طبية عامة خارج الجايدلاينز المرفوعة وليست موثقة بمصدر من مكتبة التطبيق.\n\n'
            : '**Note:** I did not find a clear answer in the uploaded files for this point, so the answer below is general medical knowledge outside the uploaded guidelines and is not sourced from the in-app library.\n\n';
          revealAssistantText(
            intentThinkingId,
            `${prefix}${answer || (isArabic ? 'النموذج مرجعش إجابة واضحة. جرّب تعيد السؤال بصياغة تانية.' : 'The model did not return a clear answer. Try rephrasing the question.')}`,
            [],
          );
        } catch (fallbackErr: any) {
          console.error('[GuidelinesChat] General medical fallback failed:', fallbackErr);
          setMessages((current) => current.map((message) => (
            message.id === intentThinkingId
              ? {
                ...message,
                status: 'error',
                sources: previousSources,
                content: buildAssistantFailureMessage(fallbackErr, language, previousSources.length > 0),
              }
              : message
          )));
          scrollToLatestMessage('auto', true);
        }
        return;
      }

      console.error('[GuidelinesChat] Answer generation failed:', err);
      setMessages((current) => current.map((message) => (
        message.id === intentThinkingId
          ? {
            ...message,
            status: 'error',
            sources: previousSources,
            content: buildAssistantFailureMessage(err, language, previousSources.length > 0),
          }
          : message
      )));
      scrollToLatestMessage('auto', true);
    } finally {
      setIsSending(false);
      scrollToLatestMessage('auto', true);
    }
  };

  const renderSourceSheet = () => {
    if (!sourceSheetOpen) return null;
    const isSingleSourceView = activeSources.length === 1 && singleSourceNumber !== null;
    return (
      <div
        className="fixed inset-0 z-[1200] bg-slate-950/55 backdrop-blur-sm"
        onClick={() => {
          setSourceSheetOpen(false);
          setSingleSourceNumber(null);
        }}
      >
        <section
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={(event) => event.stopPropagation()}
          className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col bg-[#f7f8fa] shadow-2xl sm:my-4 sm:h-[calc(100dvh-2rem)] sm:overflow-hidden sm:rounded-2xl"
        >
          <header className="sticky top-0 z-10 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200 bg-[#111b21] px-2 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white sm:px-4 sm:py-4">
            <button
              type="button"
              onClick={() => {
                setSourceSheetOpen(false);
                setSingleSourceNumber(null);
              }}
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
                          onClick={() => copyText(source.text)}
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

  if (!isEmbedded && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-[#063d31] shadow-2xl shadow-emerald-900/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#20bd5a] rtl:left-4 rtl:right-auto"
        aria-label={isArabic ? 'افتح المساعد الطبي الذكي' : 'Open smart medical assistant'}
      >
        <LuMessageCircle className="h-7 w-7" />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <section
        dir={isArabic ? 'rtl' : 'ltr'}
        className={`${panelClass} flex flex-col overflow-hidden ${
          isEmbedded
            ? 'bg-white'
            : 'rounded-3xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/12'
        }`}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#efeae2]">
          <header className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-l from-[#075e54] via-[#0b6b5f] to-[#128c7e] px-4 py-3 text-white shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/15">
                <LuBot className="h-6 w-6" />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#075e54] bg-[#25d366] rtl:left-0 rtl:right-auto" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-black">
                  {isArabic ? 'المساعد الطبي الذكي' : 'Smart Medical Assistant'}
                </div>
                <div className="text-[11px] font-bold text-emerald-100">
                  {isArabic ? 'متصل الآن' : 'Online'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-full p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
                title={isArabic ? 'مسح' : 'Clear'}
              >
                <LuEraser className="h-4.5 w-4.5" />
              </button>
              {!isEmbedded && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
                  title={isArabic ? 'إغلاق' : 'Close'}
                >
                  <LuX className="h-5 w-5" />
                </button>
              )}
            </div>
          </header>

          <ChatToolbar
            isArabic={isArabic}
            language={language}
            onLanguageChange={onLanguageChange}
            answerStyle={answerStyle}
            setAnswerStyle={setAnswerStyle}
            scope={scope}
            setScope={setScope}
            selectedSource={selectedSource}
            selectedCollection={selectedCollection}
            showBookPicker={showBookPicker}
            onSelectSource={onSelectSource}
          />

          <div
            ref={messagesScrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3 pt-3 [background-image:radial-gradient(circle_at_20px_20px,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:28px_28px] sm:px-5 sm:pb-4"
          >
            {messages.map((message) => {
              const mine = message.role === 'user';
              const textDirection = mine
                ? (isArabic ? 'rtl' : 'ltr')
                : (language === 'ar' ? 'rtl' : 'ltr');
              return (
                <div key={message.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[92%] flex-col ${mine ? 'items-end' : 'items-start'} sm:max-w-[84%]`}>
                    <div
                      dir={textDirection}
                      className={`${mine ? 'whitespace-pre-wrap' : ''} relative px-3.5 py-2 text-sm font-semibold leading-7 shadow-sm ${
                        isArabic ? 'text-right' : 'text-left'
                      } ${
                        mine
                          ? 'rounded-lg rounded-tr-sm bg-[#d9fdd3] text-slate-950 rtl:rounded-l-lg rtl:rounded-r-lg rtl:rounded-tl-sm'
                          : message.status === 'error'
                            ? 'rounded-lg rounded-tl-sm border border-amber-200 bg-amber-50 text-amber-950 rtl:rounded-l-lg rtl:rounded-r-lg rtl:rounded-tr-sm'
                            : 'rounded-lg rounded-tl-sm bg-white text-slate-900 rtl:rounded-l-lg rtl:rounded-r-lg rtl:rounded-tr-sm'
                      }`}
                    >
                      {renderMessageContent(message, jumpToSource, isArabic)}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span>{getMessageTime(message.createdAt)}</span>
                      {message.sources?.length ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSources(message.sources || []);
                            setSingleSourceNumber(null);
                            setHighlightedSourceIndex(null);
                            setSourceSheetOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[#075e54] hover:text-[#063d31]"
                        >
                          <LuPanelRightOpen className="h-3.5 w-3.5" />
                          {isArabic ? `${message.sources.length} مصادر` : `${message.sources.length} sources`}
                        </button>
                      ) : null}
                      {!message.status && (
                        <button
                          type="button"
                          onClick={() => copyText(message.content)}
                          className="inline-flex items-center gap-1 hover:text-[#075e54]"
                          title={isArabic ? 'نسخ' : 'Copy'}
                        >
                          <LuCopy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-[#d7cec0] bg-[#f0f2f5] px-2 py-2 sm:px-3 sm:py-2.5">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  isListening
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-[#075e54]'
                }`}
                aria-label={isArabic ? 'إملاء صوتي' : 'Voice dictation'}
                title={isArabic ? 'إملاء صوتي طبي' : 'Medical voice dictation'}
              >
                {isListening ? <LuMicOff className="h-5 w-5" /> : <LuMic className="h-5 w-5" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                dir={isArabic ? 'rtl' : 'ltr'}
                placeholder={isArabic ? 'اكتب سؤالك أو كمل على آخر إجابة...' : 'Ask a follow-up question...'}
                rows={1}
                className={`max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/20 ${isArabic ? 'text-right' : 'text-left'}`}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[#063d31] shadow-lg shadow-emerald-900/20 transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                aria-label={isArabic ? 'إرسال' : 'Send'}
              >
                {isSending ? <LuLoader className="h-5 w-5 animate-spin" /> : <LuSend className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </section>
      {renderSourceSheet()}
    </>
  );
};
