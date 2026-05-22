import json
import os
import re

in_file = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\original_gina_any.txt'
out_dir = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025'

# mapping from old file names to new sourceIds in digest
source_id_map = {
    'introduction.ts': 'gina-2025-intro',
    'diagnosingAsthma.ts': 'gina-2025-diagnosis',
    'assessingAsthma.ts': 'gina-2025-assessment',
    'generalPrinciples.ts': 'gina-2025-general',
    'adultMedication.ts': 'gina-2025-adult',
    'childMedication.ts': 'gina-2025-child',
    'exacerbations.ts': 'gina-2025-exacerbation',
    'specificPopulations.ts': 'gina-2025-specific',
    'referenceTables.ts': 'gina-2025-intro', # Fallback for now if not mapped
}

files_restored = {}

with open(in_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        if data.get('source') == 'MODEL' and 'tool_calls' in data:
            for tc in data['tool_calls']:
                if tc['name'] == 'write_to_file' and 'gina2026' in tc.get('args', {}).get('TargetFile', ''):
                    target_file = tc['args']['TargetFile']
                    content = tc['args']['CodeContent']
                    
                    filename = os.path.basename(target_file.strip('"').replace('\\\\', '\\'))
                    if filename not in files_restored:
                        files_restored[filename] = content

for filename, content in files_restored.items():
    # Remove leading/trailing quotes and unescape newlines if it's a JSON string literal
    if content.startswith('"') and content.endswith('"'):
        content = content[1:-1].replace('\\n', '\n').replace('\\"', '"')
    
    # Update GINA_2026 to GINA_2025
    content = content.replace('GINA_2026_', 'GINA_2025_')
    
    # Update sourceIds
    new_source_id = source_id_map.get(filename, 'gina-2025-intro')
    content = re.sub(r'sourceIds:\s*\[[^\]]+\]', f"sourceIds: ['{new_source_id}']", content)
    
    out_path = os.path.join(out_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Restored {filename}')
