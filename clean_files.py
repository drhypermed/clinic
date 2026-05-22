import re
import json
for filename in ['specificPopulations.ts', 'referenceTables.ts']:
    filepath = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025\\' + filename
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.strip().startswith('{') and '"role"' in content:
        try:
            data = json.loads(content)
            m = re.search(r'```(?:typescript|ts)\n(.*?)\n```', data.get('content', ''), re.DOTALL)
            if m:
                content = m.group(1)
        except:
            pass
            
    content = content.replace('GINA_2026', 'GINA_2025')
    content = content.replace('gina-2026', 'gina-2025')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
