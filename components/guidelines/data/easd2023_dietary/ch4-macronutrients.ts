import type { GuidelineTopic } from '../../guidelinesData';

export const EASD_2023_DIETARY_CHAPTER_4_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2023-dietary-ch4-macronutrients',
    sourceIds: ['easd-2023-easd-dietary-recommendations'],
    group: '4. Management of Macronutrients',
    title: { ar: 'القسم الرابع: إدارة المغذيات الكبرى', en: 'Section 4: Management of Macronutrients' },
    summary: {
      ar: 'يتناول هذا القسم توصيات مرنة حول إدارة الكربوهيدرات والدهون والبروتينات، مع التركيز على جودة المغذيات ومصادرها بدلاً من الكميات المطلقة.',
      en: 'This section provides flexible recommendations on managing carbohydrates, fats, and proteins, emphasizing nutrient quality and sources rather than absolute quantities.'
    },
    tags: [],
    points: {
      ar: [
        '**أولاً: الكربوهيدرات**\nلا يوجد رقم واحد مثالي لكمية الكربوهيدرات، حيث يُعتبر النطاق الواسع لاستهلاك الكربوهيدرات مقبولاً ومفيداً، طالما يتم الالتزام بتوصيات الألياف والسكريات.',
        '- **الألياف الغذائية هي المعيار الأهم:** يُوصى باستهلاك 35 جراماً يومياً على الأقل (أو 4 جرامات لكل 1000 كيلوجول). يجب الحصول على هذه الألياف من الأطعمة النباتية المعالجة بأقل قدر ممكن، مثل الحبوب الكاملة، الخضروات، البقوليات، الفواكه الكاملة، المكسرات، والبذور. وإذا كان من الصعب تلبية هذه الكمية من الغذاء وحده، يمكن الاستعانة بالمكملات الغذائية الغنية بالألياف.',
        '- **السكريات المضافة:** يجب أن تشكل السكريات الحرة أو المضافة أقل من 10% من إجمالي السعرات الحرارية. ويمكن للمرضى استخدام المحليات الصناعية (غير المغذية) كبديل لتقليل السعرات وتحسين مستويات السكر.',
        '- **تحذير من الأنظمة شديدة الانخفاض في الكربوهيدرات (مثل الكيتو):** لا يُنصح طبياً بهذه الأنظمة نظراً لافتقارها للأدلة العلمية التي تثبت سلامتها وفعاليتها على المدى الطويل، بالإضافة إلى ارتباطها بمخاطر مثل هبوط السكر، الحماض الكيتوني، نقص الفيتامينات، وارتفاع الكوليسترول الضار.',
        '- **حساب الكربوهيدرات:** تُعتبر هذه الاستراتيجية مفيدة جداً لتحديد جرعة الأنسولين وقت الوجبات (خاصة للمرضى المعتمدين على الأنسولين)، مما يتيح مرونة في اختيار الأطعمة دون الإضرار بالتحكم في مستوى السكر.',
        '**ثانياً: الدهون الغذائية**\nالتركيز هنا ليس على تقليل الدهون بشكل عام، بل على تحسين نوعيتها:',
        '- **الدهون الصحية:** يجب أن تأتي الدهون بشكل أساسي من الأطعمة النباتية الغنية بالدهون الأحادية والمتعددة غير المشبعة، مثل المكسرات، البذور، والزيوت النباتية غير الاستوائية (مثل زيت الزيتون وزيت الكانولا).',
        '- **الحدود القصوى:** يجب ألا تتجاوز الدهون المشبعة 10%، والدهون المتحولة 1% من إجمالي الطاقة.',
        '- **الاستبدال الذكي:** عند تقليل الدهون المشبعة (كالموجودة في الزبدة واللحوم الحمراء)، يجب استبدالها بدهون نباتية غير مشبعة (مثل أحماض أوميغا 3 وأوميغا 6). ويجب الحذر من استبدال الدهون المشبعة بكربوهيدرات سريعة الهضم، لأن ذلك لن يقدم أي فوائد صحية.',
        '**ثالثاً: البروتينات**\nتختلف التوصيات الخاصة بالبروتين بناءً على عدة عوامل شخصية كالعمر، الوزن، وحالة الكلى:',
        '- **البالغون بأوزان طبيعية (أقل من 65 عاماً):** يُنصح بأن يشكل البروتين 10-20% من إجمالي السعرات، بشرط أن تكون وظائف الكلى جيدة (معدل الترشيح الكبيبي eGFR > 60).',
        '- **كبار السن (65 عاماً فما فوق):** يحتاجون إلى نسبة بروتين أعلى (15-20%) للحفاظ على الكتلة العضلية وتجنب الهزال العضلي.',
        '- **أثناء برامج إنقاص الوزن:** بالنسبة للمصابين بزيادة الوزن أو السمنة، يمكن الاعتماد على بروتين أعلى بنسبة 23-32% لفترة قصيرة (تصل إلى 12 شهراً) للمساعدة في تقليل فقدان العضلات أثناء التخسيس.',
        '- **مرضى اعتلال الكلى السكري:** إذا كان هناك تراجع متوسط في وظائف الكلى (eGFR بين 45 و60)، يجب تقليل نسبة البروتين لتصبح 10-15% فقط لتجنب الإضرار بوظائف الكلى.',
        '- **مصادر البروتين:** يُفضل دمج البروتينات النباتية (كالبقوليات مع الحبوب الكاملة) بجانب الأسماك، البيض، الدواجن، واللحوم الخالية من الدهون. وتتميز البروتينات النباتية بتأثيرها الأفضل على مستويات الكوليسترول وسكر الدم، في حين أن الإفراط في البروتين الحيواني قد يؤدي إلى تجاوز الحد المسموح به من الدهون المشبعة.'
      ],
      en: [
        '**First: Carbohydrates**\nThere is no single ideal amount of carbohydrates; a wide range of carbohydrate intake is considered acceptable and beneficial, as long as fiber and sugar recommendations are met.',
        '- **Dietary Fiber is the Most Important Standard:** It is recommended to consume at least 35 grams daily (or 4 grams per 1000 kilojoules). This fiber should come from minimally processed plant foods, such as whole grains, vegetables, legumes, whole fruits, nuts, and seeds. If it is difficult to meet this amount from food alone, fiber-rich supplements can be used.',
        '- **Added Sugars:** Free or added sugars should account for less than 10% of total daily calories. Patients can use artificial (non-nutritive) sweeteners as an alternative to reduce calories and improve blood sugar levels.',
        '- **Warning Against Very-Low-Carbohydrate Diets (e.g., Keto):** These diets are not medically recommended due to the lack of scientific evidence proving their long-term safety and efficacy, in addition to their association with risks such as hypoglycemia, ketoacidosis, vitamin deficiencies, and elevated LDL cholesterol.',
        '- **Carbohydrate Counting:** This strategy is highly useful for determining mealtime insulin doses (especially for insulin-dependent patients), allowing flexibility in food choices without compromising blood sugar control.',
        '**Second: Dietary Fats**\nThe focus here is not on reducing overall fat, but on improving its quality:',
        '- **Healthy Fats:** Fats should primarily come from plant foods rich in mono- and polyunsaturated fats, such as nuts, seeds, and non-tropical vegetable oils (like olive and canola oils).',
        '- **Upper Limits:** Saturated fats should not exceed 10%, and trans fats 1% of total energy.',
        '- **Smart Substitution:** When reducing saturated fats (like those in butter and red meat), they should be replaced with unsaturated plant fats (like Omega-3 and Omega-6 fatty acids). Caution is advised against replacing saturated fats with fast-digesting carbohydrates, as this offers no health benefits.',
        '**Third: Proteins**\nProtein recommendations vary based on personal factors such as age, weight, and kidney function:',
        '- **Adults with Normal Weight (Under 65 years):** Protein should constitute 10-20% of total calories, provided kidney function is good (eGFR > 60).',
        '- **Older Adults (65 years and older):** They need a higher protein percentage (15-20%) to maintain muscle mass and prevent muscle wasting (sarcopenia).',
        '- **During Weight Loss Programs:** For individuals with overweight or obesity, a higher protein intake of 23-32% can be used short-term (up to 12 months) to help reduce muscle loss during weight loss.',
        '- **Diabetic Kidney Disease Patients:** If there is a moderate decline in kidney function (eGFR between 45 and 60), protein intake should be reduced to 10-15% to avoid further kidney damage.',
        '- **Protein Sources:** It is preferable to combine plant proteins (like legumes with whole grains) alongside fish, eggs, poultry, and lean meats. Plant proteins have a better impact on cholesterol and blood sugar levels, whereas excessive animal protein may lead to exceeding the allowed limit of saturated fats.'
      ]
    }
  }
];
