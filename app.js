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

