// FinanceAI - Watchlist, Calendar & Insights

// Mock stock data
const mockStocks = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 248.50, change: 2.5 },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 195.75, change: -1.2 },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 445.30, change: 3.1 },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 287.65, change: -2.8 },
    'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', price: 185.20, change: 0.8 },
    'JPM': { symbol: 'JPM', name: 'JPMorgan Chase', price: 225.40, change: 1.5 }
};

// Top 5 News Articles for Sentiment Analysis
const topNewsArticles = [
    {
        id: 1,
        title: 'Stock Market Today: Dow, S&P 500 Close Higher on Strong Earnings',
        url: 'https://www.cnbc.com/2024/01/16/stock-market-today-live-updates.html',
        source: 'CNBC',
        timeAgo: '2 hours ago',
        ticker: 'AAPL'
    },
    {
        id: 2,
        title: 'Tech Stocks Rally as AI Investments Drive Growth',
        url: 'https://www.reuters.com/technology/',
        source: 'Reuters',
        timeAgo: '4 hours ago',
        ticker: 'TSLA'
    },
    {
        id: 3,
        title: 'Market Report: Earnings Season Delivers Mixed Results',
        url: 'https://www.bloomberg.com/news/articles/2024-01-16/earnings-season-market-update',
        source: 'Bloomberg',
        timeAgo: '6 hours ago',
        ticker: 'MSFT'
    },
    {
        id: 4,
        title: 'Investing: How to Navigate Market Volatility',
        url: 'https://finance.yahoo.com/news/',
        source: 'Yahoo Finance',
        timeAgo: '8 hours ago',
        ticker: 'GOOGL'
    },
    {
        id: 5,
        title: 'Financial Markets: Banking Sector Shows Resilience',
        url: 'https://www.marketwatch.com/investing/index/spx',
        source: 'MarketWatch',
        timeAgo: '10 hours ago',
        ticker: 'JPM'
    }
];

// Economic Calendar Events
const economicEvents = [
    {
        id: 1,
        date: '2026-01-17',
        time: '14:00',
        country: 'USA',
        event: 'Initial Jobless Claims',
        forecast: '211K',
        previous: '212K',
        impact: 'high',
        description: 'Weekly jobless claims data - key labor market indicator'
    },
    {
        id: 2,
        date: '2026-01-17',
        time: '15:00',
        country: 'USA',
        event: 'Retail Sales',
        forecast: '0.4%',
        previous: '0.3%',
        impact: 'high',
        description: 'Measure of consumer spending at retail level'
    },
    {
        id: 3,
        date: '2026-01-16',
        time: '16:30',
        country: 'USA',
        event: 'Producer Price Index (PPI)',
        forecast: '0.3%',
        previous: '0.2%',
        impact: 'medium',
        description: 'Measures inflation at producer level'
    },
    {
        id: 4,
        date: '2026-01-18',
        time: '13:30',
        country: 'USA',
        event: 'Consumer Price Index (CPI)',
        forecast: '2.5%',
        previous: '2.4%',
        impact: 'high',
        description: 'Key inflation measure - closely watched by Fed'
    },
    {
        id: 5,
        date: '2026-01-20',
        time: '14:00',
        country: 'USA',
        event: 'Fed Interest Rate Decision',
        forecast: 'Hold',
        previous: '4.75%',
        impact: 'high',
        description: 'FOMC decides on interest rates - major market mover'
    },
    {
        id: 6,
        date: '2026-01-16',
        time: '10:00',
        country: 'EU',
        event: 'Eurozone Sentiment',
        forecast: '5.2',
        previous: '4.8',
        impact: 'low',
        description: 'Sentiment indicator for Eurozone economy'
    },
    {
        id: 7,
        date: '2026-01-19',
        time: '08:00',
        country: 'UK',
        event: 'Unemployment Rate',
        forecast: '4.0%',
        previous: '3.9%',
        impact: 'medium',
        description: 'UK labor market conditions'
    }
];

// Market Insights
const marketInsights = [
    {
        id: 1,
        title: 'Tech Sector Rally Continues',
        category: 'Market Analysis',
        sentiment: 'bullish',
        description: 'Major tech stocks continue upward momentum. AAPL breaks above $180, MSFT gains 3.1%. Strong earnings reports drive investor confidence.',
        source: 'Market Research',
        date: 'Jan 16, 2026'
    },
    {
        id: 2,
        title: 'Fed Meeting Awaited - Rate Decision Next Week',
        category: 'Central Banks',
        sentiment: 'neutral',
        description: 'Markets await Fed interest rate decision. Expectations lean towards status quo. Inflation data coming in line with expectations.',
        source: 'Economics',
        date: 'Jan 15, 2026'
    },
    {
        id: 3,
        title: 'Energy Stocks Face Pressure',
        category: 'Sector Analysis',
        sentiment: 'bearish',
        description: 'Oil prices decline amid demand concerns. Energy sector underperforms. XOM and similar stocks down 2-3%.',
        source: 'Commodities Analysis',
        date: 'Jan 14, 2026'
    },
    {
        id: 4,
        title: 'Healthcare Sector Shows Resilience',
        category: 'Sector Analysis',
        sentiment: 'bullish',
        description: 'Healthcare stocks maintain strength. JNJ gains on strong quarter outlook. Biotech firms show promise.',
        source: 'Healthcare Research',
        date: 'Jan 13, 2026'
    },
    {
        id: 5,
        title: 'Volatility Index Stabilizes',
        category: 'Risk Management',
        sentiment: 'neutral',
        description: 'VIX drops to 13.5 from 15.2. Market uncertainty decreases. Investors become less risk-averse.',
        source: 'Market Data',
        date: 'Jan 12, 2026'
    },
    {
        id: 6,
        title: 'Earnings Season Begins Strong',
        category: 'Earnings',
        sentiment: 'bullish',
        description: 'First wave of Q4 earnings exceed expectations. Tech and finance sectors lead. Guidance remains positive.',
        source: 'Earnings Reports',
        date: 'Jan 10, 2026'
    }
];

let watchlist = [];
let currentCalendarFilter = 'all';
let currentInsightFilter = 'all';
let currentNewsArticles = topNewsArticles;
let currentAnalysis = null;
let savedAnalyses = [];

// ===== WATCHLIST FUNCTIONS =====

function loadData() {
    watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    renderWatchlist();
    renderCalendar();
    renderInsights();
    renderNewsArticles();
}

function saveData() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function showAddStockModal() {
    document.getElementById('addStockModal').classList.add('active');
    document.getElementById('stockSymbol').focus();
}

function closeModal() {
    document.getElementById('addStockModal').classList.remove('active');
    document.getElementById('stockSymbol').value = '';
}

function addStock() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase().trim();

    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    if (watchlist.find(s => s.symbol === symbol)) {
        alert(`${symbol} is already in your watchlist`);
        return;
    }

    const stockData = mockStocks[symbol];
    if (!stockData) {
        alert(`${symbol} not found. Try: AAPL, GOOGL, MSFT, TSLA, JNJ, JPM`);
        return;
    }

    watchlist.push({ ...stockData });
    saveData();
    renderWatchlist();
    closeModal();
}

function removeStock(symbol) {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
        watchlist = watchlist.filter(s => s.symbol !== symbol);
        saveData();
        renderWatchlist();
    }
}

function renderWatchlist() {
    const container = document.getElementById('watchlistContainer');

    if (watchlist.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>No stocks in watchlist. Click "+ Add Stock" to begin.</p></div>';
        return;
    }

    container.innerHTML = watchlist.map(stock => {
        const changeClass = stock.change >= 0 ? 'profit' : 'loss';
        const changeSymbol = stock.change >= 0 ? '▲' : '▼';

        return `
            <div class="stock-item">
                <div class="stock-symbol">${stock.symbol}</div>
                <div style="opacity:0.7; font-size:0.9rem;">${stock.name}</div>
                <div class="stock-price">$${stock.price.toFixed(2)}</div>
                <div style="margin-top:5px; font-size:0.9rem;" class="${changeClass}">
                    ${changeSymbol} ${Math.abs(stock.change).toFixed(2)}%
                </div>
                <button class="btn btn-secondary btn-small" onclick="removeStock('${stock.symbol}')" style="margin-top:10px;width:100%;">Remove</button>
            </div>
        `;
    }).join('');
}

// ===== CALENDAR FUNCTIONS =====

function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    const filtered = filterEventsByImpact(economicEvents, currentCalendarFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No economic events match the selected filter.</p></div>';
        return;
    }

    filtered.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });

    container.innerHTML = filtered.map(event => `
        <div class="calendar-event ${event.impact}-impact">
            <div class="event-header">
                <div>
                    <div class="event-title">${event.event}</div>
                    <div style="font-size:0.9rem; color:#666; margin-top:4px;">📍 ${event.country}</div>
                </div>
                <div style="text-align:right;">
                    <div class="event-time">${event.date} ${event.time}</div>
                    <div class="event-impact ${event.impact}" style="margin-top:5px;">${event.impact} Impact</div>
                </div>
            </div>
            <div style="color:#666; margin:10px 0; font-size:0.9rem;">${event.description}</div>
            <div class="event-details">
                <div class="event-detail">
                    <div class="event-detail-label">Forecast</div>
                    <div class="event-detail-value">${event.forecast}</div>
                </div>
                <div class="event-detail">
                    <div class="event-detail-label">Previous</div>
                    <div class="event-detail-value">${event.previous}</div>
                </div>
                <div class="event-detail">
                    <div class="event-detail-label">Category</div>
                    <div class="event-detail-value">${event.country}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCalendarEvents() {
    currentCalendarFilter = document.getElementById('calendarFilter').value;
    renderCalendar();
}

function filterEventsByImpact(events, impact) {
    if (impact === 'all') return events;
    return events.filter(e => e.impact === impact);
}

// ===== INSIGHTS FUNCTIONS =====

function renderInsights() {
    const container = document.getElementById('insightsContainer');
    const filtered = filterInsightsBySentiment(marketInsights, currentInsightFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No insights match the selected filter.</p></div>';
        return;
    }

    container.innerHTML = filtered.map(insight => `
        <div class="insight-card ${insight.sentiment}">
            <div class="insight-header">
                <div>
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-category">${insight.category}</div>
                </div>
                <div class="insight-sentiment ${insight.sentiment}">${insight.sentiment.toUpperCase()}</div>
            </div>
            <div class="insight-description">${insight.description}</div>
            <div class="insight-source">📰 ${insight.source}</div>
            <div class="insight-footer">
                <span class="insight-date">${insight.date}</span>
                <a href="#" class="insight-read-more">Learn More →</a>
            </div>
        </div>
    `).join('');
}

function filterInsights() {
    currentInsightFilter = document.getElementById('insightFilter').value;
    renderInsights();
}

function filterInsightsBySentiment(insights, sentiment) {
    if (sentiment === 'all') return insights;
    return insights.filter(i => i.sentiment === sentiment);
}

// ===== NEWS ARTICLES FUNCTIONS =====

// Common stocks for autocomplete
const commonStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'MCD', name: "McDonald's Corporation" },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'SPOT', name: 'Spotify Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.' },
  { symbol: 'F', name: 'Ford Motor Company' }
];

// Handle ticker search autocomplete
function handleTickerSearch() {
    const input = document.getElementById('tickerSearch');
    const autocompleteDiv = document.getElementById('tickerAutocomplete');
    const query = input.value.trim().toUpperCase();
    
    if (!query || query.length < 1) {
        autocompleteDiv.style.display = 'none';
        return;
    }
    
    // Filter stocks matching the query
    const matches = commonStocks.filter(stock => 
        stock.symbol.startsWith(query) || stock.name.toUpperCase().includes(query)
    ).slice(0, 8);
    
    if (matches.length === 0) {
        autocompleteDiv.style.display = 'none';
        return;
    }
    
    // Display autocomplete suggestions
    autocompleteDiv.innerHTML = matches.map(stock => `
        <div style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #eee; hover: background: #f5f5f5;" 
             onmouseover="this.style.background='#f5f5f5'" 
             onmouseout="this.style.background='white'"
             onclick="selectTickerSuggestion('${stock.symbol}')">
            <strong>${stock.symbol}</strong> - ${stock.name}
        </div>
    `).join('');
    
    autocompleteDiv.style.display = 'block';
}

// Select a ticker from autocomplete suggestions
function selectTickerSuggestion(symbol) {
    document.getElementById('tickerSearch').value = symbol;
    document.getElementById('tickerAutocomplete').style.display = 'none';
}

async function searchNewsByTicker() {
    const ticker = document.getElementById('tickerSearch').value.trim().toUpperCase();
    
    if (!ticker) {
        alert('Please enter a stock ticker');
        return;
    }
    
    const resultDiv = document.getElementById('newsSearchContainer');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top: 3px solid #3E92CC; border-radius: 50%; animation: spin 1s linear infinite;"></div></div><p style="text-align: center; color: #666;">Fetching news for ' + ticker + '...</p>';
    
    try {
        const response = await fetch('/search-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: ticker })
        });
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            currentNewsArticles = data.articles;
            renderNewsArticles();
            resultDiv.style.display = 'none';
            document.getElementById('tickerSearch').value = '';
        } else {
            resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;"><p>No news articles found for ' + ticker + '. Try another ticker.</p></div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div style="color: #FF6B6B; text-align: center; padding: 20px;">Error fetching news. Please try again.</div>';
        console.error('News search error:', error);
    }
}

function renderNewsArticles() {
    const container = document.getElementById('newsArticlesContainer');
    
    if (!container) return;
    
    if (currentNewsArticles.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><p>No articles loaded. Use the search above to fetch news by ticker.</p></div>';
        return;
    }
    
    container.innerHTML = currentNewsArticles.map(article => `
        <div class="article">
            <div class="article-meta">
                <span class="source-badge">${article.source}</span>
                <span class="timestamp">${article.timeAgo}</span>
            </div>
            <p><a href="${article.url}" target="_blank">${article.title}</a></p>
            <div class="article-actions">
                <button class="analyse-btn" onclick="analyseArticle('${article.url}', 'result-${article.id}')">Analyse Sentiment</button>
            </div>
            <div id="result-${article.id}" class="analysis-result" style="display:none;"></div>
        </div>
    `).join('');
}

async function analyseArticle(url, resultDivId) {
    const resultDiv = document.getElementById(resultDivId);
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div class="loading"></div> Analysing sentiment...';

    try {
        const response = await fetch('/analyse-sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        const sentimentClass = data.sentiment === 'POSITIVE' ? 'sentiment-positive' : 
                             data.sentiment === 'NEGATIVE' ? 'sentiment-negative' : 'sentiment-neutral';
        const confidencePercent = Math.round(data.confidence * 100);

        // Store current analysis for saving
        currentAnalysis = {
            url: url,
            sentiment: data.sentiment,
            confidence: data.confidence,
            summary: data.summary
        };

        resultDiv.innerHTML = `
            <div class="sentiment-badge ${sentimentClass}">
                ${data.sentiment}
            </div>
            <div class="result-item">
                <div class="result-label">Confidence Score</div>
                <div class="result-value">${data.confidence.toFixed(2)}</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
                </div>
            </div>
            <div class="result-item">
                <div class="result-label">Summary</div>
                <div class="result-value">${data.summary}</div>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="showSaveAnalysisModal('${url}', '${data.sentiment}', ${data.confidence}, '${data.summary.replace(/'/g, "\\'")}')">💾 Save This Analysis</button>
        `;
    } catch (error) {
        resultDiv.innerHTML = '<div class="result-value" style="color: #fca5a5;">Analysis failed. Please try again.</div>';
        console.error('Analysis error:', error);
    }
}

function showSaveAnalysisModal(url, sentiment, confidence, summary) {
    const previewDiv = document.getElementById('analysisPreview');
    previewDiv.innerHTML = `
        <strong>URL:</strong> ${url.substring(0, 50)}...<br>
        <strong>Sentiment:</strong> <span style="color: ${sentiment === 'POSITIVE' ? '#10B981' : sentiment === 'NEGATIVE' ? '#FF6B6B' : '#3E92CC'}">${sentiment}</span><br>
        <strong>Confidence:</strong> ${(confidence * 100).toFixed(0)}%
    `;
    document.getElementById('analysisNotes').value = '';
    document.getElementById('saveAnalysisModal').classList.add('active');
}

function closeSaveModal() {
    document.getElementById('saveAnalysisModal').classList.remove('active');
}

async function saveAnalysisToServer() {
    if (!currentAnalysis) {
        return;
    }

    const notes = document.getElementById('analysisNotes').value;
    
    try {
        const response = await fetch('/analyses/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: currentAnalysis.url,
                sentiment: currentAnalysis.sentiment,
                confidence: currentAnalysis.confidence,
                summary: currentAnalysis.summary,
                notes: notes
            })
        });

        const result = await response.json();
        if (result.success) {
            closeSaveModal();
            loadSavedAnalyses();
        }
    } catch (error) {
        console.error('Save error:', error);
    }
}

async function loadSavedAnalyses() {
    try {
        const response = await fetch('/analyses');
        const data = await response.json();
        savedAnalyses = data.analyses;
        renderSavedAnalyses();
    } catch (error) {
        console.error('Error loading analyses:', error);
    }
}

function renderSavedAnalyses() {
    const container = document.getElementById('savedAnalysesContainer');
    const emptyState = document.getElementById('emptyAnalysesState');

    if (savedAnalyses.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    container.innerHTML = savedAnalyses.map(analysis => `
        <div class="saved-analysis-card" id="card-${analysis.id}">
            <div class="analysis-header">
                <div>
                    <div class="analysis-url">${analysis.url.substring(0, 60)}...</div>
                    <div class="analysis-date">${new Date(analysis.createdAt).toLocaleString()}</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="favorite-btn" onclick="toggleFavorite(${analysis.id})" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 5px;">
                        ${analysis.isFavorite ? '⭐' : '☆'}
                    </button>
                    <div class="sentiment-badge sentiment-${analysis.sentiment.toLowerCase()}">
                        ${analysis.sentiment}
                    </div>
                </div>
            </div>
            <div class="analysis-confidence">
                <strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(0)}%
            </div>
            <div class="analysis-summary">
                <strong>Summary:</strong> ${analysis.summary.substring(0, 100)}...
            </div>
            <div class="analysis-notes-section">
                <strong>Notes:</strong>
                <div id="notes-display-${analysis.id}" class="notes-display">
                    ${analysis.notes ? `<span id="note-text-${analysis.id}">${analysis.notes}</span>` : '<span id="note-text-' + analysis.id + '"><em>No notes yet</em></span>'}
                </div>
                <div id="notes-editor-${analysis.id}" class="notes-editor" style="display: none;">
                    <textarea id="notes-textarea-${analysis.id}" style="width: 100%; padding: 8px; border: 2px solid #3E92CC; border-radius: 4px; font-family: Arial; font-size: 0.9rem; min-height: 80px;">${analysis.notes || ''}</textarea>
                </div>
            </div>
            <div class="analysis-actions">
                <button class="btn btn-secondary btn-small" id="edit-btn-${analysis.id}" onclick="toggleEditNotes(${analysis.id})">✏️ Edit Notes</button>
                <button class="btn btn-secondary btn-small" id="cancel-btn-${analysis.id}" onclick="cancelEditNotes(${analysis.id})" style="display: none; background: #FFA500; color: white;">Cancel</button>
                <button class="btn btn-secondary btn-small" id="save-btn-${analysis.id}" onclick="saveNotes(${analysis.id})" style="display: none; background: #10B981; color: white;">✅ Save</button>
                <button class="btn btn-secondary btn-small" style="background: #FF6B6B; color: white;" onclick="deleteAnalysis(${analysis.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function toggleEditNotes(id) {
    const display = document.getElementById(`notes-display-${id}`);
    const editor = document.getElementById(`notes-editor-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);
    const saveBtn = document.getElementById(`save-btn-${id}`);
    const cancelBtn = document.getElementById(`cancel-btn-${id}`);
    const textarea = document.getElementById(`notes-textarea-${id}`);
    
    display.style.display = 'none';
    editor.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function cancelEditNotes(id) {
    const display = document.getElementById(`notes-display-${id}`);
    const editor = document.getElementById(`notes-editor-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);
    const saveBtn = document.getElementById(`save-btn-${id}`);
    const cancelBtn = document.getElementById(`cancel-btn-${id}`);
    
    display.style.display = 'block';
    editor.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

async function saveNotes(id) {
    const textarea = document.getElementById(`notes-textarea-${id}`);
    const newNotes = textarea.value;
    
    try {
        const response = await fetch(`/analyses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: newNotes })
        });

        const result = await response.json();
        if (result.success) {
            loadSavedAnalyses();
        }
    } catch (error) {
        console.error('Save notes error:', error);
    }
}

async function toggleFavorite(id) {
    try {
        const analysis = savedAnalyses.find(a => a.id === id);
        if (!analysis) return;
        
        const response = await fetch(`/analyses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: !analysis.isFavorite })
        });

        const result = await response.json();
        if (result.success) {
            loadSavedAnalyses();
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
    }
}

async function deleteAnalysis(id) {
    try {
        const response = await fetch(`/analyses/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            loadSavedAnalyses();
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}

// ===== SENTIMENT ANALYSIS FUNCTIONS =====

// ===== NAVBAR FUNCTIONS =====

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
            const sectionId = section.getAttribute('id');
            const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

function initNavbar() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only prevent default for hash links (internal sections)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setTimeout(updateActiveNavLink, 100);
                }
            }
            // Allow external links like portfolio.html to navigate normally
        });
    });
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initNavbar();
    loadSavedAnalyses();

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeSaveModal();
        }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('addStockModal');
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const saveModal = document.getElementById('saveAnalysisModal');
    window.addEventListener('click', (e) => {
        if (e.target === saveModal) closeSaveModal();
    });

    // Add Enter key support in modal
    document.getElementById('stockSymbol').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addStock();
    });

    // Add Enter key support for sentiment URL input
    const sentimentUrl = document.getElementById('sentimentUrl');
    if (sentimentUrl) {
        sentimentUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') analyzeSentiment();
        });
    }
});

// Spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
