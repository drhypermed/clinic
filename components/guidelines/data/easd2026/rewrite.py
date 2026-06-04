import re
import json

with open("aid2024_pa.ts", "r", encoding="utf-8") as f:
    content = f.read()

# We know the structure has 4 topics: 'easd-2024-aid-pa-part1' through 4
# Let's extract the "details" array string for each using regex
topics = []
for i in range(1, 5):
    # Find the topic block
    topic_match = re.search(f"id: 'easd-2024-aid-pa-part{i}'.*?details: \\[(.*?)\\]\\s*\\}}", content, re.DOTALL)
    if not topic_match:
        # Fallback if the last bracket is different
        topic_match = re.search(f"id: 'easd-2024-aid-pa-part{i}'.*?details: \\[(.*?)\\]\\n\\s*(?:}},|}}])", content, re.DOTALL)
    
    if not topic_match:
        print(f"Could not find topic {i}")
        continue
        
    details_str = topic_match.group(1)
    
    # Inside details_str, we have multiple items with en/ar arrays
    # Let's extract all en strings and all ar strings
    en_items = []
    ar_items = []
    
    # A block looks like:
    # items: {
    #   en: [ '...', '...' ],
    #   ar: [ '...', '...' ]
    # }
    item_blocks = re.findall(r"items:\s*\{\s*en:\s*\[(.*?)\],\s*ar:\s*\[(.*?)\]\s*\}", details_str, re.DOTALL)
    
    for en_block, ar_block in item_blocks:
        # split by strings. Using a simple regex to capture text inside single quotes
        # We need to be careful with escaped quotes, but we know the content
        ens = re.findall(r"'(.*?)'", en_block, re.DOTALL)
        ars = re.findall(r"'(.*?)'", ar_block, re.DOTALL)
        en_items.extend(ens)
        ar_items.extend(ars)
        
    # We also want to prepend the section titles.
    # Actually, the user wants the parts exactly as they sent them.
    # They sent "أولاً...", "ثانياً...", so we don't need the sub-titles since they were my addition, 
    # except wait... the text INCLUDES "أولاً:", so we can just use the item arrays!
    
    topics.append({
        "en": en_items,
        "ar": ar_items
    })

# Now generate the new file content
new_content = """import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2024_AID_PA_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2024-aid-pa',
    group: '2024 Automated Insulin Delivery Around Physical Activity',
    sourceIds: ['easd-2024-automated-insulin-delivery-physical-activity'],
    tags: ['Physical Activity', 'AID', 'CGM', 'Exercise', 'Consensus Recommendations', 'Physiology', 'Commercial AID', 'Special Circumstances'],
    title: {
      en: '2024 Automated Insulin Delivery Around Physical Activity',
      ar: 'مضخات الأنسولين الآلية أثناء النشاط البدني 2024'
    },
    summary: {
      en: 'Comprehensive consensus recommendations and clinical guidelines for managing Automated Insulin Delivery (AID) systems during physical activity.',
      ar: 'توصيات مرجعية وإرشادات سريرية شاملة لإدارة أنظمة ضخ الأنسولين الآلية (AID) أثناء النشاط البدني.'
    },
    points: { en: [], ar: [] },
    details: [
"""

part_titles_en = [
    'Part 1: Context and Consensus Recommendations',
    'Part 2: General Principles of Physiology and Clinical Considerations',
    'Part 3: Clinical Guidelines for Commercial AID Systems',
    'Part 4: Special Circumstances and Extreme Environments for Practitioners'
]
part_titles_ar = [
    'الجزء الأول: المقدمة والتوصيات الأساسية',
    'الجزء الثاني: المبادئ العامة للفسيولوجيا والاعتبارات السريرية',
    'الجزء الثالث: الدليل السريري للأنظمة التجارية المتاحة',
    'الجزء الرابع: الظروف الخاصة والبيئات القاسية للممارسين'
]

for i, t in enumerate(topics):
    en_items_str = ",\\n            ".join(f"'{text.replace(chr(39), chr(92)+chr(39))}'" for text in t['en'])
    ar_items_str = ",\\n            ".join(f"'{text.replace(chr(39), chr(92)+chr(39))}'" for text in t['ar'])
    
    comma = "," if i < 3 else ""
    
    new_content += f"""      {{
        title: {{
          en: '{part_titles_en[i]}',
          ar: '{part_titles_ar[i]}'
        }},
        items: {{
          en: [
            {en_items_str}
          ],
          ar: [
            {ar_items_str}
          ]
        }}
      }}{comma}
"""

new_content += """    ]
  }
];
"""

with open("aid2024_pa.ts", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Rewritten aid2024_pa.ts successfully")
