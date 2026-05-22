import os, glob, ast

files = glob.glob(r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025\*.ts')
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.startswith('"') and '\\n' in content:
        try:
            unescaped = ast.literal_eval(content)
            unescaped = unescaped.replace('GINA_2026', 'GINA_2025').replace('gina-2026', 'gina-2025')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(unescaped)
            print('Fixed JSON string encoding for', os.path.basename(filepath))
        except Exception as e:
            print('Failed to fix', os.path.basename(filepath), e)
    elif 'GINA_2026' in content or 'gina-2026' in content:
        content = content.replace('GINA_2026', 'GINA_2025').replace('gina-2026', 'gina-2025')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Updated 2026 -> 2025 for', os.path.basename(filepath))
