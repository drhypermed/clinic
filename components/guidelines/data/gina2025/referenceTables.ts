import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_REFERENCE_TABLES_TOPICS: GuidelineTopic[] = [
  {
    id: 'reference-ics-doses-adults',
    group: 'ginaReferenceTables',
    title: {
      en: 'ICS Daily Doses for Adults & Adolescents (Table 6)',
      ar: 'جرعات الكورتيزون اليومية للبالغين والمراهقين (جدول 6)',
    },
    summary: {
      en: 'Standard classification of Low, Medium, and High daily doses for common Inhaled Corticosteroids in adults.',
      ar: 'التقسيم القياسي لجرعات الكورتيزون المستنشق (منخفضة، متوسطة، وعالية) للبالغين لضبط الروشتة.',
    },
    points: {
      en: [
        'Budesonide (DPI/pMDI): Low (200-400 mcg), Medium (>400-800 mcg), High (>800 mcg).',
        'Fluticasone propionate (DPI/pMDI): Low (100-250 mcg), Medium (>250-500 mcg), High (>500 mcg).',
        'Beclometasone dipropionate (pMDI standard): Low (200-500 mcg), Medium (>500-1000 mcg), High (>1000 mcg).',
        'Beclometasone dipropionate (extrafine): Low (100-200 mcg), Medium (>200-400 mcg), High (>400 mcg).',
        'Note: Most clinical benefit is achieved at LOW doses. High doses are rarely needed and increase side effects.',
      ],
      ar: [
        'الجرعة المنخفضة من الكورتيزون (ICS) توفر معظم الفائدة السريرية لأغلب المرضى. الجرعات العالية تزيد من خطر الأعراض الجانبية ولا يُلجأ إليها إلا نادراً.',
        'Budesonide: البالغون (منخفض: 200-400، متوسط: >400-800، عالٍ: >800). الأطفال (منخفض: 100-200، متوسط: >200-400، عالٍ: >400).',
        'Fluticasone propionate: البالغون (منخفض: 100-250، متوسط: >250-500، عالٍ: >500). الأطفال (منخفض: 50-100، متوسط: >100-200، عالٍ: >200).',
        'Beclometasone dipropionate extrafine: البالغون (منخفض: 100-200، متوسط: >200-400، عالٍ: >400). الأطفال (منخفض: 50-100، متوسط: >100-200، عالٍ: >200).',
        'فلوتيكازون فيورات: البالغين (منخفض: 100، عالي: 200). الأطفال (منخفض: 50).',
        'يجب دائماً استخدام قمع (Spacer) مع البخاخات المضغوطة (pMDI).',
      ],
    },
    sourceIds: ['gina-2025-tables'], // Fallback for reference tables digest index
    tags: ['doses', 'ICS', 'budesonide', 'fluticasone'],
  },
  {
    id: 'reference-air-mart',
    group: 'ginaReferenceTables',
    title: {
      en: 'Low-dose ICS-formoterol options for AIR/MART (Table 7)',
      ar: 'خيارات بخاخات المسار الأول (AIR/MART) بجرعة منخفضة (جدول 7)',
    },
    summary: {
      en: 'Available options and recommended dosages for Anti-Inflammatory Reliever (AIR) and Maintenance And Reliever Therapy (MART).',
      ar: 'الخيارات المتاحة والجرعات الموصى بها لاستخدام بخاخة واحدة كعلاج وقائي وإسعافي.',
    },
    points: {
      en: [
        'Budesonide-formoterol 200/6 [160/4.5] DPI or pMDI: Low-dose MART for adults is 1 inhalation twice or once daily. Maximum 12 total inhalations/day.',
        'Beclometasone-formoterol (100/6 DPI or pMDI): Low-dose MART for adults is 1 inhalation twice or once daily. GINA suggests a maximum of 12 total inhalations/day for MART if needed.',
      ],
      ar: [
        'بوديزونيد-فورموتيرول (تركيز 100/6): للأطفال (6-11 سنة) في درجات 3 و 4. بحد أقصى (8 بخات) في اليوم الواحد.',
        'Budesonide-formoterol 200/6 [160/4.5] DPI أو pMDI: للبالغين والمراهقين، بحد أقصى 12 بخة في اليوم الواحد.',
        'بيكلوميثازون-فورموتيرول (تركيز 100/6): للبالغين كـ MART. تقترح GINA حدًا أقصى 12 بخة إجمالية في اليوم عند الحاجة، بناءً على بيانات أمان الفورموتيرول.',
        'إذا شعر المريض بحاجته لعدد بخات إسعافية يتجاوز هذا الحد الأقصى، يجب عليه التوجه للطوارئ أو الطبيب (في نفس اليوم) فوراً.',
        'ملاحظة: budesonide-formoterol غير موصى به كـ MART في الخطوة 5 للأطفال.',
      ],
    },
    sourceIds: ['gina-2025-tables'],
    tags: ['MART', 'AIR', 'budesonide-formoterol', 'beclometasone-formoterol', 'doses'],
  }
];
