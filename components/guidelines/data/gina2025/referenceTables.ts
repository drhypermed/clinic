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
        'بوديزونيد (Budesonide): الجرعة المنخفضة (200-400 ميكروجرام)، المتوسطة (أكثر من 400 إلى 800)، العالية (أكثر من 800).',
        'فلوتيكازون (Fluticasone propionate): الجرعة المنخفضة (100-250 ميكروجرام)، المتوسطة (أكثر من 250 إلى 500)، العالية (أكثر من 500).',
        'بيكلوميثازون العادي: المنخفضة (200-500 ميكروجرام)، المتوسطة (أكثر من 500 إلى 1000)، العالية (أكثر من 1000).',
        'بيكلوميثازون الجزيئات الدقيقة (Extrafine): المنخفضة (100-200 ميكروجرام)، المتوسطة (أكثر من 200 إلى 400)، العالية (أكثر من 400).',
        'ملاحظة هامة: معظم الفائدة العلاجية تتحقق بالجرعات المنخفضة. الجرعات العالية نادراً ما تكون ضرورية وتزيد فقط من الأعراض الجانبية.',
      ],
    },
    sourceIds: ['gina-2025-intro'], // Fallback for reference tables digest index
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
        'Budesonide-formoterol (Turbuhaler 200/6 or pMDI 200/6): Low-dose MART for adults is 1 inhalation twice daily. Maximum 12 total inhalations/day.',
        'Beclometasone-formoterol (pMDI 100/6 extrafine): Low-dose MART for adults is 1 inhalation twice daily. Maximum 8 total inhalations/day.',
        'Mometasone-formoterol is also an option for AIR/MART in some regions.',
      ],
      ar: [
        'بوديزونيد-فورموتيرول (مثل سيمبيكورت 200/6): الجرعة المنخفضة كوقاية وإسعاف معاً للبالغين هي بخة مرتين يومياً. (الحد الأقصى 12 بخة في اليوم).',
        'بيكلوميثازون-فورموتيرول (مثل فوستير 100/6): الجرعة المنخفضة كوقاية وإسعاف للبالغين هي بخة مرتين يومياً. (الحد الأقصى 8 بخات في اليوم).',
        'تعتبر هذه البخاخات هي الخيار الأفضل والآمن كبديل للفينتولين.',
      ],
    },
    sourceIds: ['gina-2025-intro'],
    tags: ['MART', 'AIR', 'symbicort', 'fostair', 'doses'],
  }
];