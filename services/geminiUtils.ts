import { generateGeminiContentSecure } from './secureGeminiGateway';

type GeminiJson = Record<string, any>;

export const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * الميزانية الافتراضية لوضع التفكير (Thinking Mode) في gemini-2.5-flash.
 * - `-1` = ديناميكية (الموديل بيقرر بنفسه حسب تعقيد الحالة).
 * - `0`  = بدون تفكير (أسرع، أقل جودة).
 * - رقم إيجابي = حد أقصى للـ tokens اللي الموديل يستخدمها للتفكير.
 *
 * اخترنا -1 عشان الحالات البسيطة تفضل سريعة، والحالات المعقدة (ex: أعراض
 * متشابكة، تشخيصات تفريقية) ياخدوا تفكير كافي. متوسط الزيادة في الـ latency
 * ~500ms في الحالات اللي الموديل بيقرر يفكر فيها.
 */
export const GEMINI_DEFAULT_THINKING_BUDGET = -1;

const cleanJsonString = (raw: string): string => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

export const tryParseJson = <T = GeminiJson>(raw: string): T | null => {
  const cleaned = cleanJsonString(raw);
  if (!cleaned) return null;
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
};

export const generateContentWithSecurity = async (
  prompt: string,
  opts?: {
    temperature?: number;
    model?: string;
    responseMimeType?: 'application/json' | 'text/plain';
    /** ميزانية التفكير — راجع `GEMINI_DEFAULT_THINKING_BUDGET` للتفاصيل. */
    thinkingBudget?: number;
  }
): Promise<string> => {
  const response = await generateGeminiContentSecure({
    prompt,
    model: opts?.model ?? GEMINI_MODEL,
    temperature: opts?.temperature ?? 0,
    responseMimeType: opts?.responseMimeType ?? 'application/json',
    thinkingBudget: opts?.thinkingBudget ?? GEMINI_DEFAULT_THINKING_BUDGET,
  });
  return response.text || '';
};

export const generateJson = async <T = GeminiJson>(
  prompt: string,
  opts?: { temperature?: number; model?: string; thinkingBudget?: number }
): Promise<T> => {
  const text = await generateContentWithSecurity(prompt, {
    temperature: opts?.temperature ?? 0,
    model: opts?.model ?? GEMINI_MODEL,
    responseMimeType: 'application/json',
    thinkingBudget: opts?.thinkingBudget ?? GEMINI_DEFAULT_THINKING_BUDGET,
  });

  const parsed = tryParseJson<T>(text);
  if (!parsed) {
    throw new Error('Unable to parse Gemini JSON response.');
  }
  return parsed;
};
