import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteDoc, setDoc } from 'firebase/firestore';
import {
  deleteCloudChatHistory,
  isLegacyCorruptedWelcomeMessage,
  MAX_STORED_CHAT_MESSAGES,
  saveCloudChatHistory,
} from '../../services/guidelineChatHistoryService';
import type { ChatMessage } from '../../components/guidelines/guidelinesChatUtils';

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: overrides.id || `msg-${Math.random()}`,
  role: overrides.role || 'assistant',
  content: overrides.content || 'content',
  createdAt: overrides.createdAt || Date.now(),
  ...overrides,
});

const makeMojibake = (value: string): string =>
  new TextDecoder('windows-1252').decode(new TextEncoder().encode(value));

describe('guidelineChatHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not persist the welcome message by itself', async () => {
    await saveCloudChatHistory('uid-1', [
      makeMessage({ id: 'welcome-ar', content: 'أهلا بك يا دكتور' }),
    ]);

    expect(deleteDoc).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('does not persist transient thinking messages', async () => {
    await saveCloudChatHistory('uid-1', [
      makeMessage({ id: 'welcome-ar' }),
      makeMessage({ id: 'thinking-1', status: 'thinking' }),
    ]);

    expect(deleteDoc).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('does not persist streaming partial assistant responses', async () => {
    await saveCloudChatHistory('uid-1', [
      makeMessage({ role: 'user', content: 'question' }),
      makeMessage({ id: 'assistant-streaming', status: 'streaming', content: 'partial answer' }),
    ]);

    expect(deleteDoc).not.toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(setDoc).mock.calls[0][1] as { messages: ChatMessage[] };
    expect(payload.messages).toHaveLength(1);
    expect(payload.messages[0].role).toBe('user');
    expect(payload.messages[0].content).toBe('question');
  });

  it('does not persist legacy mojibake welcome messages', async () => {
    const legacyWelcome = makeMojibake(makeMojibake(
      'أهلا بك يا دكتور عبدالرحمن جمال. جاهز لمساعدتك في أي سؤال في تخصص الباطنة العامة. هبحث أولا في الجايدلاينز المرفوعة',
    ));

    expect(isLegacyCorruptedWelcomeMessage(makeMessage({ content: legacyWelcome }))).toBe(true);
    await saveCloudChatHistory('uid-1', [
      makeMessage({ id: 'old-random-id', content: legacyWelcome }),
    ]);

    expect(deleteDoc).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('deletes the cloud history document when chat is explicitly cleared', async () => {
    await deleteCloudChatHistory('uid-1');

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('persists only real chat messages and keeps the max history limit', async () => {
    const messages = Array.from({ length: MAX_STORED_CHAT_MESSAGES + 5 }, (_, index) =>
      makeMessage({ id: `msg-${index}`, content: `message ${index}`, createdAt: index }),
    );

    await saveCloudChatHistory('uid-1', [
      makeMessage({ id: 'welcome-ar' }),
      ...messages,
    ]);

    expect(deleteDoc).not.toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(setDoc).mock.calls[0][1] as { messages: ChatMessage[] };
    expect(payload.messages).toHaveLength(MAX_STORED_CHAT_MESSAGES);
    expect(payload.messages[0].id).toBe('msg-5');
    expect(payload.messages.at(-1)?.id).toBe(`msg-${MAX_STORED_CHAT_MESSAGES + 4}`);
  });
});
