import type { GuidelineSource } from '../../guidelinesData';

const GINA_2026_URL = 'https://ginasthma.org/';
const GINA_2026_CITATION = 'Global Initiative for Asthma. Global Strategy for Asthma Management and Prevention, 2026. Updated May 2026.';

export const GINA_2025_SOURCES: GuidelineSource[] = [
  {
    id: 'gina-2026',
    title: 'GINA 2026.pdf',
    url: GINA_2026_URL,
    citation: GINA_2026_CITATION,
    localFile: 'GINA 2026.pdf',
    structuredTextPath: 'guidelines-sources/_structured/full-text/GINA/GINA 2026.json',
    bookId: 'gina-2026',
  },
];
