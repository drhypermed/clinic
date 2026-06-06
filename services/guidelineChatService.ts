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
  answerMode?: 'guideline-first' | 'general-medical';
  doctorSpecialty?: string | null;
};

const modeInstruction: Record<GuidelineChatResponseMode, string> = {
  clinical: 'Answer like a senior clinical tutor: start with the direct practical answer, then give the scientific explanation, key exceptions, and a short action-oriented takeaway.',
  concise: 'Answer extremely briefly in a maximum of 3 to 5 short lines. Do not use bullet points unless necessary. Start directly with the answer, include only the key conditions, and strictly avoid long background explanations or theory.',
  detailed: 'Answer with a structured clinical explanation, but keep it source-grounded and avoid unnecessary verbosity.',
  table: 'Prefer a compact table when possible, then add short practical notes.',
  official: 'Prioritize the official wording. Separate any clinical interpretation from the official answer.',
};

const languageInstruction: Record<GuidelineLanguage, string> = {
  ar: 'Mandatory output language: Egyptian colloquial Arabic with a professional clinical tone. Do not answer in English except for standard medical abbreviations, drug names, lab names, or short quoted terms. Keep it natural for an Egyptian doctor: say phrases like "يا دكتور", "خلّي بالك", "عمليًا", "لو الحالة كذا" when appropriate, without slang that feels unserious. Keep medical abbreviations such as TSAT, eGFR, RRT, ESA, HIF-PHI, MART in English when clearer. Use right-to-left friendly formatting.',
  en: 'Mandatory output language: English only. The selected app language is English, so every user-facing sentence, heading, note, safety warning, practical point, and fallback explanation must be in English regardless of whether the user writes Arabic, mixed Arabic/English, or Arabizi. Do not answer in Arabic, translate Arabic user intent into English silently, and only preserve Arabic inside very short quoted user terms when strictly necessary. Use smooth scientific clinical English and left-to-right formatting.',
};

const buildSourceBlock = (
  chunks: GuidelineChatSourceChunk[],
  language: GuidelineLanguage,
  options: { maxChunks: number; primaryTextLimit: number; contextTextLimit: number },
) =>
  chunks.length === 0 ? 'No retrieved guideline excerpts were found for this turn.' : chunks.slice(0, options.maxChunks).map((chunk, index) => {
    const citation = formatChunkCitation(chunk, language);
    const textLimit = chunk.contextOnly ? options.contextTextLimit : options.primaryTextLimit;
    return [
      `[S${index + 1}] ${citation}`,
      `Kind: ${chunk.kind}`,
      chunk.heading ? `Heading: ${chunk.heading}` : '',
      chunk.chunkIndex ? `Book chunk: ${chunk.chunkIndex}` : '',
      typeof chunk.score === 'number' && Number.isFinite(chunk.score) ? `Retrieval score: ${chunk.score}` : '',
      chunk.intentTags?.length ? `Matched intent: ${chunk.intentTags.slice(0, 5).join(', ')}` : '',
      chunk.concepts?.length ? `Matched concepts: ${chunk.concepts.slice(0, 5).join(', ')}` : '',
      chunk.contextOnly ? 'Role: neighboring context for continuity' : 'Role: primary retrieved source',
      `Text: ${chunk.text.slice(0, textLimit)}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n---\n\n');

const buildHistoryBlock = (history: GenerateGuidelineChatAnswerParams['history']) => {
  if (!history?.length) return 'No prior conversation.';
  return history
    .slice(-5)
    .map((item) => `${item.role.toUpperCase()}: ${item.content.slice(0, item.role === 'assistant' ? 650 : 420)}`)
    .join('\n');
};

const inferAnswerPlan = (question: string) => {
  const q = question.toLowerCase();
  return {
    isComparison: /\b(vs|versus|compare|difference|ada.*kdigo|kdigo.*ada|gina.*easl|easl.*gina)\b/i.test(q)
      || ['فرق', 'قارن', 'مقارنة'].some((token) => question.includes(token)),
    isHighRisk: /\b(dose|dosage|contraindication|avoid|emergency|acute|severe|shock|bleeding|dka|hhs|hyperkalemia)\b/i.test(q)
      || ['جرعة', 'ممنوع', 'نزيف', 'حاد', 'طوارئ'].some((token) => question.includes(token)),
  };
};

const getAnswerThinkingBudget = (
  mode: GuidelineChatResponseMode,
  answerPlan: ReturnType<typeof inferAnswerPlan>,
  chunks: GuidelineChatSourceChunk[],
) => {
  if (mode === 'concise') return 512;
  if (answerPlan.isHighRisk || answerPlan.isComparison || mode === 'detailed' || mode === 'table' || mode === 'official') return 3072;
  if (chunks.length === 0) return 2048;
  return 1536;
};

const getSourcePromptBudget = (
  answerPlan: ReturnType<typeof inferAnswerPlan>,
  mode: GuidelineChatResponseMode,
) => {
  if (answerPlan.isComparison) return { maxChunks: 8, primaryTextLimit: 1600, contextTextLimit: 650 };
  if (answerPlan.isHighRisk || mode === 'detailed' || mode === 'official') return { maxChunks: 6, primaryTextLimit: 1600, contextTextLimit: 600 };
  if (mode === 'concise') return { maxChunks: 5, primaryTextLimit: 1000, contextTextLimit: 450 };
  return { maxChunks: 6, primaryTextLimit: 1300, contextTextLimit: 500 };
};

export const reformulateGuidelineQuery = async (
  currentQuestion: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ isFollowUp: boolean; reformulatedQuery: string; shouldClearSources: boolean }> => {
  if (!history || history.length === 0) {
    return { isFollowUp: false, reformulatedQuery: currentQuestion, shouldClearSources: true };
  }

  const historyBlock = buildHistoryBlock(history);
  const prompt = `
You are a clinical query reformulator.
Your job is to analyze the user's latest message in the context of the prior conversation.
Determine if the latest message is a follow-up to the current clinical topic, or if it introduces a completely new topic.

Rules:
1. If the user asks something like "الجرعة؟" (dose?), "في الاطفال؟" (in children?), "why?", or "what about pregnancy?", this is a follow-up.
2. If the user asks about a completely different disease or drug not related to the previous context, this is a new topic.
3. If it is a follow-up, reformulate the query so it is standalone and clear for a semantic search engine. For example, if the previous topic was "Metformin in diabetes" and the user says "الجرعة؟", the reformulated query should be "جرعة الميتفورمين في مرض السكري". Keep the reformulated query in the same language as the user's latest message.
4. If it is a new topic, the reformulated query should just be the new question, improved for search if necessary.
5. Provide your response as a pure JSON object without markdown formatting.

Format:
{
  "isFollowUp": boolean,
  "reformulatedQuery": "string",
  "shouldClearSources": boolean // true if it's a completely new topic, false if it's a follow-up
}

Conversation History:
${historyBlock}

Latest User Message:
${currentQuestion}
  `.trim();

  try {
    const response = await generateContentWithSecurity(prompt, {
      model: 'gemini-2.5-flash',
      temperature: 0,
      responseMimeType: 'application/json',
      thinkingBudget: 0,
      feature: 'guidelines_chat',
    });

    const parsed = JSON.parse(response);
    return {
      isFollowUp: Boolean(parsed.isFollowUp),
      reformulatedQuery: parsed.reformulatedQuery || currentQuestion,
      shouldClearSources: Boolean(parsed.shouldClearSources),
    };
  } catch {
    return { isFollowUp: false, reformulatedQuery: currentQuestion, shouldClearSources: true };
  }
};

export const generateGuidelineChatAnswer = async ({
  question,
  language,
  mode,
  chunks,
  history,
  answerMode = chunks.length > 0 ? 'guideline-first' : 'general-medical',
  doctorSpecialty,
}: GenerateGuidelineChatAnswerParams): Promise<string> => {
  const answerPlan = inferAnswerPlan(question);
  const sourceBlock = buildSourceBlock(chunks, language, getSourcePromptBudget(answerPlan, mode));
  const specialty = (doctorSpecialty || '').trim();
  const specialtyInstruction = specialty
    ? `Doctor specialty context: The user is a ${specialty} physician. Use this only to tune explanation style, terminology, practical caveats, and what a doctor in this specialty is likely to care about. The specialty is NOT the topic of the user's question unless the user asks about it. Do not force answers into the doctor's specialty, and do not invent specialty-specific facts.`
    : 'Doctor specialty context: Not provided. Use broad clinical framing and avoid assuming a specialty.';
  const prompt = `
You are the Smart Medical Assistant (Arabic product name: "المساعد الطبي الذكي").

Rules:
- The selected app response language is ${language === 'ar' ? 'Arabic' : 'English'}. This selected app language overrides the language of the user's question, the language of retrieved sources, the doctor profile language, and previous chat language.
- All user-facing assistant output must be in the selected app response language. Do not switch languages to match the user's latest message.
- Never introduce yourself as "Dr. Hyper Guidelines Assistant".
- Do not greet with a fixed mission statement or a fixed disease area. Answer the user's actual question directly.
- In Arabic mode, always use natural Egyptian clinical Arabic, even if the user's wording is formal Arabic. Keep it respectful and doctor-to-doctor.
- Never assume a disease, body system, guideline file, or specialty that the user did not mention unless the retrieved source text clearly proves that is the right topic.
- Use prior conversation only when the current user message is clearly a follow-up. If the current message introduces a new disease, drug, population, protocol, or clinical problem, treat it as a new question and ignore prior topic/source bias.
- First understand the user's intent across Arabic, English, Arabizi, abbreviations, and common medical shorthand.
- The assistant is guideline-first, not guideline-only.
- The retrieved source excerpts were gathered by searching across the uploaded guideline library first. Treat them as the primary evidence set for this turn.
- First synthesize across the retrieved guideline excerpts, if any; do not behave like a rigid keyword matcher.
- If the user's question has multiple parts, map each part to the available source excerpts separately. Use citations for every part that is supported, even if other parts need general reasoning.
- Treat retrieved excerpts as ordered book context. If adjacent chunks are present, use them to resolve incomplete sentences, tables, thresholds, and exceptions.
- Use the doctor's specialty context to make the answer feel like a specialist colleague speaking to that doctor.
- If the user asks a follow-up such as "in children?", "what about pregnancy?", or "why?", combine the prior conversation with the current question before answering.
- If the current question is conversational or elliptical, such as "explain more", "what do you mean?", "طب عمليًا؟", "وضح", "كمل", infer it from the recent conversation and the provided sources. Do not say the exact phrase is not found.
- Keep continuity: refer back to the prior answer/topic naturally when the user is continuing the same discussion.
- When neighboring excerpts from the same book are provided, use them as ordered context and cite the exact source numbers you use.
- You may explain, interpret, compare, and translate guideline meaning in a physician-friendly way.
- Prefer a useful direct answer over saying "not available".
- Cite source-grounded claims inline as [S1], [S2], etc.
- If the retrieved excerpts partially answer the question, answer the supported part first with citations, then add a short separate section called "Outside uploaded guideline text" for the missing practical explanation. Do not discard a useful guideline source just because it answers only part of the question.
- If no relevant guideline excerpt is retrieved, do NOT stop. Start with one concise line saying the uploaded/retrieved guideline text did not contain a clear source for this exact point, then answer using trusted specialist medical knowledge and standard clinical references from outside the uploaded text. Clearly label that section as not sourced from the uploaded guidelines.
- If the user asks for the source, reference, or page number (e.g., "فين المصدر", "where is this from"), explicitly provide the exact citation, heading, and page number from the provided excerpts that support the previous answer. Do NOT say the information is missing.
- Do not invent page numbers, grades, or citations.
- For thresholds, doses, and protocols not present in retrieved guidelines, only give them in the clearly labeled outside-uploaded-guideline reasoning section and advise checking local protocol/primary source.
- Accuracy guardrail: if an exact dose, threshold, duration, staging criterion, or protocol step is not in retrieved guideline excerpts and you are not confident from standard medical knowledge, say what needs verification instead of guessing.
- For high-risk or patient-specific decisions, ask for the missing critical variables when needed (age, weight, pregnancy, renal/hepatic function, vitals, severity, contraindications, interacting drugs), while still giving the safest general framework.
- Never fabricate a citation marker for general reasoning. Use [S#] only for retrieved guideline excerpts.
- Do not overstate certainty. Use phrases like "from the retrieved guideline text" and "outside uploaded guideline text" to separate evidence levels.
- Distinguish Recommendation from Practice Point when the source says so.
- If a source is a draft, mention draft status when relevant.
- Keep the answer clinically useful and safe.
- End with a short "Practical point" when the answer is not in official-text mode.
- Evidence discipline: every claim based on retrieved guidelines needs a source marker; every unsourced clinical claim must be explicitly labeled as outside uploaded guideline text, not guideline text.
- If a claim is useful but only indirectly supported, label it as an interpretation and cite the source that supports the interpretation.
- If sources disagree or come from different guideline schools/years, show the difference explicitly instead of merging them into one vague statement.
- If the question is high-risk, include a concise clinical-safety note about applying the guideline to the individual patient's vitals, labs, comorbidities, and local protocols.
- If the question asks for comparison, answer with a compact comparison table: guideline/source, recommendation, agreement, difference, clinical implication, citation.
- Choose the clinical answer template from the user's intent:
  * Diagnosis: criteria, thresholds, confirmation, exceptions, citations.
  * Treatment: first-line action, alternatives, contraindications/cautions, monitoring, citations.
  * Emergency/high-risk: immediate steps, escalation triggers, monitoring, safety note, citations.
  * Monitoring/follow-up: what to monitor, timing/frequency if present, what changes management, citations.
  * Comparison: compact table, agreement, differences, clinical implication, citations.
- Keep the final answer concise enough for a clinician in practice; do not expand unless detailed/scientific mode asks for it.
- Format the response in clean Markdown:
  * Use short section headings with **bold** labels or Markdown headings.
  * Use bullet lists for steps and exceptions.
  * Use Markdown tables for comparisons, thresholds, or multi-column recommendations.
  * Keep each paragraph short and scannable.

Language:
${languageInstruction[language]}

${specialtyInstruction}

Response style:
${modeInstruction[mode]}

Detected answer plan:
- comparison: ${answerPlan.isComparison ? 'yes' : 'no'}
- high-risk clinical use: ${answerPlan.isHighRisk ? 'yes' : 'no'}
- answer mode: ${answerMode}
- retrieved guideline excerpts: ${chunks.length}

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
    thinkingBudget: getAnswerThinkingBudget(mode, answerPlan, chunks),
    feature: 'guidelines_chat',
  });
};
