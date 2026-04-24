import type { ToolTone } from './ToolCard';

// ألوان بطاقات أدوات الأدوية. فحص التداخلات وفحص الحمل اتنقلوا لـ"كشف جديد"
// فشلناهم من هنا — المتبقي بس جرعات الكلى + تعديل معلومات الأدوية.
export const TOOL_TONES: Record<'renal' | 'edit', ToolTone> = {
  renal: {
    gradient: 'bg-gradient-to-br from-emerald-600 to-green-700',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)]',
  },
  edit: {
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-700',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)]',
  },
};
