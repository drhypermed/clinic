import os
import re
import sys
import time
import urllib.request
from DrissionPage import ChromiumPage, ChromiumOptions

# Configure standard output to use UTF-8 to prevent Windows terminal encoding errors
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

BASE_URL = "https://www.acponline.org/clinical-information/clinical-guidelines-recommendations"
OUTPUT_ROOT = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\guidelines-sources\ACP"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

def clean_filename(name):
    # Remove HTML tags/entities
    cleaned = re.sub(r'<.*?>', '', name)
    cleaned = re.sub(r'&#x27;|\x27', "'", cleaned)
    cleaned = re.sub(r'&amp;', "&", cleaned)
    # Remove invalid Windows filename characters: \ / : * ? " < > |
    cleaned = re.sub(r'[\/:\*\?"<>\|]', ' - ', cleaned)
    # Replace multiple spaces/hyphens with a single one
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s*-\s*-\s*', ' - ', cleaned)
    return cleaned.strip()

def sanitize_folder_name(name):
    cleaned = re.sub(r'<.*?>', '', name)
    cleaned = re.sub(r'&#x27;|\x27', "'", cleaned)
    cleaned = re.sub(r'&amp;', "&", cleaned)
    cleaned = re.sub(r'[\/:\*\?"<>\|]', ' - ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

def get_acp_main_html():
    req = urllib.request.Request(BASE_URL, headers=HEADERS)
    try:
        print(f"Fetching ACP main guidelines page from: {BASE_URL}")
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching main page: {e}")
        return None

def parse_guidelines(html):
    # Guidelines are inside accordion items: <h3>Topic</h3><div>...<h4>Guideline Name</h4><p>...<a href="link">Full text</a></p></div>
    topics = re.findall(r'<h3>(.*?)</h3>\s*<div>(.*?)</div>', html, re.DOTALL)
    
    parsed_data = []
    
    for topic_raw, content in topics:
        topic_name = sanitize_folder_name(topic_raw)
        
        # Find all guideline links inside this topic content
        guideline_matches = re.findall(r'<h4>(.*?)</h4>\s*<p>(.*?)<a\s+href="([^"]+)"[^>]*>Full text</a>', content, re.DOTALL)
        p_matches = re.findall(r'<p>([^<]+?)<br><a\s+href="([^"]+)"[^>]*>Full text</a>', content)
        
        g_list = []
        for g_title, g_desc, g_link in guideline_matches:
            full_title = re.sub(r'<br\s*/?>', '', g_desc)
            full_title = re.sub(r'<.*?>', '', full_title)
            full_title = full_title.strip()
            g_list.append((full_title, g_link))
        for p_desc, p_link in p_matches:
            if p_link not in [item[1] for item in g_list]:
                title = re.sub(r'<br\s*/?>', '', p_desc)
                title = re.sub(r'<.*?>', '', title)
                title = title.strip()
                g_list.append((title, p_link))
                
        if g_list:
            parsed_data.append({
                'topic': topic_name,
                'items': g_list
            })
            
    return parsed_data

def main():
    print("==================================================")
    print("ACP Clinical Guidelines Downloader & Extractor")
    print("==================================================")
    
    main_html = get_acp_main_html()
    if not main_html:
        print("Failed to load main page. Exiting.")
        return
        
    parsed_topics = parse_guidelines(main_html)
    total_guidelines = sum(len(t['items']) for t in parsed_topics)
    print(f"Successfully parsed {len(parsed_topics)} topics and {total_guidelines} total guidelines.")
    
    # Configure DrissionPage Options
    co = ChromiumOptions()
    co.set_argument("--window-size=1200,800")
    co.set_local_port(9333)
    co.set_paths(user_data_path=r"C:\Users\a_g20\.gemini\antigravity\scratch\chrome_profile_9333")

    
    print("\nInitializing Chromium browser session...")
    try:
        page = ChromiumPage(co)
    except Exception as e:
        print(f"Failed to initialize DrissionPage browser: {e}")
        return
        
    print("Opening ACP Journals home to trigger initial session cookies...")
    try:
        page.get("https://www.acpjournals.org/")
        time.sleep(3)
    except Exception as e:
        print(f"Warning during home page load: {e}")
        
    downloaded_count = 0
    skipped_count = 0
    failed_count = 0
    
    for t_idx, topic_data in enumerate(parsed_topics, 1):
        topic_name = topic_data['topic']
        topic_dir = os.path.join(OUTPUT_ROOT, topic_name)
        os.makedirs(topic_dir, exist_ok=True)
        
        print(f"\n==================================================")
        print(f"[{t_idx}/{len(parsed_topics)}] Topic: {topic_name}")
        print(f"==================================================")
        
        for g_idx, (g_title, g_link) in enumerate(topic_data['items'], 1):
            # Extract year from title if present, e.g. 2026 or 2023 anywhere in the title
            year_match = re.search(r'\b(20\d{2}|19\d{2})\b', g_title)
            year = year_match.group(1) if year_match else "None"
            
            # Clean title for filename (remove standalone year or year in parentheses)
            clean_title_only = g_title
            if year != "None":
                clean_title_only = re.sub(r'\(\s*' + year + r'\s*\)', '', clean_title_only)
                clean_title_only = re.sub(r'\b' + year + r'\b', '', clean_title_only)
            clean_title_only = clean_filename(clean_title_only)
            
            # Ensure the filename is not too long to trigger Windows MAX_PATH error (max 260 chars)
            max_filename_len = 240 - len(topic_dir) - 15  # 15 chars for year prefix and extension
            if len(clean_title_only) > max_filename_len:
                clean_title_only = clean_title_only[:max_filename_len].strip()
                clean_title_only = re.sub(r'\s*-\s*$', '', clean_title_only).strip()
            
            filename_html = f"[{year}] - {clean_title_only}.html"
            filename_txt = f"[{year}] - {clean_title_only}.txt"
            
            filepath_html = os.path.join(topic_dir, filename_html)
            filepath_txt = os.path.join(topic_dir, filename_txt)
            
            # Print status safely
            try:
                print(f"  [{g_idx}/{len(topic_data['items'])}] Checking: [{year}] {clean_title_only[:60]}...")
            except UnicodeEncodeError:
                print(f"  [{g_idx}/{len(topic_data['items'])}] Checking: [{year}] {clean_title_only[:60].encode('ascii', 'ignore').decode('ascii')}...")
                
            # Check if both files exist and are healthy
            if os.path.exists(filepath_html) and os.path.exists(filepath_txt) and os.path.getsize(filepath_html) > 0:
                print("  -> Files already exist locally. (Skipping)")
                skipped_count += 1
                continue
                
            print(f"  -> Navigating to: {g_link}")
            try:
                page.get(g_link)
                
                # Wait for Cloudflare to resolve (max 15s)
                bypassed = False
                for _ in range(15):
                    title = page.title
                    if "Just a moment" not in title and title != "":
                        bypassed = True
                        break
                    time.sleep(1)
                    
                if not bypassed:
                    print("  -> Failed to bypass Cloudflare challenge in 15 seconds.")
                    failed_count += 1
                    continue
                    
                # Locate article text
                article_ele = page.ele('.hlFld-FullText')
                if not article_ele:
                    article_ele = page.ele('tag:article')
                    
                if article_ele:
                    # Extract HTML and clean text
                    article_html = article_ele.html
                    article_text = article_ele.text
                    
                    # Save HTML file
                    with open(filepath_html, 'w', encoding='utf-8') as f_html:
                        f_html.write(article_html)
                        
                    # Save text file
                    with open(filepath_txt, 'w', encoding='utf-8') as f_txt:
                        f_txt.write(article_text)
                        
                    print(f"  -> Extracted successfully! Size: {len(article_text)} chars")
                    downloaded_count += 1
                else:
                    print("  -> Could not locate the article body element (.hlFld-FullText or <article>).")
                    failed_count += 1
            except Exception as ex:
                try:
                    print(f"  -> Error occurred: {ex}")
                except UnicodeEncodeError:
                    print(f"  -> Error occurred: {repr(ex).encode('ascii', 'ignore').decode('ascii')}")
                failed_count += 1
                
            time.sleep(1.5) # Polite delay between requests
            
    # Clean up browser
    try:
        page.quit()
    except:
        pass
        
    print("\n==================================================")
    print("ACP Guidelines Download Finished!")
    print(f"Total processed successfully: {downloaded_count}")
    print(f"Total skipped (already locally present): {skipped_count}")
    print(f"Total failed: {failed_count}")
    print("==================================================")

if __name__ == "__main__":
    main()
