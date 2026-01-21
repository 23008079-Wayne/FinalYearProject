// Home page
function getHomePage(req, res) {
  res.render("index", { articles: null, user: req.session.user });
}

// Pricing/Payment page
function getPricingPage(req, res) {
  res.render("payment", { user: req.session.user });
}

module.exports = {
  getHomePage,
  getPricingPage
};
