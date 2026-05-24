import { generateContentWithSecurity } from './geminiUtils';
import type {
  GuidelineChatResponseMode,
  GuidelineChatSourceChunk,
} from '../components/guidelines/guidelineChatSearch';
import { formatChunkCitation } from '../components/guidelines/guidelineChatSearch';
import type { GuidelineLanguage } from '../components/guidelines/guidelinesData';

type GenerateGuidelineChatAnswerParams = {
  question: string;
  language: GuidelineLanguage;
  mode: GuidelineChatResponseMode;
  chunks: GuidelineChatSourceChunk[];
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

const modeInstruction: Record<GuidelineChatResponseMode, string> = {
  concise: 'Answer briefly in 3-6 practical bullets, but include the key conditions and exceptions found in the excerpts.',
  detailed: 'Answer with a structured clinical explanation, but keep it source-grounded and avoid unnecessary verbosity.',
  table: 'Prefer a compact table when possible, then add short practical notes.',
  official: 'Prioritize the official wording. Separate any clinical interpretation from the official answer.',
};

const languageInstruction: Record<GuidelineLanguage, string> = {
  ar: 'Write the final answer in Arabic. Keep medical terms such as TSAT, eGFR, RRT, ESA, HIF-PHI in English when clearer.',
  en: 'Write the final answer in English.',
};

const buildSourceBlock = (chunks: GuidelineChatSourceChunk[], language: GuidelineLanguage) =>
  chunks.map((chunk, index) => {
    const citation = formatChunkCitation(chunk, language);
    return [
      `[S${index + 1}] ${citation}`,
      `Kind: ${chunk.kind}`,
      `Text: ${chunk.text.slice(0, 2400)}`,
    ].join('\n');
  }).join('\n\n---\n\n');

const buildHistoryBlock = (history: GenerateGuidelineChatAnswerParams['history']) => {
  if (!history?.length) return 'No prior conversation.';
  return history
    .slice(-6)
    .map((item) => `${item.role.toUpperCase()}: ${item.content.slice(0, 900)}`)
    .join('\n');
};

export const generateGuidelineChatAnswer = async ({
  question,
  language,
  mode,
  chunks,
  history,
}: GenerateGuidelineChatAnswerParams): Promise<string> => {
  const sourceBlock = buildSourceBlock(chunks, language);
  const prompt = `
You are Dr. Hyper Guidelines Assistant.

Rules:
- Use ONLY the provided guideline source excerpts.
- First understand the user's intent across Arabic, English, Arabizi, abbreviations, and common medical shorthand.
- Synthesize across all relevant excerpts before answering; do not behave like a rigid keyword matcher.
- You may explain, interpret, compare, and translate the guideline meaning in a physician-friendly way, but every factual clinical claim must be grounded in the excerpts.
- Prefer a useful direct answer over saying "not available" when the excerpts contain a partial or indirect answer.
- If the excerpts partially answer the question, give the supported part and clearly say what is not covered.
- If the answer is not supported by the excerpts, say that the added guidelines do not contain enough information.
- Do not invent thresholds, doses, grades, page numbers, or recommendations.
- Cite sources inline as [S1], [S2], etc.
- Distinguish Recommendation from Practice Point when the source says so.
- If a source is a draft, mention draft status when relevant.
- Do not use web knowledge or general medical memory.
- Keep the answer clinically useful and safe.

Language:
${languageInstruction[language]}

Response style:
${modeInstruction[mode]}

Conversation context:
${buildHistoryBlock(history)}

Question:
${question}

Guideline source excerpts:
${sourceBlock}
`.trim();

  return generateContentWithSecurity(prompt, {
    model: 'gemini-2.5-flash',
    temperature: 0,
    responseMimeType: 'text/plain',
    thinkingBudget: -1,
    feature: 'guidelines_chat',
  });
};
