import re

file_path = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\guidelinesData.ts"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for GINA 2025 sources
if 'GINA_2025_SOURCES' not in content:
    content = content.replace("import { ADA_2026_REMAINING_SOURCES } from './data/ada2026/sources';", "import { ADA_2026_REMAINING_SOURCES } from './data/ada2026/sources';\nimport { GINA_2025_SOURCES } from './data/gina2025/sources';")

# 2. Add GINA 2025 to GUIDELINE_COLLECTIONS
gina_collection = """
  {
    id: 'gina-2025',
    school: 'GINA',
    year: 2025,
    sourceDate: 'May 2025',
    title: {
      en: 'GINA Global Strategy for Asthma 2025',
      ar: 'استراتيجية GINA لمرض الربو 2025',
    },
    subtitle: {
      en: 'A comprehensive, source-linked digest focused on actionable GINA 2025 topics.',
      ar: 'ملخص شامل وموثق يركز على الموضوعات العملية في GINA 2025.',
    },
    sources: GINA_2025_SOURCES,
  },
"""
if "id: 'gina-2025'" not in content:
    content = content.replace("  },\n];", "  }," + gina_collection + "];")

# 3. Add gina groups to GUIDELINE_GROUP_LABELS
gina_groups = """
  ginaIntroduction: { en: 'Introduction & Facts', ar: 'مقدمة وحقائق' },
  ginaDiagnosingAsthma: { en: 'Diagnosing Asthma', ar: 'تشخيص الربو' },
  ginaAssessingAsthma: { en: 'Assessing Asthma', ar: 'تقييم الربو' },
  ginaGeneralPrinciples: { en: 'General Principles', ar: 'مبادئ عامة' },
  ginaAdultMedication: { en: 'Treating Adults & Adolescents', ar: 'علاج البالغين والمراهقين' },
  ginaChildMedication: { en: 'Treating Children 6-11 Years', ar: 'علاج الأطفال 6-11 سنة' },
  ginaSpecificPopulations: { en: 'Specific Populations', ar: 'حالات خاصة' },
  ginaExacerbations: { en: 'Exacerbations', ar: 'الانتكاسات' },
  ginaReferenceTables: { en: 'Reference Tables', ar: 'جداول مرجعية' },
"""
if "ginaIntroduction:" not in content:
    content = content.replace("  specialPopulations: {\n    en: '13-17. Special Populations and Settings',\n    ar: '13-17. فئات وسياقات خاصة',\n  },\n};", "  specialPopulations: {\n    en: '13-17. Special Populations and Settings',\n    ar: '13-17. فئات وسياقات خاصة',\n  }," + gina_groups + "};\n")

# 4. Add GINA to loadGuidelineCollectionData
gina_load = """
  if (id === 'gina-2025') {
    const [
      { GINA_2025_INTRO_TOPICS },
      { GINA_2025_DIAGNOSIS_TOPICS },
      { GINA_2025_ASSESSMENT_TOPICS },
      { GINA_2025_GENERAL_TOPICS },
      { GINA_2025_ADULT_TOPICS },
      { GINA_2025_CHILD_TOPICS },
      { GINA_2025_SPECIFIC_TOPICS },
      { GINA_2025_EXACERBATIONS_TOPICS },
      { GINA_2025_TABLES_TOPICS },
      { GINA_2025_RECOMMENDATION_DIGEST },
    ] = await Promise.all([
      import('./data/gina2025/introduction'),
      import('./data/gina2025/diagnosingAsthma'),
      import('./data/gina2025/assessingAsthma'),
      import('./data/gina2025/generalPrinciples'),
      import('./data/gina2025/adultMedication'),
      import('./data/gina2025/childMedication'),
      import('./data/gina2025/specificPopulations'),
      import('./data/gina2025/exacerbations'),
      import('./data/gina2025/referenceTables'),
      import('./data/gina2025/recommendationDigest'),
    ]);
    return {
      topics: [
        ...GINA_2025_INTRO_TOPICS,
        ...GINA_2025_DIAGNOSIS_TOPICS,
        ...GINA_2025_ASSESSMENT_TOPICS,
        ...GINA_2025_GENERAL_TOPICS,
        ...GINA_2025_ADULT_TOPICS,
        ...GINA_2025_CHILD_TOPICS,
        ...GINA_2025_SPECIFIC_TOPICS,
        ...GINA_2025_EXACERBATIONS_TOPICS,
        ...GINA_2025_TABLES_TOPICS,
      ],
      recommendationDigest: GINA_2025_RECOMMENDATION_DIGEST,
    };
  }
"""
if "if (id === 'gina-2025')" not in content:
    content = content.replace("  return null;\n};", gina_load + "  return null;\n};")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying guidelinesData.ts')
