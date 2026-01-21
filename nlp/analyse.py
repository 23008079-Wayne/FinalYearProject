import sys
import json
import nltk
from bs4 import BeautifulSoup
from transformers import pipeline
import cloudscraper

nltk.download('punkt')

if len(sys.argv) < 2:
    print(json.dumps({"sentiment": "N/A", "confidence": 0, "summary": "No URL provided"}))
    sys.exit(1)

url = sys.argv[1]

# ----------------------------
# Use Selenium to fetch JS-rendered page
# ----------------------------
try:
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        }
    )
    
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
    }
    
    response = scraper.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    html = response.text
    
    # Parse with BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    
    # Try multiple selectors for content
    paragraphs = soup.find_all('p')
    articles = soup.find_all('article')
    divs = soup.find_all('div', {'class': lambda x: x and 'content' in x.lower()})
    
    text = ' '.join([p.get_text() for p in paragraphs]).strip()
    
    # If no paragraphs, try article divs
    if not text and articles:
        text = ' '.join([a.get_text() for a in articles]).strip()
    
    # If still nothing, try content divs
    if not text and divs:
        text = ' '.join([d.get_text() for d in divs[:5]]).strip()
    
    # Debug
    import sys
    print(f"DEBUG: HTML size: {len(html)}, Paragraphs found: {len(paragraphs)}, Articles found: {len(articles)}", file=sys.stderr)
except Exception as e:
    import sys
    print(f"DEBUG: Error during extraction: {str(e)}", file=sys.stderr)
    text = ""

if not text:
    print(json.dumps({"sentiment": "N/A", "confidence": 0, "summary": "Unable to extract article content."}))
    sys.exit(0)

# ----------------------------
# Transformers pipelines
# ----------------------------
try:
    sentiment_analyzer = pipeline("sentiment-analysis")
    summarizer = pipeline("summarization")
except Exception as e:
    print(json.dumps({"sentiment": "N/A", "confidence": 0, "summary": "Error loading NLP models."}))
    sys.exit(0)

# ----------------------------
# Sentiment analysis
# ----------------------------
try:
    sentiment_result = sentiment_analyzer(text[:1000])[0]  # limit text
    sentiment = sentiment_result['label']
    confidence = round(float(sentiment_result['score']), 2)
except Exception as e:
    sentiment, confidence = "N/A", 0

# ----------------------------
# Summarization
# ----------------------------
try:
    summary_result = summarizer(text[:1000], max_length=60, min_length=25, do_sample=False)
    summary = summary_result[0]['summary_text']
except Exception as e:
    summary = "Unable to summarize article."

# ----------------------------
# Output JSON
# ----------------------------
output = {
    "sentiment": sentiment,
    "confidence": confidence,
    "summary": summary
}

print(json.dumps(output))
