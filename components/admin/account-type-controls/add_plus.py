import re
import sys

def main():
    filepath = r'f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\admin\account-type-controls\constants.ts'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all occurrences of premium: { ... } inside the GROUPS array
    # and insert plus: { ... } right after it.
    
    # regex to match premium blocks
    pattern = re.compile(r'(    premium: \{.*?\n    \},?)', re.DOTALL)
    
    def replacer(match):
        premium_block = match.group(1)
        plus_block = premium_block.replace('premium', 'plus')
        plus_block = plus_block.replace('premium'.capitalize(), 'Plus')
        plus_block = plus_block.replace('برو', 'Plus')
        
        # Don't add if it already has a plus right after
        return premium_block + '\n' + plus_block
        
    new_content = pattern.sub(replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Done")

if __name__ == '__main__':
    main()
