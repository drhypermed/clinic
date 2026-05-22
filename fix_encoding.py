import ast
import os

for filename in ['specificPopulations.ts', 'referenceTables.ts']:
    filepath = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025\\' + filename
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.startswith('"') and '\\n' in content:
        try:
            unescaped = ast.literal_eval(content)
            # Ensure the year is 2025 in variables
            unescaped = unescaped.replace('GINA_2026', 'GINA_2025')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(unescaped)
            print('Fixed', filename)
        except Exception as e:
            print('Failed to fix', filename, e)
