import os

files_to_update = {
    'diagnosingAsthma.ts': ('Diagnosing Asthma', 'History of variable respiratory symptoms (cough, wheeze, shortness of breath, chest tightness). Confirmed variable expiratory airflow limitation.', 'تاريخ من الأعراض التنفسية المتغيرة (سعال، أزيز، ضيق تنفس، ضيق بالصدر). تأكيد وجود قيود متغيرة في تدفق الهواء الزفيري.'),
    'assessingAsthma.ts': ('Assessing Asthma', 'Assess symptom control over the last 4 weeks (daytime symptoms, night waking, reliever use, activity limitation). Assess risk factors for exacerbations.', 'تقييم السيطرة على الأعراض خلال الأسابيع الأربعة الماضية (أعراض نهارية، استيقاظ ليلي، استخدام المسعف، تقييد النشاط). تقييم عوامل الخطر للانتكاسات.'),
    'generalPrinciples.ts': ('General Principles', 'Personalized asthma management cycle: Assess, Adjust, Review. Shared decision-making with the patient.', 'دورة إدارة الربو المخصصة: تقييم، ضبط، مراجعة. اتخاذ القرارات المشتركة مع المريض.'),
    'adultMedication.ts': ('Treating Adults & Adolescents', 'Track 1 (Preferred): Low dose ICS-formoterol as reliever. Track 2: SABA reliever. Stepwise approach from Step 1 to Step 5.', 'المسار 1 (المفضل): استخدام ICS-formoterol بجرعة منخفضة كمسعف. المسار 2: مسعف SABA. نهج تدريجي من الخطوة 1 إلى 5.'),
    'childMedication.ts': ('Treating Children 6-11 Years', 'Stepwise approach. Low dose ICS as preferred controller. In Step 3-4, very low dose ICS-formoterol MART can be considered.', 'نهج تدريجي. ICS بجرعة منخفضة كعلاج وقائي مفضل. في الخطوات 3-4، يمكن النظر في MART باستخدام ICS-formoterol بجرعة منخفضة جداً.'),
    'specificPopulations.ts': ('Specific Populations', 'Management of asthma in pregnancy, occupational asthma, athletes, and elderly requires specific considerations.', 'إدارة الربو أثناء الحمل، الربو المهني، الرياضيين، وكبار السن تتطلب اعتبارات خاصة.'),
    'exacerbations.ts': ('Exacerbations', 'Mild/Moderate: SABA, OCS, ICS. Severe: Transfer to acute care facility, Oxygen, systemic corticosteroids, SABA/SAMA.', 'خفيفة/متوسطة: SABA, OCS, ICS. شديدة: النقل للرعاية العاجلة، أكسجين، كورتيزون جهازي، SABA/SAMA.')
}

base_dir = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025'

for filename, (title, en_point, ar_point) in files_to_update.items():
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        
        c = c.replace("'Refer to the GINA 2025 official document for full details.'", f"'{en_point}'")
        c = c.replace("'يرجى الرجوع إلى الوثيقة الرسمية لـ GINA 2025 للحصول على التفاصيل الكاملة.'", f"'{ar_point}'")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(c)
