const express = require("express");
const router = express.Router();
const { getHomePage, getPricingPage } = require("../controllers/pageController");

// Home page
router.get("/", getHomePage);

// Pricing/Payment page
router.get("/pricing", getPricingPage);

module.exports = router;
