import re

file_path = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\guidelinesData.ts"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{ GINA_2025_SPECIFIC_TOPICS }", "{ GINA_2025_SPECIFIC_POPULATIONS_TOPICS }")
content = content.replace("...GINA_2025_SPECIFIC_TOPICS", "...GINA_2025_SPECIFIC_POPULATIONS_TOPICS")

content = content.replace("{ GINA_2025_TABLES_TOPICS }", "{ GINA_2025_REFERENCE_TABLES_TOPICS }")
content = content.replace("...GINA_2025_TABLES_TOPICS", "...GINA_2025_REFERENCE_TABLES_TOPICS")

content = content.replace("{ GINA_2025_INTRO_TOPICS }", "{ GINA_2025_INTRODUCTION_TOPICS }")
content = content.replace("...GINA_2025_INTRO_TOPICS", "...GINA_2025_INTRODUCTION_TOPICS")

content = content.replace("{ GINA_2025_ADULT_TOPICS }", "{ GINA_2025_ADULT_MEDICATION_TOPICS }")
content = content.replace("...GINA_2025_ADULT_TOPICS", "...GINA_2025_ADULT_MEDICATION_TOPICS")

content = content.replace("{ GINA_2025_CHILD_TOPICS }", "{ GINA_2025_CHILD_MEDICATION_TOPICS }")
content = content.replace("...GINA_2025_CHILD_TOPICS", "...GINA_2025_CHILD_MEDICATION_TOPICS")

content = content.replace("{ GINA_2025_GENERAL_TOPICS }", "{ GINA_2025_GENERAL_PRINCIPLES_TOPICS }")
content = content.replace("...GINA_2025_GENERAL_TOPICS", "...GINA_2025_GENERAL_PRINCIPLES_TOPICS")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
