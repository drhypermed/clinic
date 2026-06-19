import { deleteDoc, doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { ChatMessage } from '../components/guidelines/guidelinesChatUtils';
import type { GuidelineChatSourceChunk } from '../components/guidelines/guidelineChatSearch';
import { normalizeText } from '../utils/textEncoding';

export const MAX_STORED_CHAT_MESSAGES = 30;
const MAX_STORED_SOURCES_PER_MESSAGE = 8;
const MAX_STORED_SOURCE_TEXT_CHARS = 700;

/**
 * Trims the chat history to the maximum allowed limit.
 */
export const trimChatMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return messages.slice(-MAX_STORED_CHAT_MESSAGES);
};

export const isLegacyCorruptedWelcomeMessage = (
  message: Pick<ChatMessage, 'role' | 'content'>,
) => {
  if (message.role !== 'assistant') return false;
  const normalizedContent = normalizeText(message.content);
  return (
    normalizedContent.includes('أهلا')
    && normalizedContent.includes('جاهز')
    && normalizedContent.includes('الجايدلاينز')
  );
};

const isPersistableChatMessage = (message: ChatMessage) =>
  !message.id.startsWith('welcome-')
  && message.status !== 'thinking'
  && message.status !== 'streaming'
  && !isLegacyCorruptedWelcomeMessage(message);

const compactHistoryText = (value: string | undefined, maxChars: number) => {
  const text = String(value || '').trim();
  return text.length > maxChars ? `${text.slice(0, maxChars).trim()}...` : text;
};

const stripSourceForHistory = (source: GuidelineChatSourceChunk): GuidelineChatSourceChunk => ({
  id: source.id,
  bookId: source.bookId,
  collectionId: source.collectionId,
  collectionTitle: source.collectionTitle,
  school: source.school,
  year: source.year,
  group: source.group,
  topicId: source.topicId,
  sourceId: source.sourceId,
  sourceTitle: source.sourceTitle,
  folderTitle: source.folderTitle,
  fileTitle: source.fileTitle,
  localFile: source.localFile,
  url: source.url,
  page: source.page,
  endPage: source.endPage,
  pageStart: source.pageStart,
  pageEnd: source.pageEnd,
  chunkIndex: source.chunkIndex,
  globalOrder: source.globalOrder,
  sourcePath: source.sourcePath,
  heading: compactHistoryText(source.heading, 180),
  label: source.label,
  text: compactHistoryText(source.text, MAX_STORED_SOURCE_TEXT_CHARS),
  kind: source.kind,
  score: source.score,
  contextOnly: source.contextOnly,
  storagePdfPath: source.storagePdfPath,
  storagePdfUrl: source.storagePdfUrl,
});

const stripTransientChatFields = (message: ChatMessage): ChatMessage => {
  const { adminDiagnostics, ...persisted } = message;
  if (!persisted.sources?.length) return persisted;
  return {
    ...persisted,
    sources: persisted.sources.slice(0, MAX_STORED_SOURCES_PER_MESSAGE).map(stripSourceForHistory),
  };
};

const toStoredChatMessages = (value: unknown): ChatMessage[] | null => {
  if (!Array.isArray(value)) return null;
  const messages = value
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== 'object') return false;
      const item = message as Partial<ChatMessage>;
      return (
        (item.role === 'assistant' || item.role === 'user') &&
        typeof item.content === 'string' &&
        typeof item.createdAt === 'number'
      );
    })
    .filter(isPersistableChatMessage)
    .map(stripTransientChatFields);
  return trimChatMessages(messages);
};

const toFirestoreSafeValue = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value
      .map(toFirestoreSafeValue)
      .filter((item) => item !== undefined);
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, toFirestoreSafeValue(item)] as const)
      .filter(([, item]) => item !== undefined),
  );
};

const getChatDocRef = (uid: string) => {
  // We use a root collection for all users' chat history.
  // This avoids placing heavy chat logs inside the user profile document itself.
  return doc(db, 'guidelineChatHistory', uid);
};

/**
 * Loads the user's chat history from Firestore.
 */
export const loadCloudChatHistory = async (uid: string): Promise<ChatMessage[] | null> => {
  if (!uid) return null;
  try {
    const docSnap = await getDoc(getChatDocRef(uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return toStoredChatMessages(data.messages);
    }
    return null;
  } catch {
    return null; // Silently fallback to local storage on error
  }
};

/**
 * Subscribes to the user's cloud chat history so devices stay in sync.
 */
export const subscribeCloudChatHistory = (
  uid: string,
  onChange: (messages: ChatMessage[] | null) => void,
  onError?: () => void,
): Unsubscribe => {
  if (!uid) return () => undefined;
  return onSnapshot(
    getChatDocRef(uid),
    (docSnap) => {
      if (!docSnap.exists()) {
        onChange(null);
        return;
      }
      const rawMessages = docSnap.data().messages;
      const messages = toStoredChatMessages(rawMessages);
      if (Array.isArray(rawMessages) && rawMessages.length > 0 && messages?.length === 0) {
        void deleteDoc(getChatDocRef(uid));
      }
      onChange(messages);
    },
    () => {
      onError?.();
    },
  );
};

/**
 * Saves the user's chat history to Firestore.
 */
export const saveCloudChatHistory = async (uid: string, messages: ChatMessage[]): Promise<void> => {
  if (!uid) return;
  try {
    const persistableMessages = messages.filter(isPersistableChatMessage);
    if (persistableMessages.length === 0) {
      return;
    }

    const trimmed = toFirestoreSafeValue(trimChatMessages(persistableMessages.map(stripTransientChatFields))) as ChatMessage[];
    await setDoc(getChatDocRef(uid), {
      messages: trimmed,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch {
    // Cloud history is best-effort; local storage remains the fallback.
  }
};

/**
 * Deletes the user's chat history document from Firestore.
 */
export const deleteCloudChatHistory = async (uid: string): Promise<void> => {
  if (!uid) return;
  try {
    await deleteDoc(getChatDocRef(uid));
  } catch {
    // Cloud history is best-effort; local storage remains the fallback.
  }
};
