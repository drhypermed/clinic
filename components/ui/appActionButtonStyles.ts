export type AppActionButtonTone = 'blue' | 'green' | 'danger' | 'neutral';

const APP_ACTION_BUTTON_TONE_CLASSES: Record<AppActionButtonTone, string> = {
  // Matches the common action look used in the New Exam page.
  blue: 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-600 text-white border border-blue-700 shadow-[0_12px_22px_-16px_rgba(15,23,42,0.42),0_1px_4px_rgba(15,23,42,0.2)]',
  green: 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border border-emerald-700 shadow-[0_12px_22px_-16px_rgba(15,23,42,0.42),0_1px_4px_rgba(15,23,42,0.2)]',
  danger: 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-red-700 shadow-[0_12px_22px_-16px_rgba(15,23,42,0.42),0_1px_4px_rgba(15,23,42,0.2)]',
  neutral: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300',
};

export const getAppActionButtonToneClass = (tone: AppActionButtonTone): string => APP_ACTION_BUTTON_TONE_CLASSES[tone];
