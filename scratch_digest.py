import os
import json
from pypdf import PdfReader
import re

pdf_path = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\guidelines-sources\GINA\GINA SUMMARY 2026.pdf'
out_path_digest = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025\recommendationDigest.ts'

mapping = [
    ('gina-2025-intro', 'Introduction & Facts', 5, 10),
    ('gina-2025-diagnosis', 'Diagnosing Asthma', 11, 13),
    ('gina-2025-assessment', 'Assessing Asthma', 14, 15),
    ('gina-2025-general', 'General Principles', 16, 17),
    ('gina-2025-adult', 'Treating Adults & Adolescents', 18, 26),
    ('gina-2025-child', 'Treating Children 6-11 Years', 27, 30),
    ('gina-2025-specific', 'Specific Populations', 31, 33),
    ('gina-2025-exacerbations', 'Exacerbations', 34, 37),
    ('gina-2025-tables', 'Reference Tables', 38, 44)
]

try:
    reader = PdfReader(pdf_path)
    
    digest_entries = []
    
    for source_id, title, start_page, end_page in mapping:
        recs = []
        tables = []
        for p in range(start_page, end_page + 1):
            if p - 1 < len(reader.pages):
                page_text = reader.pages[p - 1].extract_text() or ''
                # clean
                page_text = page_text.replace('COPYRIGHTED MATERIAL - DO NOT COPY OR DISTRIBUTE', '')
                page_text = page_text.replace('\n', ' ')
                page_text = re.sub(r'\s+', ' ', page_text).strip()
                page_text = page_text.replace('\"', '\\\"').replace('\'', '\\\'')
                
                if len(page_text) > 20:
                    recs.append(f'''      {{ id: 'p{p}', grade: '', page: {p}, text: "{page_text}" }}''')
            
            # images
            tables.append(f'''      {{ kind: 'figure', id: 'fig-p{p}', page: {p}, caption: 'Page {p}', imageSrc: '/guidelines-sources/GINA/pages/page_{p}.png', title: 'Page {p}' }}''')
            
        recs_str = ',\n'.join(recs)
        tabs_str = ',\n'.join(tables)
        
        entry = f'''  {{
    sourceId: '{source_id}',
    title: '{title}',
    sourcePdf: '/guidelines-sources/GINA/GINA SUMMARY 2026.pdf',
    recommendations: [
{recs_str}
    ],
    tablesAndFigures: [
{tabs_str}
    ],
    tableTextRows: []
  }}'''
        digest_entries.append(entry)
        
    ts_content = '''import type { GuidelineSourceDigest } from '../../guidelinesData';\n\nexport const GINA_2025_RECOMMENDATION_DIGEST: GuidelineSourceDigest[] = [\n''' + ',\n'.join(digest_entries) + '\n];\n'
    
    with open(out_path_digest, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print('digest generated')

except Exception as e:
    print('error', e)
