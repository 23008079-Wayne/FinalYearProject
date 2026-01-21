const { exec } = require("child_process");
const fetch = require("node-fetch");
const xml2js = require("xml2js");

// Helper function to convert date to time ago format
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

// Search for latest 5 news articles
async function searchArticles(req, res) {
  const ticker = req.body.ticker.toUpperCase();
  const rssUrl = `https://finance.yahoo.com/rss/headline?s=${ticker}`;

  try {
    const response = await fetch(rssUrl);
    const xml = await response.text();
    const result = await xml2js.parseStringPromise(xml);

    const items = result.rss.channel[0].item.slice(0, 5).map(item => {
      const pubDate = item.pubDate ? new Date(item.pubDate[0]) : null;
      const timeAgo = pubDate ? getTimeAgo(pubDate) : "Unknown";
      
      return {
        title: item.title[0],
        url: item.link[0],
        pubDate: pubDate,
        timeAgo: timeAgo,
        source: "Yahoo Finance"
      };
    });

    res.render("index", { articles: items, user: req.session.user });
  } catch (err) {
    res.render("index", { articles: [], error: "Failed to fetch news.", user: req.session.user });
  }
}

// Analyse a single article
function analyseArticle(req, res) {
  const { articleUrl } = req.body;

  if (!articleUrl || !articleUrl.startsWith("http")) {
    return res.json({ sentiment: "N/A", confidence: 0, summary: "Invalid URL" });
  }

  exec(`python nlp/analyse.py "${articleUrl}"`, (error, stdout) => {
    if (error) return res.json({ sentiment: "N/A", confidence: 0, summary: "Error analysing article" });
    const result = JSON.parse(stdout);
    res.json(result);
  });
}

module.exports = {
  searchArticles,
  analyseArticle
};
