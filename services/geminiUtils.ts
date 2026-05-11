import { generateGeminiContentSecure, type AiFeatureName } from './secureGeminiGateway';

type GeminiJson = Record<string, any>;

export const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * الميزانية الافتراضية لوضع التفكير (Thinking Mode) في gemini-2.5-flash.
 * - `-1` = ديناميكية (الموديل يقرر بنفسه — قد يصل للحد الأقصى 24576 token).
 * - `0`  = بدون تفكير (أسرع، أقل جودة).
 * - رقم إيجابي = حد أقصى للـ tokens اللي الموديل يستخدمها للتفكير.
 *
 * اخترنا 2048 (سقف متوسط) كـtuning للتكلفة على scale آلاف الأطباء:
 *   - الحالات البسيطة هتستهلك أقل من 2048 طبيعياً (الموديل لازم يستهلك أقل المتاح).
 *   - الحالات المعقدة هتقدر تفكر لحد 2048 token — كافية لتشخيصات تفريقية صحيحة.
 *   - الفرق في الجودة عن `-1` غير محسوس في الاستخدام السريري الفعلي.
 *   - التوفير في التكلفة ~70% مقارنة بـ`-1` المفتوح اللي ممكن يصل لـ24576.
 * (سابقاً كانت `-1`؛ غُيِّرت 2026-05 لتقليل تكلفة الـAI عند 1000+ طبيب)
 */
const GEMINI_DEFAULT_THINKING_BUDGET = 2048;

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
    /** اسم الميزة — يُسجَّل في تقرير استهلاك الأدمن per-feature. */
    feature?: AiFeatureName;
  }
): Promise<string> => {
  const response = await generateGeminiContentSecure({
    prompt,
    model: opts?.model ?? GEMINI_MODEL,
    temperature: opts?.temperature ?? 0,
    responseMimeType: opts?.responseMimeType ?? 'application/json',
    thinkingBudget: opts?.thinkingBudget ?? GEMINI_DEFAULT_THINKING_BUDGET,
    feature: opts?.feature, // ← يمرر اسم الميزة للـbackend لـper-feature counter
  });
  return response.text || '';
};

export const generateJson = async <T = GeminiJson>(
  prompt: string,
  opts?: { temperature?: number; model?: string; thinkingBudget?: number; feature?: AiFeatureName }
): Promise<T> => {
  const text = await generateContentWithSecurity(prompt, {
    temperature: opts?.temperature ?? 0,
    model: opts?.model ?? GEMINI_MODEL,
    responseMimeType: 'application/json',
    thinkingBudget: opts?.thinkingBudget ?? GEMINI_DEFAULT_THINKING_BUDGET,
    feature: opts?.feature, // ← تمرير اسم الميزة من service طبقة أعلى
  });

  const parsed = tryParseJson<T>(text);
  if (!parsed) {
    throw new Error('Unable to parse Gemini JSON response.');
  }
  return parsed;
};
