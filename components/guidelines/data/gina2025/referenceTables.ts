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
        'بوديزونيد (مثل بلميكورت): البالغين (منخفض: 200-400، متوسط: 400-800، عالي: >800). الأطفال (منخفض: 100-200، متوسط: 200-400، عالي: >400).',
        'فلوتيكازون بروبيونات (مثل فليكسوتيد): البالغين (منخفض: 100-250، متوسط: 250-500، عالي: >500). الأطفال (منخفض: 50-100، متوسط: 100-200، عالي: >200).',
        'بيكلوميثازون فائق النعومة (مثل فوستير): البالغين (منخفض: 100-200، متوسط: 200-400، عالي: >400). الأطفال (منخفض: 50-100، متوسط: 100-200، عالي: >200).',
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
        'Budesonide-formoterol (Turbuhaler 200/6 or pMDI 200/6): Low-dose MART for adults is 1 inhalation twice daily. Maximum 12 total inhalations/day.',
        'Beclometasone-formoterol (pMDI 100/6 extrafine): Low-dose MART for adults is 1 inhalation twice daily. Maximum 8 total inhalations/day.',
        'Mometasone-formoterol is also an option for AIR/MART in some regions.',
      ],
      ar: [
        'بوديزونيد-فورموتيرول (تركيز 100/6): للأطفال (6-11 سنة) في درجات 3 و 4. بحد أقصى (8 بخات) في اليوم الواحد.',
        'بوديزونيد-فورموتيرول (تركيز 200/6، أي سيمبيكورت 160/4.5): للبالغين والمراهقين. بحد أقصى (12 بخة) في اليوم الواحد.',
        'بيكلوميثازون-فورموتيرول (تركيز 100/6، أي فوستير): للبالغين كـ MART. بحد أقصى (12 بخة) في اليوم الواحد بناءً على تحديثات الأمان لمادة الفورموتيرول.',
        'إذا شعر المريض بحاجته لعدد بخات إسعافية يتجاوز هذا الحد الأقصى، يجب عليه التوجه للطوارئ أو الطبيب (في نفس اليوم) فوراً.',
        'ملاحظة: طريقة MART بسيمبيكورت غير منصوح بها للأطفال الذين وصلوا للدرجة الخامسة (الربو الشديد).',
      ],
    },
    sourceIds: ['gina-2025-tables'],
    tags: ['MART', 'AIR', 'symbicort', 'fostair', 'doses'],
  }
];