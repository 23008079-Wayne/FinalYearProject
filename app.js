require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const { 
  initializeModels,
  analyseSentiment, 
  saveAnalysis, 
  getAnalyses, 
  getAnalysis, 
  updateAnalysis, 
  deleteAnalysis 
} = require("./controllers/sentimentController");
const {
  getPortfolio,
  getTransactions,
  getStockPrice,
  getLiveStockPrice,
  searchStocks,
  createCheckoutSession,
  processPayment,
  sellShares
} = require("./controllers/paymentController");
const {
  createPayPalOrder,
  capturePayPalPayment
} = require("./controllers/paypalController");
const { init: initDatabase } = require("./models");

// Serve static files from the public directory
app.use(express.static("public"));
app.use(express.json());

// Initialize database and models
let models = null;
(async () => {
  models = await initDatabase();
  initializeModels(models);
  console.log('✅ Database and sentiment models initialized');
})();

// Serve index.html at root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve portfolio.html
app.get("/portfolio.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "portfolio.html"));
});

// Payment success/cancelled routes
app.get("/payment-success", (req, res) => {
    res.redirect(`/portfolio.html?session_id=${req.query.session_id}&symbol=${req.query.symbol}&shares=${req.query.shares}&userId=${req.query.userId}`);
});

app.get("/payment-cancelled", (req, res) => {
    res.redirect('/portfolio.html');
});

// PayPal success/cancelled routes
app.get("/paypal-success", (req, res) => {
    const { orderID } = req.query;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Successful</title>
            <link rel="stylesheet" href="/css/styles.css">
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
                .receipt-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                .success-icon { font-size: 48px; margin-bottom: 20px; }
                h1 { color: #27ae60; margin: 20px 0; }
                .order-id { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; }
                .btn { padding: 12px 24px; margin: 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
                .btn-primary { background: #3498db; color: white; }
                .btn-primary:hover { background: #2980b9; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="success-icon">✅</div>
                <h1>Payment Successful!</h1>
                <p>Your stock purchase has been completed successfully.</p>
                ${orderID ? `<div class="order-id">Order ID: ${orderID}</div>` : ''}
                <p>Your shares have been added to your portfolio.</p>
                <button class="btn btn-primary" onclick="window.location.href='/portfolio.html'">Back to Portfolio</button>
            </div>
        </body>
        </html>
    `);
});

app.get("/paypal-cancelled", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Cancelled</title>
            <link rel="stylesheet" href="/css/styles.css">
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
                .receipt-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                .cancel-icon { font-size: 48px; margin-bottom: 20px; }
                h1 { color: #e74c3c; margin: 20px 0; }
                .btn { padding: 12px 24px; margin: 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
                .btn-primary { background: #3498db; color: white; }
                .btn-primary:hover { background: #2980b9; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="cancel-icon">❌</div>
                <h1>Payment Cancelled</h1>
                <p>Your payment has been cancelled. No charges were made.</p>
                <p>Feel free to return and complete your purchase anytime.</p>
                <button class="btn btn-primary" onclick="window.location.href='/portfolio.html'">Back to Portfolio</button>
            </div>
        </body>
        </html>
    `);
});

// Currency Exchange Rates endpoint
app.get("/api/exchange-rates", async (req, res) => {
    try {
        const axios = require('axios');
        const apiKey = process.env.OPEN_EXCHANGE_RATES_API_KEY;
        
        if (!apiKey || apiKey === 'your_open_exchange_rates_api_key_here') {
            // Return mock rates if API key not set
            return res.json({
                base: 'USD',
                rates: {
                    'USD': 1.0,
                    'EUR': 0.92,
                    'GBP': 0.79,
                    'JPY': 149.50,
                    'CAD': 1.36,
                    'AUD': 1.53,
                    'CHF': 0.88,
                    'CNY': 7.24,
                    'INR': 83.12,
                    'MXN': 17.05
                },
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
        const response = await axios.get('https://openexchangerates.org/api/latest.json', {
            params: {
                app_id: apiKey,
                base: 'USD',
                symbols: 'EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,MXN'
            },
            timeout: 5000
        });
        
        res.json({
            base: response.data.base,
            rates: response.data.rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        // Return fallback rates
        res.json({
            base: 'USD',
            rates: {
                'USD': 1.0,
                'EUR': 0.92,
                'GBP': 0.79,
                'JPY': 149.50,
                'CAD': 1.36,
                'AUD': 1.53,
                'CHF': 0.88,
                'CNY': 7.24,
                'INR': 83.12,
                'MXN': 17.05
            },
            timestamp: new Date().toISOString(),
            fallback: true
        });
    }
});

// Sentiment Analysis endpoint
app.post("/analyse-sentiment", analyseSentiment);

// CRUD endpoints for sentiment analyses
app.post("/analyses/save", saveAnalysis);        // Create
app.get("/analyses", getAnalyses);              // Read all
app.get("/analyses/:id", getAnalysis);          // Read one
app.put("/analyses/:id", updateAnalysis);       // Update
app.delete("/analyses/:id", deleteAnalysis);    // Delete

// Payment & Portfolio endpoints
app.get("/api/portfolio", getPortfolio);              // Get portfolio
app.get("/api/transactions", getTransactions);        // Get transaction history
app.get("/api/stock-price/:symbol", getStockPrice);   // Get stock price
app.get("/api/live-price/:symbol", getLiveStockPrice); // Get live stock price from Yahoo Finance
app.get("/api/search-stocks", searchStocks);          // Search for stocks
app.post("/api/checkout", createCheckoutSession);     // Create Stripe session
app.post("/api/process-payment", processPayment);     // Process payment & update portfolio
app.post("/api/sell-shares", sellShares);             // Sell shares

// PayPal endpoints
app.post("/api/paypal/create-order", createPayPalOrder);     // Create PayPal order
app.post("/api/paypal/capture-payment", capturePayPalPayment); // Capture PayPal payment

app.get("/analyses/:id", getAnalysis);          // Read one
app.put("/analyses/:id", updateAnalysis);       // Update
app.delete("/analyses/:id", deleteAnalysis);    // Delete

// Function to fetch top 5 news articles for a ticker
async function fetchNewsForTicker(ticker) {
    try {
        const fetch = (await import('node-fetch')).default;
        const xml2js = require('xml2js');

        const rssUrl = `https://finance.yahoo.com/rss/headline?s=${ticker}`;
        const response = await fetch(rssUrl);
        const xml = await response.text();
        const result = await xml2js.parseStringPromise(xml);
        
        function getTimeAgo(date) {
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            let interval = Math.floor(seconds / 31536000);
            if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
            interval = Math.floor(seconds / 2592000);
            if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
            interval = Math.floor(seconds / 60);
            if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
            return Math.floor(seconds) + " second" + (seconds > 1 ? "s" : "") + " ago";
        }
        
        const items = result.rss.channel[0].item.slice(0, 5).map((item, idx) => {
            const pubDate = item.pubDate ? new Date(item.pubDate[0]) : null;
            const timeAgo = pubDate ? getTimeAgo(pubDate) : "Unknown";
            return {
                id: idx + 1,
                title: item.title[0],
                url: item.link[0],
                pubDate: pubDate,
                timeAgo: timeAgo,
                source: "Yahoo Finance",
                ticker: ticker
            };
        });
        
        return items;
    } catch (err) {
        console.error('Error fetching news:', err);
        return [];
    }
}

// Search news endpoint
app.post("/search-news", async (req, res) => {
    const { ticker } = req.body;
    
    if (!ticker || ticker.length === 0) {
        return res.json({ articles: [] });
    }
    
    const articles = await fetchNewsForTicker(ticker);
    res.json({ articles: articles });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(` FinanceAI server running on http://localhost:${PORT}`);
    console.log(` Watchlist, Calendar & Insights Dashboard ready!`);
});

