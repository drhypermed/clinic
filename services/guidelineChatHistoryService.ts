import { deleteDoc, doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { ChatMessage } from '../components/guidelines/guidelinesChatUtils';
import { normalizeText } from '../utils/textEncoding';

export const MAX_STORED_CHAT_MESSAGES = 50;

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
    .filter(isPersistableChatMessage);
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

    const trimmed = toFirestoreSafeValue(trimChatMessages(persistableMessages)) as ChatMessage[];
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
