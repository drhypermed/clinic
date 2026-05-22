import os, glob, re
directory = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025"
groups = set()
for filepath in glob.glob(os.path.join(directory, '*.ts')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        for match in re.finditer(r"group:\s*'([^']+)'", content):
            groups.add(match.group(1))
print("Groups:", groups)
