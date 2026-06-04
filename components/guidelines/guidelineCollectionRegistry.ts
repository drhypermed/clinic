import type { GuidelineCollection, GuidelineSource } from './guidelinesData';
import { ADA_2026_REMAINING_SOURCES } from './data/ada2026/sources';
import { EASD_SOURCES } from './data/easd2026/sources';
import { EASL_SOURCES } from './data/easl2026/sources';
import { ESC_SOURCES } from './data/esc2025/sources';
import { GINA_2025_SOURCES } from './data/gina2025/sources';
import { GOLD_2026_SOURCES } from './data/gold2026/sources';
import { KDIGO_SOURCES } from './data/kdigo/sources';

type GuidelineSourceLoader = () => Promise<GuidelineSource[]>;

const ACC_YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2015',
  '2013',
  '2012',
  '2011',
] as const;

const NICE_YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014',
  '2013',
  '2012',
  '2011',
  '2010',
  '2009',
  '2008',
  '2007',
  '2006',
  '2005',
  '2004',
  '2003',
  '2002',
  '2001',
  '2000',
] as const;

const createSourceOnlyCollection = (
  id: string,
  school: string,
  year: number,
  title: string,
  subtitle = 'A source-linked clinical guideline library.',
): GuidelineCollection => ({
  id,
  school,
  year,
  sourceDate: String(year),
  title: { en: title, ar: title },
  subtitle: { en: subtitle, ar: subtitle },
  sources: [],
});

const loadExportedSources = async <TModule extends Record<string, unknown>>(
  importer: () => Promise<TModule>,
  exportName: keyof TModule,
): Promise<GuidelineSource[]> => {
  const exported = (await importer())[exportName];
  return Array.isArray(exported) ? (exported as GuidelineSource[]) : [];
};

const loadSourcesForYear = async <TModule extends Record<string, unknown>>(
  importer: () => Promise<TModule>,
  exportName: keyof TModule,
  year: string,
): Promise<GuidelineSource[]> => {
  const exported = (await importer())[exportName];
  if (!exported || typeof exported !== 'object') return [];
  return (exported as Record<string, GuidelineSource[]>)[year] ?? [];
};

const CORE_GUIDELINE_COLLECTIONS: GuidelineCollection[] = [
  {
    id: 'ada-2026',
    school: 'ADA',
    year: 2026,
    sourceDate: 'January 2026',
    title: {
      en: 'ADA Standards of Care in Diabetes 2026',
      ar: 'معايير الرعاية في السكري ADA 2026',
    },
    subtitle: {
      en: 'A bilingual, source-linked clinical digest focused on actionable ADA 2026 clinical topics.',
      ar: 'ملخص سريري ثنائي اللغة مبني على المصادر، يركز على الموضوعات السريرية العملية في ADA 2026.',
    },
    sources: [
      {
        id: 'improving-care',
        title: '1. Improving Care and Promoting Health in Populations',
        citation:
          'American Diabetes Association Professional Practice Committee. 1. Improving care and promoting health in populations: Standards of Care in Diabetes-2026. Diabetes Care 2026;49(Suppl. 1).',
        url: 'https://doi.org/10.2337/dc26-S001',
        localFile: '1. Improving Care and Promoting Health in Populations.pdf',
      },
      {
        id: 'diagnosis-classification',
        title: '2. Diagnosis and Classification of Diabetes',
        citation:
          'American Diabetes Association Professional Practice Committee. 2. Diagnosis and classification of diabetes: Standards of Care in Diabetes-2026. Diabetes Care 2026;49(Suppl. 1).',
        url: 'https://doi.org/10.2337/dc26-S002',
        localFile: '2. Diagnosis and Classification of Diabetes.pdf',
      },
      ...ADA_2026_REMAINING_SOURCES,
    ],
  },
    {
    id: 'gina-2026',
    school: 'GINA',
    year: 2026,
    sourceDate: '2025-2026',
    title: {
      en: 'GINA Asthma Guidelines 2025-2026',
      ar: 'GINA Asthma Guidelines 2025-2026',
    },
    subtitle: {
      en: 'A concise, source-linked asthma digest with the 2026 strategy report and 2025 summary guide in the index.',
      ar: '2026 strategy report + 2025 summary guide.',
    },
    sources: GINA_2025_SOURCES,
  },
  {
    id: 'kdigo-2026',
    school: 'KDIGO',
    year: 2026,
    sourceDate: '2026',
    title: {
      en: 'KDIGO Clinical Practice Guidelines',
      ar: 'أدلة الممارسة السريرية KDIGO',
    },
    subtitle: {
      en: 'A comprehensive, source-linked kidney disease library.',
      ar: 'مكتبة شاملة لأمراض الكلى موثقة بالمصادر.',
    },
    sources: KDIGO_SOURCES,
  },
  {
    id: 'easl-2026',
    school: 'EASL',
    year: 2026,
    sourceDate: '2026',
    title: {
      en: 'EASL Clinical Practice Guidelines',
      ar: 'أدلة الممارسة السريرية EASL',
    },
    subtitle: {
      en: 'A comprehensive, source-linked liver disease library.',
      ar: 'مكتبة شاملة لأمراض الكبد موثقة بالمصادر.',
    },
    sources: EASL_SOURCES,
  },
  {
    id: 'gold-2026',
    school: 'GOLD',
    year: 2026,
    sourceDate: '2026',
    title: {
      en: 'GOLD COPD Report 2026',
      ar: 'دليل GOLD لمرض COPD 2026',
    },
    subtitle: {
      en: 'A source-linked COPD guideline library for diagnosis, assessment, and treatment decisions.',
      ar: 'مكتبة موثقة لإرشادات COPD من GOLD للتشخيص والتقييم وخيارات العلاج.',
    },
    sources: GOLD_2026_SOURCES,
  },
  {
    id: 'esc-2025',
    school: 'ESC',
    year: 2025,
    sourceDate: '2025',
    title: {
      en: 'ESC Clinical Practice Guidelines',
      ar: 'أدلة الممارسة السريرية ESC',
    },
    subtitle: {
      en: 'A comprehensive, source-linked cardiovascular disease library.',
      ar: 'مكتبة شاملة لأمراض القلب والأوعية الدموية موثقة بالمصادر.',
    },
    sources: ESC_SOURCES,
  },
  {
    id: 'easd-2026',
    school: 'EASD',
    year: 2026,
    sourceDate: '2026',
    title: {
      en: 'EASD Clinical Practice Guidelines',
      ar: 'أدلة الممارسة السريرية EASD',
    },
    subtitle: {
      en: 'A comprehensive, source-linked diabetes guideline library.',
      ar: 'مكتبة شاملة لإرشادات السكري موثقة بالمصادر.',
    },
    sources: EASD_SOURCES,
  },
];

const ADDITIONAL_GUIDELINE_COLLECTIONS: GuidelineCollection[] = [
  ...ACC_YEARS.map((year) =>
    createSourceOnlyCollection(`acc-${year}`, 'ACC', Number(year), `ACC Clinical Practice Guidelines ${year}`),
  ),
  ...NICE_YEARS.map((year) =>
    createSourceOnlyCollection(`nice-${year}`, 'NICE', Number(year), `NICE Guidance ${year}`),
  ),
  createSourceOnlyCollection('aad-2023', 'AAD', 2023, 'AAD Dermatology Guidelines 2023'),
  createSourceOnlyCollection('aaos-2026', 'AAOS', 2026, 'AAOS Orthopaedic Guidelines'),
  createSourceOnlyCollection('aap-2026', 'AAP', 2026, 'AAP Clinical Practice Guidelines'),
  createSourceOnlyCollection('aapmr-2026', 'AAPM&R', 2026, 'AAPM&R Rehabilitation Guidelines'),
  createSourceOnlyCollection('acg-2026', 'ACG', 2026, 'ACG Gastroenterology Guidelines'),
  createSourceOnlyCollection('acp-2026', 'ACP', 2026, 'ACP Guidance Statements and Guidelines'),
  createSourceOnlyCollection('acr-2026', 'ACR', 2026, 'ACR Rheumatology Guidelines'),
  createSourceOnlyCollection('ada-dental-2026', 'ADA Dental', 2026, 'ADA Dental Clinical Guidelines'),
  createSourceOnlyCollection('aga-2026', 'AGA', 2026, 'AGA Clinical Guidance'),
  createSourceOnlyCollection('asa-2026', 'ASA', 2026, 'ASA Anesthesiology Guidelines'),
  createSourceOnlyCollection('ash-2026', 'ASH', 2026, 'ASH Hematology Guidelines'),
  createSourceOnlyCollection('asha-2026', 'ASHA', 2026, 'ASHA Practice Guidelines'),
  createSourceOnlyCollection('aua-2026', 'AUA', 2026, 'AUA Urology Guidelines'),
  createSourceOnlyCollection('audiology-2026', 'Audiology', 2026, 'Audiology Clinical Guidance'),
  createSourceOnlyCollection('cdc-acip-2026', 'CDC ACIP', 2026, 'CDC ACIP Vaccine Recommendations'),
  createSourceOnlyCollection('endocrine-2026', 'Endocrine', 2026, 'Endocrine Society Clinical Practice Guidelines'),
  createSourceOnlyCollection('eau-2026', 'EAU', 2026, 'EAU Urology Guidelines'),
  createSourceOnlyCollection('espen-2026', 'ESPEN', 2026, 'ESPEN Nutrition Guidelines'),
];

const GUIDELINE_SOURCE_LOADERS: Record<string, GuidelineSourceLoader> = {
  ...Object.fromEntries(
    ACC_YEARS.map((year) => [
      `acc-${year}`,
      () => loadSourcesForYear(() => import('./data/acc/sources'), 'ACC_SOURCES_BY_YEAR', year),
    ]),
  ),
  ...Object.fromEntries(
    NICE_YEARS.map((year) => [
      `nice-${year}`,
      () => loadSourcesForYear(() => import('./data/nice/sources'), 'NICE_SOURCES_BY_YEAR', year),
    ]),
  ),
  'aad-2023': () => loadExportedSources(() => import('./data/aad2023/sources'), 'AAD_2023_SOURCES'),
  'aaos-2026': () => loadExportedSources(() => import('./data/aaos/sources'), 'AAOS_SOURCES'),
  'aap-2026': () => loadExportedSources(() => import('./data/aap2026/sources'), 'AAP_SOURCES'),
  'aapmr-2026': () => loadExportedSources(() => import('./data/aapmr/sources'), 'AAPMR_SOURCES'),
  'acg-2026': () => loadExportedSources(() => import('./data/acg2026/sources'), 'ACG_SOURCES'),
  'acp-2026': () => loadExportedSources(() => import('./data/acp2026/sources'), 'ACP_SOURCES'),
  'acr-2026': () => loadExportedSources(() => import('./data/acr/sources'), 'ACR_SOURCES'),
  'ada-dental-2026': () => loadExportedSources(() => import('./data/ada-dental/sources'), 'ADA_DENTAL_SOURCES'),
  'aga-2026': () => loadExportedSources(() => import('./data/aga2026/sources'), 'AGA_SOURCES'),
  'asa-2026': () => loadExportedSources(() => import('./data/asa/sources'), 'ASA_SOURCES'),
  'ash-2026': () => loadExportedSources(() => import('./data/ash/sources'), 'ASH_SOURCES'),
  'asha-2026': () => loadExportedSources(() => import('./data/asha/sources'), 'ASHA_SOURCES'),
  'aua-2026': () => loadExportedSources(() => import('./data/aua/sources'), 'AUA_SOURCES'),
  'audiology-2026': () => loadExportedSources(() => import('./data/audiology/sources'), 'AUDIOLOGY_SOURCES'),
  'cdc-acip-2026': () => loadExportedSources(() => import('./data/cdcAcip2026/sources'), 'CDC_ACIP_SOURCES'),
  'endocrine-2026': () => loadExportedSources(() => import('./data/endocrine2026/sources'), 'ENDOCRINE_SOURCES'),
  'eau-2026': () => loadExportedSources(() => import('./data/eau/sources'), 'EAU_SOURCES'),
  'espen-2026': () => loadExportedSources(() => import('./data/espen/sources'), 'ESPEN_SOURCES'),
};

const sourceLoaderCache: Record<string, Promise<GuidelineSource[]>> = {};

export const GUIDELINE_COLLECTIONS: GuidelineCollection[] = [
  ...CORE_GUIDELINE_COLLECTIONS,
  ...ADDITIONAL_GUIDELINE_COLLECTIONS,
];

export const loadGuidelineCollectionSources = async (id: string): Promise<GuidelineSource[]> => {
  const collection = GUIDELINE_COLLECTIONS.find((item) => item.id === id);
  const loader = GUIDELINE_SOURCE_LOADERS[id];
  if (!loader) return collection?.sources ?? [];
  sourceLoaderCache[id] ??= loader();
  return sourceLoaderCache[id];
};
