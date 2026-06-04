import { describe, expect, it } from 'vitest';
import type { GuidelineChatSourceChunk } from '../components/guidelines/guidelineChatSearch';
import { buildSmallTalkReply, isFollowUpQuestion, shouldUseConversationContext } from '../components/guidelines/guidelinesChatUtils';

const source = (text: string) => [{
  id: 's1',
  collectionId: 'test',
  collectionTitle: 'Test collection',
  school: 'TEST',
  year: 2026,
  label: 'Test source',
  kind: 'full-text' as const,
  sourceTitle: 'Previous source',
  fileTitle: 'Previous file',
  text,
}] satisfies GuidelineChatSourceChunk[];

describe('guidelines chat follow-up detection', () => {
  it('does not treat a short standalone clinical question as a follow-up', () => {
    expect(isFollowUpQuestion('child 5 years with DKA')).toBe(false);
    expect(isFollowUpQuestion('طفل 5 سنين عنده DKA')).toBe(false);
  });

  it('keeps explicit follow-up questions attached to the previous topic', () => {
    expect(isFollowUpQuestion('why?')).toBe(true);
    expect(isFollowUpQuestion('in children?')).toBe(true);
    expect(isFollowUpQuestion('فين المصدر؟')).toBe(true);
  });

  it('uses context for real follow-ups and population refinements', () => {
    const previousSources = source('Diabetic ketoacidosis DKA management in children and adolescents.');
    expect(shouldUseConversationContext({ question: 'طب طفل 5 سنين؟', previousSources })).toBe(true);
    expect(shouldUseConversationContext({ question: 'جرعته كام؟', previousSources })).toBe(true);
    expect(shouldUseConversationContext({ question: 'DKA in child 5 years', previousSources })).toBe(true);
  });

  it('does not reuse old context when a new clinical anchor appears', () => {
    const previousSources = source('Postmenopausal osteoporosis fracture risk assessment and bisphosphonate therapy.');
    expect(shouldUseConversationContext({ question: 'child 5 years with DKA', previousSources })).toBe(false);
    expect(shouldUseConversationContext({ question: 'جرعة amoxicillin', previousSources })).toBe(false);
  });

  it('uses the selected UI language for small talk regardless of question language', () => {
    expect(buildSmallTalkReply('شكرا', 'en')).toBe('You are welcome. Send the next clinical question and I will keep the same context.');
    expect(buildSmallTalkReply('thanks', 'ar')).toBe('العفو يا دكتور. ابعتلي الحالة أو السؤال اللي بعده ونكمل على نفس السياق.');
  });
});
