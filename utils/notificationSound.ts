/**
 * Utility for notification sounds using Web Audio API without static audio files.
 * Uses one shared AudioContext for lower latency and consistent timing.
 */

type NotificationSoundCue =
  // أصوات عامة
  | 'info'                      // معلومة عامة (نغمة ناعمة)
  | 'success'                   // نجاح عام (3 نغمات صاعدة)
  | 'error'                     // خطأ (نغمات square تحذيرية)
  // أحداث المواعيد
  | 'new_appointment'           // موعد جديد وصل (3 نغمات sine صاعدة بهيجة)
  | 'appointment_saved'         // تم حفظ/تعديل موعد (success-like)
  | 'appointment_deleted'       // تم حذف موعد (نغمة square هابطة — حذر)
  // التواصل بين الطبيب والسكرتيرة
  | 'entry_request'             // طلب دخول (3 نغمات triangle — جرس انتباه)
  | 'entry_response_approved'   // موافقة (نغمتين sine صاعدتين)
  | 'entry_response_wait'       // انتظار (نغمتين sine هابطتين)
  | 'action_confirmed'          // تأكيد إرسال action (tick قصير)
  // الأحداث الإدارية
  | 'broadcast';                // إعلان عام (3 نغمات triangle)

type ToneShape = OscillatorType;

type ToneStep = {
  frequency: number;
  at: number;
  duration: number;
  gain: number;
  shape?: ToneShape;
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let audioContextRef: AudioContext | null = null;
let unlockListenersBound = false;
let autoplayBlockedWarningShown = false;

const UNLOCK_EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'click'];

/**
 * تصميم الأصوات:
 *   - sine: نغمة ناعمة (للأحداث الإيجابية والمحايدة)
 *   - triangle: نغمة متوسطة الحدة (للأحداث المهمة)
 *   - square: نغمة قوية حادة (للتحذيرات والأخطاء)
 *
 * النمط المتكرر:
 *   - نغمات صاعدة = إيجابي/بدء/موافقة
 *   - نغمات هابطة = تحذير/انتهاء/رفض
 *   - نغمات متناوبة = جرس انتباه (ring bell)
 */
const CUE_STEPS: Record<NotificationSoundCue, ToneStep[]> = {
  // ─── أصوات عامة ───
  info: [
    // نغمة ناعمة صاعدة — "معلومة"
    { frequency: 680, at: 0, duration: 0.08, gain: 0.07, shape: 'sine' },
    { frequency: 900, at: 0.1, duration: 0.1, gain: 0.08, shape: 'sine' },
  ],
  success: [
    // 3 نغمات triangle صاعدة — "تم بنجاح"
    { frequency: 660, at: 0, duration: 0.08, gain: 0.09, shape: 'triangle' },
    { frequency: 880, at: 0.1, duration: 0.09, gain: 0.10, shape: 'triangle' },
    { frequency: 1100, at: 0.21, duration: 0.12, gain: 0.09, shape: 'triangle' },
  ],
  error: [
    // 2 نغمات square هابطة حادة — "فشل/خطأ"
    { frequency: 460, at: 0, duration: 0.14, gain: 0.10, shape: 'square' },
    { frequency: 280, at: 0.16, duration: 0.22, gain: 0.09, shape: 'square' },
  ],

  // ─── أحداث المواعيد ───
  new_appointment: [
    // 3 نغمات sine صاعدة بهيجة — "موعد جديد 🎉"
    { frequency: 740, at: 0, duration: 0.08, gain: 0.10, shape: 'sine' },
    { frequency: 920, at: 0.1, duration: 0.08, gain: 0.11, shape: 'sine' },
    { frequency: 1120, at: 0.2, duration: 0.12, gain: 0.10, shape: 'sine' },
  ],
  appointment_saved: [
    // 3 نغمات triangle صاعدة — "تم حفظ الموعد"
    // (similar to success لكن أسرع — لتأكيد action فوري)
    { frequency: 620, at: 0, duration: 0.06, gain: 0.08, shape: 'triangle' },
    { frequency: 840, at: 0.08, duration: 0.07, gain: 0.09, shape: 'triangle' },
    { frequency: 1040, at: 0.17, duration: 0.09, gain: 0.08, shape: 'triangle' },
  ],
  appointment_deleted: [
    // 2 نغمات square هابطة — "حذف" (تحذير خفيف)
    { frequency: 520, at: 0, duration: 0.09, gain: 0.08, shape: 'square' },
    { frequency: 340, at: 0.11, duration: 0.14, gain: 0.07, shape: 'square' },
  ],

  // ─── التواصل بين الطبيب والسكرتيرة ───
  entry_request: [
    // 3 نغمات triangle بتناوب (تشبه جرس الباب) — "طلب دخول 🔔"
    { frequency: 620, at: 0, duration: 0.12, gain: 0.11, shape: 'triangle' },
    { frequency: 780, at: 0.14, duration: 0.12, gain: 0.12, shape: 'triangle' },
    { frequency: 620, at: 0.28, duration: 0.14, gain: 0.11, shape: 'triangle' },
  ],
  entry_response_approved: [
    // نغمتين sine صاعدتين بسرعة — "موافقة ✅"
    { frequency: 700, at: 0, duration: 0.10, gain: 0.10, shape: 'sine' },
    { frequency: 950, at: 0.12, duration: 0.14, gain: 0.10, shape: 'sine' },
  ],
  entry_response_wait: [
    // نغمتين sine هابطة — "انتظار ⏳"
    { frequency: 540, at: 0, duration: 0.11, gain: 0.09, shape: 'sine' },
    { frequency: 420, at: 0.14, duration: 0.16, gain: 0.09, shape: 'sine' },
  ],
  action_confirmed: [
    // نغمة sine واحدة قصيرة — "تم إرسال" (feedback خفيف لمنع ازدحام سمعي)
    { frequency: 820, at: 0, duration: 0.08, gain: 0.06, shape: 'sine' },
  ],

  // ─── إعلانات ───
  broadcast: [
    // 3 نغمات triangle صاعدة — "إعلان عام 📢"
    { frequency: 600, at: 0, duration: 0.08, gain: 0.09, shape: 'triangle' },
    { frequency: 880, at: 0.1, duration: 0.1, gain: 0.10, shape: 'triangle' },
    { frequency: 1180, at: 0.22, duration: 0.12, gain: 0.09, shape: 'triangle' },
  ],
};

const getAudioContextClass = (): (typeof AudioContext) | null => {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
};

const getSharedAudioContext = (): AudioContext | null => {
  if (audioContextRef) return audioContextRef;
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  audioContextRef = new AudioContextClass();
  return audioContextRef;
};

const removeUnlockListeners = () => {
  if (!unlockListenersBound || typeof window === 'undefined') return;
  UNLOCK_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, unlockAudioFromGesture);
  });
  unlockListenersBound = false;
};

const unlockAudioFromGesture = () => {
  void resumeNotificationAudio();
};

export function initNotificationSoundUnlockListeners(): void {
  if (typeof window === 'undefined' || unlockListenersBound) return;
  UNLOCK_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, unlockAudioFromGesture, { passive: true });
  });
  unlockListenersBound = true;
}

async function resumeNotificationAudio(): Promise<boolean> {
  const ctx = getSharedAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'running') {
    autoplayBlockedWarningShown = false;
    removeUnlockListeners();
    return true;
  }

  try {
    await ctx.resume();
    autoplayBlockedWarningShown = false;
    removeUnlockListeners();
    const resumedState = getSharedAudioContext()?.state;
    return resumedState === 'running';
  } catch {
    initNotificationSoundUnlockListeners();
    return false;
  }
}

const scheduleTone = (ctx: AudioContext, startAt: number, step: ToneStep) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const toneStart = startAt + Math.max(0, step.at);
  const toneEnd = toneStart + Math.max(0.03, step.duration);
  const maxGain = Math.max(0.0001, step.gain);

  osc.type = step.shape || 'sine';
  osc.frequency.setValueAtTime(step.frequency, toneStart);

  gain.gain.setValueAtTime(0.0001, toneStart);
  gain.gain.linearRampToValueAtTime(maxGain, toneStart + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(toneStart);
  osc.stop(toneEnd + 0.01);
};

export async function playNotificationCue(cue: NotificationSoundCue): Promise<void> {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const ready = await resumeNotificationAudio();
  if (!ready) {
    if (!autoplayBlockedWarningShown) {
      autoplayBlockedWarningShown = true;
      console.warn('Notification audio is blocked until the first user interaction on the page.');
    }
    return;
  }

  const steps = CUE_STEPS[cue] || CUE_STEPS.info;
  const startAt = ctx.currentTime + 0.005;
  steps.forEach((step) => scheduleTone(ctx, startAt, step));
}
