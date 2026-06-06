import { describe, expect, it } from 'vitest';
import type { GuidelineChatSourceChunk } from '../components/guidelines/guidelineChatSearch';
import {
  buildSmallTalkReply,
  isFollowUpQuestion,
  shouldPreferSearchRetrySources,
  shouldRetryGuidelineSearchWithModel,
  shouldReusePreviousSourcesForAnswer,
  shouldUseConversationContext,
  shouldUseModelReformulation,
} from '../components/guidelines/guidelinesChatUtils';

const source = (text: string, score = 120) => [{
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
  score,
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

  it('does not pin short standalone Arabic clinical questions to the last source', () => {
    const previousSources = source('Diabetic ketoacidosis DKA management in children and adolescents.');
    expect(shouldUseConversationContext({ question: 'علاج الربو في الحمل', previousSources })).toBe(false);
    expect(shouldUseConversationContext({ question: 'الضغط في الحمل', previousSources })).toBe(false);
    expect(shouldReusePreviousSourcesForAnswer({ question: 'علاج الربو في الحمل', previousSources })).toBe(false);
  });

  it('reuses previous sources only for real elliptical follow-ups', () => {
    const previousSources = source('Asthma MART therapy with ICS-formoterol and reliever dosing.');
    expect(shouldReusePreviousSourcesForAnswer({ question: 'جرعته كام؟', previousSources })).toBe(true);
    expect(shouldReusePreviousSourcesForAnswer({ question: 'فين المصدر؟', previousSources })).toBe(true);
  });

  it('uses model reformulation for high-value questions even when they are new topics', () => {
    expect(shouldUseModelReformulation({ question: 'علاج الضغط في الحمل', previousSources: [] })).toBe(true);
    expect(shouldUseModelReformulation({ question: 'amoxicillin dose in child', previousSources: [] })).toBe(true);
    expect(shouldUseModelReformulation({ question: 'asthma treatment', previousSources: [] })).toBe(false);
  });

  it('retries with model reformulation only when search confidence is weak', () => {
    expect(shouldRetryGuidelineSearchWithModel({
      question: 'asthma treatment',
      sources: [],
      alreadyReformulated: false,
    })).toBe(true);
    expect(shouldRetryGuidelineSearchWithModel({
      question: 'asthma treatment',
      sources: source('Asthma treatment guidance', 160),
      alreadyReformulated: false,
    })).toBe(false);
    expect(shouldRetryGuidelineSearchWithModel({
      question: 'amoxicillin dose in child',
      sources: source('Amoxicillin dosing guidance', 80),
      alreadyReformulated: false,
    })).toBe(true);
    expect(shouldRetryGuidelineSearchWithModel({
      question: 'asthma treatment',
      sources: [],
      alreadyReformulated: true,
    })).toBe(false);
  });

  it('keeps the first search unless retry evidence is meaningfully better', () => {
    expect(shouldPreferSearchRetrySources(source('Better source', 160), source('Weak source', 80))).toBe(true);
    expect(shouldPreferSearchRetrySources(source('Similar source', 90), source('Current source', 85))).toBe(false);
    expect(shouldPreferSearchRetrySources([], source('Current source', 85))).toBe(false);
  });

  it('uses the selected UI language for small talk regardless of question language', () => {
    expect(buildSmallTalkReply('شكرا', 'en')).toBe('You are welcome. Send the next clinical question and I will keep the same context.');
    expect(buildSmallTalkReply('thanks', 'ar')).toBe('العفو يا دكتور. ابعتلي الحالة أو السؤال اللي بعده ونكمل على نفس السياق.');
  });
});
