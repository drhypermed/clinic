import type { GuidelineSource } from '../../guidelinesData';

const GOLD_2026_REPORT_PAGE = 'https://goldcopd.org/2026-gold-report-and-pocket-guide/';

export const GOLD_2026_SOURCES: GuidelineSource[] = [
  {
    id: 'gold-2026-report',
    folderTitle: 'GOLD 2026',
    folderTopicId: 'gold-folder-2026',
    fileTopicId: 'gold-file-2026-report',
    title: 'GOLD Report 2026',
    fileType: 'Full guideline',
    pageCount: 249,
    textChars: 978427,
    chunkCount: 196,
    citation: 'Global Initiative for Chronic Obstructive Lung Disease. GOLD Report 2026.',
    url: GOLD_2026_REPORT_PAGE,
    localFile: 'GOLD/GOLD REPORT 2026.pdf',
    structuredTextPath: 'guidelines-sources/_structured/full-text/GOLD/GOLD REPORT 2026.json',
    rawTextPath: 'guidelines-sources/_extracted/full-text/GOLD/GOLD REPORT 2026.txt',
  },
  {
    id: 'gold-2026-key-changes',
    folderTitle: 'GOLD 2026',
    folderTopicId: 'gold-folder-2026',
    fileTopicId: 'gold-file-2026-key-changes',
    title: 'GOLD Report Key Changes Summary 2026',
    fileType: 'Summary',
    pageCount: 19,
    textChars: 94058,
    chunkCount: 19,
    citation: 'Global Initiative for Chronic Obstructive Lung Disease. GOLD Report 2026: Key Changes Summary.',
    url: GOLD_2026_REPORT_PAGE,
    localFile: 'GOLD/GOLD REPORT KEY CHANGES SUMMARY 2026.pdf',
    structuredTextPath: 'guidelines-sources/_structured/full-text/GOLD/GOLD REPORT KEY CHANGES SUMMARY 2026.json',
    rawTextPath: 'guidelines-sources/_extracted/full-text/GOLD/GOLD REPORT KEY CHANGES SUMMARY 2026.txt',
  },
];
