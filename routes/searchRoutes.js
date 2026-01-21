const express = require("express");
const router = express.Router();
const { searchArticles, analyseArticle } = require("../controllers/searchController");

// Search for latest 5 news articles
router.post("/search", searchArticles);

// Analyse a single article
router.post("/analyse", analyseArticle);

module.exports = router;
