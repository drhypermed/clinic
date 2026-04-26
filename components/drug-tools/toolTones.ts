import type { ToolTone } from './ToolCard';

// ألوان بطاقات أدوات الأدوية. فحص التداخلات وفحص الحمل اتنقلوا لـ"كشف جديد"
// فشلناهم من هنا — المتبقي بس جرعات الكلى + تعديل معلومات الأدوية.
export const TOOL_TONES: Record<'renal' | 'edit', ToolTone> = {
  renal: {
    gradient: 'bg-gradient-to-br from-success-600 to-success-700',
    shadow: 'shadow-cta',
  },
  edit: {
    gradient: 'bg-gradient-to-br from-success-600 to-success-700',
    shadow: 'shadow-cta',
  },
};
