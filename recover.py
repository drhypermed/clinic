import json
import os

log_path = r"C:\Users\a_g20\.gemini\antigravity\brain\b44f0d81-0d27-4680-b43b-9093a31955a0\.system_generated\logs\transcript.jsonl"
out_dir = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\components\guidelines\data\gina2025"

os.makedirs(out_dir, exist_ok=True)

files = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                calls = data.get('tool_calls', [])
                for call in calls:
                    name = call.get('name', '')
                    if name == 'write_to_file' or name == 'default_api:write_to_file':
                        args = call.get('arguments', {})
                        target = args.get('TargetFile', '')
                        if 'gina2026' in target and target.endswith('.ts'):
                            # Overwrite with the latest seen in transcript
                            files[target] = args.get('CodeContent', '')
        except Exception as e:
            pass

for target, content in files.items():
    filename = os.path.basename(target)
    # Also replace gina-2026 with gina-2025 and GINA_2026 with GINA_2025 in the content before saving!
    content = content.replace("gina-2026", "gina-2025")
    content = content.replace("gina2026", "gina2025")
    content = content.replace("GINA_2026", "GINA_2025")
    
    out_path = os.path.join(out_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
        print(f"Restored {filename}")
