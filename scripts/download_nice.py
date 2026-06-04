import os
import re
import sys
import time
import urllib.request
import urllib.parse

# Configure standard output to use UTF-8 to prevent Windows terminal encoding errors
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass  # In some older python environments reconfigure might not exist

# Configurations
LIST_URL = "https://www.nice.org.uk/guidance/conditions-and-diseases/blood-and-immune-system-conditions/blood-and-bone-marrow-cancers/products?Status=Published"
OUTPUT_DIR = r"f:\تطبيقات\تطبيق الروشته\النسخة الاصلية\drhyperclinic\guidelines-sources\NICE\blood-and-bone-marrow-cancers"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def clean_filename(name):
    # Remove invalid Windows filename characters: \ / : * ? " < > |
    cleaned = re.sub(r'[\/:\*\?"<>\|]', ' - ', name)
    # Replace multiple spaces/hyphens with a single one
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s*-\s*-\s*', ' - ', cleaned)
    return cleaned.strip()

def get_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    print("==================================================")
    print("NICE Guidance Downloader - Blood & Bone Marrow Cancers")
    print("==================================================")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Print safe representation of output directory to avoid terminal encoding issues
    print(f"Output Directory (safe path representation): {repr(OUTPUT_DIR)}")
    
    print(f"Fetching main guidance list...")
    list_html = get_html(LIST_URL)
    if not list_html:
        print("Failed to fetch the main guidance page. Exiting.")
        return
        
    # Extract all <article class="card">...</article> blocks
    articles = re.findall(r'<article class="card">.*?</article>', list_html)
    print(f"Found {len(articles)} guidelines on the page.")
    
    products = []
    for art in articles:
        href_match = re.search(r'href="([^"]+)"', art)
        href = href_match.group(1) if href_match else ""
        
        code_match = re.search(r'<data value="([^"]+)">', art)
        code = code_match.group(1) if code_match else ""
        
        title_match = re.search(r'<data value="[^"]+">(.*?)</data>', art)
        title = title_match.group(1) if title_match else ""
        title = re.sub(r'<!--.*?-->', '', title)
        title = re.sub(r'<.*?>', '', title)
        title = title.strip()
        
        if href and code and title:
            products.append({
                'code': code,
                'title': title,
                'href': href
            })
            
    print(f"Successfully parsed {len(products)} products to process.")
    
    success_count = 0
    skipped_count = 0
    failed_count = 0
    no_pdf_count = 0
    
    for idx, prod in enumerate(products, 1):
        code = prod['code']
        title = prod['title']
        href = prod['href']
        
        # Clean title for filename
        safe_title = clean_filename(title)
        filename = f"{code} - {safe_title}.pdf"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Print with unicode safe logging
        try:
            print(f"\n[{idx}/{len(products)}] Processing {code}: {title}")
        except UnicodeEncodeError:
            print(f"\n[{idx}/{len(products)}] Processing {code}: {title.encode('ascii', 'ignore').decode('ascii')}")
        
        # Check if file already exists
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"-> Already downloaded: {code} (Skipping)")
            skipped_count += 1
            continue
            
        # Get individual guidance overview page
        page_url = href
        if page_url.startswith('/'):
            page_url = "https://www.nice.org.uk" + page_url
            
        print(f"-> Fetching overview: {page_url}")
        time.sleep(1.0)  # Polite delay
        
        page_html = get_html(page_url)
        if not page_html:
            print("-> Failed to load overview page.")
            failed_count += 1
            continue
            
        # Search for PDF link
        # It usually looks like: href="/guidance/ta1149/resources/..." or full URL
        pdf_matches = re.findall(r'href="([^"]+/resources/[^"]+pdf[^"]*)"', page_html)
        if not pdf_matches:
            # Let's try searching for any PDF link on the page
            pdf_matches = re.findall(r'href="([^"]+\.pdf[^"]*)"', page_html)
            
        if pdf_matches:
            pdf_url = pdf_matches[0]
            if pdf_url.startswith('/'):
                pdf_url = "https://www.nice.org.uk" + pdf_url
                
            print(f"-> Found PDF URL: {pdf_url}")
            
            try:
                time.sleep(1.0)  # Polite delay
                pdf_req = urllib.request.Request(pdf_url, headers=HEADERS)
                with urllib.request.urlopen(pdf_req, timeout=20) as pdf_resp:
                    with open(filepath, 'wb') as out_f:
                        out_f.write(pdf_resp.read())
                print(f"-> Download successful! Size: {os.path.getsize(filepath)} bytes")
                success_count += 1
            except Exception as e:
                print(f"-> Download failed: {e}")
                failed_count += 1
                if os.path.exists(filepath):
                    os.remove(filepath)
        else:
            print("-> No PDF download link found on overview page.")
            no_pdf_count += 1
            
    print("\n==================================================")
    print("Download Summary:")
    print(f"Total processed: {len(products)}")
    print(f"Successfully downloaded: {success_count}")
    print(f"Skipped (already exists): {skipped_count}")
    print(f"No PDF link found: {no_pdf_count}")
    print(f"Failed downloads: {failed_count}")
    print("==================================================")

if __name__ == "__main__":
    main()
