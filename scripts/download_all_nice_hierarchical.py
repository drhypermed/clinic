import os
import re
import sys
import json
import time
import urllib.request
import urllib.parse

# Configure standard output to use UTF-8 to prevent Windows terminal encoding errors
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

# Paths
HIERARCHY_JSON = r"C:\Users\a_g20\.gemini\antigravity\scratch\nice_hierarchy.json"
BASE_OUTPUT_DIR = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\guidelines-sources\NICE"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def sanitize_folder_name(name):
    # Remove HTML tags/entities and strip
    cleaned = re.sub(r'<.*?>', '', name)
    cleaned = re.sub(r'&#x27;|\x27', "'", cleaned)
    cleaned = re.sub(r'&amp;', "&", cleaned)
    # Remove invalid folder characters: \ / : * ? " < > |
    cleaned = re.sub(r'[\/:\*\?"<>\|]', ' - ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

def clean_filename(name):
    # Remove HTML entities
    cleaned = re.sub(r'&#x27;|\x27', "'", name)
    cleaned = re.sub(r'&amp;', "&", cleaned)
    # Remove invalid Windows filename characters: \ / : * ? " < > |
    cleaned = re.sub(r'[\/:\*\?"<>\|]', ' - ', cleaned)
    # Replace multiple spaces/hyphens with a single one
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s*-\s*-\s*', ' - ', cleaned)
    return cleaned.strip()

def get_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching HTML from {url}: {e}")
        return None

def download_file(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(filepath, 'wb') as out_f:
                out_f.write(response.read())
        return True
    except Exception as e:
        print(f"Error downloading file from {url}: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return False

def parse_products_from_html(html_content):
    articles = re.findall(r'<article class="card">.*?</article>', html_content)
    products = []
    for art in articles:
        # Href
        href_match = re.search(r'href="([^"]+)"', art)
        href = href_match.group(1) if href_match else ""
        
        # Code
        code_match = re.search(r'<data value="([^"]+)">', art)
        code = code_match.group(1) if code_match else ""
        
        # Title
        title_match = re.search(r'<data value="[^"]+">(.*?)</data>', art)
        title = title_match.group(1) if title_match else ""
        title = re.sub(r'<!--.*?-->', '', title)
        title = re.sub(r'<.*?>', '', title)
        title = title.strip()
        
        # Year
        dt_match = re.search(r'dateTime="(\d{4})-\d{2}-\d{2}"', art)
        year = dt_match.group(1) if dt_match else "None"
        
        if href and title:
            products.append({
                'code': code,
                'title': title,
                'href': href,
                'year': year
            })
    return products

def process_products_list(products, folder_path):
    os.makedirs(folder_path, exist_ok=True)
    success = 0
    skipped = 0
    failed = 0
    no_pdf = 0
    
    for idx, prod in enumerate(products, 1):
        title = prod['title']
        code = prod['code']
        href = prod['href']
        year = prod['year']
        
        safe_title = clean_filename(title)
        filename = f"[{year}] - {safe_title}.pdf"
        filepath = os.path.join(folder_path, filename)
        
        # Safe console prints to prevent Windows terminal character mapping issues
        try:
            print(f"  [{idx}/{len(products)}] Checking: [{year}] {title[:60]}...")
        except UnicodeEncodeError:
            print(f"  [{idx}/{len(products)}] Checking: [{year}] {title[:60].encode('ascii', 'ignore').decode('ascii')}...")
            
        # Check if already exists
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"  -> File already exists locally. (Skipping)")
            skipped += 1
            continue
            
        # Get overview page URL
        page_url = href
        if page_url.startswith('/'):
            page_url = "https://www.nice.org.uk" + page_url
            
        print(f"  -> Fetching overview: {page_url}")
        time.sleep(1.2)  # Respectful rate limit
        page_html = get_html(page_url)
        if not page_html:
            print("  -> Failed to fetch overview page.")
            failed += 1
            continue
            
        # Find PDF URL
        pdf_matches = re.findall(r'href="([^"]+/resources/[^"]+pdf[^"]*)"', page_html)
        if not pdf_matches:
            pdf_matches = re.findall(r'href="([^"]+\.pdf[^"]*)"', page_html)
            
        if pdf_matches:
            pdf_url = pdf_matches[0]
            if pdf_url.startswith('/'):
                pdf_url = "https://www.nice.org.uk" + pdf_url
                
            print(f"  -> Found PDF: {pdf_url}")
            print(f"  -> Downloading: {filename}")
            
            time.sleep(1.2)  # Respectful rate limit
            if download_file(pdf_url, filepath):
                print(f"  -> Download complete! Size: {os.path.getsize(filepath)} bytes")
                success += 1
            else:
                print("  -> Download failed.")
                failed += 1
        else:
            print("  -> No PDF link found on overview page.")
            no_pdf += 1
            
    return success, skipped, failed, no_pdf

def main():
    print("==================================================")
    print("NICE Hierarchical Guidelines Downloader & Organizer")
    print("==================================================")
    
    if not os.path.exists(HIERARCHY_JSON):
        print(f"Hierarchy mapping file {HIERARCHY_JSON} not found. Please run mapping script first.")
        return
        
    with open(HIERARCHY_JSON, 'r', encoding='utf-8') as f:
        categories = json.load(f)
        
    print(f"Loaded {len(categories)} categories from hierarchy JSON.")
    
    total_downloaded = 0
    total_skipped = 0
    total_failed = 0
    total_no_pdf = 0
    
    for c_idx, cat in enumerate(categories, 1):
        cat_title = sanitize_folder_name(cat['title'])
        cat_dir = os.path.join(BASE_OUTPUT_DIR, cat_title)
        
        try:
            print(f"\n==================================================")
            print(f"[{c_idx}/{len(categories)}] Processing Category: {cat['title']}")
            print(f"==================================================")
        except UnicodeEncodeError:
            print(f"\n==================================================")
            print(f"[{c_idx}/{len(categories)}] Processing Category: {cat['title'].encode('ascii', 'ignore').decode('ascii')}")
            print(f"==================================================")
            
        subcategories = cat.get('subcategories', [])
        if subcategories:
            # Process each subcategory
            for s_idx, sub in enumerate(subcategories, 1):
                sub_title = sanitize_folder_name(sub['title'])
                sub_dir = os.path.join(cat_dir, sub_title)
                
                try:
                    print(f"\n* Subcategory [{s_idx}/{len(subcategories)}]: {sub['title']}")
                except UnicodeEncodeError:
                    print(f"\n* Subcategory [{s_idx}/{len(subcategories)}]: {sub['title'].encode('ascii', 'ignore').decode('ascii')}")
                    
                products_url = sub['url'] + "/products?Status=Published"
                print(f"  Fetching products from: {products_url}")
                time.sleep(1.0)
                
                products_html = get_html(products_url)
                if not products_html:
                    print("  Failed to load products list.")
                    continue
                    
                products = parse_products_from_html(products_html)
                print(f"  Found {len(products)} products in this subcategory.")
                
                if products:
                    succ, skip, fail, nopdf = process_products_list(products, sub_dir)
                    total_downloaded += succ
                    total_skipped += skip
                    total_failed += fail
                    total_no_pdf += nopdf
        else:
            # Process Category directly
            products_url = cat['url'] + "/products?Status=Published"
            print(f"  No subcategories found. Fetching category products directly: {products_url}")
            time.sleep(1.0)
            
            products_html = get_html(products_url)
            if not products_html:
                print("  Failed to load products list.")
                continue
                
            products = parse_products_from_html(products_html)
            print(f"  Found {len(products)} products directly in this category.")
            
            if products:
                succ, skip, fail, nopdf = process_products_list(products, cat_dir)
                total_downloaded += succ
                total_skipped += skip
                total_failed += fail
                total_no_pdf += nopdf
                
    print("\n==================================================")
    print("Hierarchical Download Task Finished!")
    print(f"Total PDFs successfully downloaded: {total_downloaded}")
    print(f"Total PDFs skipped (already locally present): {total_skipped}")
    print(f"Total PDFs failed: {total_failed}")
    print(f"Total items without PDF link: {total_no_pdf}")
    print("==================================================")

if __name__ == "__main__":
    main()
