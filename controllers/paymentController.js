const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_KEY_HERE');

// In-memory storage for portfolio (will be replaced with userId-based later)
let userPortfolio = {
  'default_user': {
    cash: 10000,
    holdings: {}, // { 'AAPL': { shares: 10, avgCost: 150 }, ... }
    transactions: []
  }
};

// Mock stock prices (in real app, fetch from API)
const stockPrices = {
  'AAPL': 178.50,
  'GOOGL': 142.30,
  'MSFT': 378.20,
  'TSLA': 248.75,
  'JNJ': 160.00,
  'JPM': 195.00
};

// Get user portfolio
function getPortfolio(req, res) {
  const userId = req.query.userId || 'default_user';
  
  if (!userPortfolio[userId]) {
    return res.status(404).json({ error: "Portfolio not found" });
  }

  const portfolio = userPortfolio[userId];
  const holdingsWithValues = {};
  let totalValue = 0;

  for (const symbol in portfolio.holdings) {
    const holding = portfolio.holdings[symbol];
    const currentPrice = stockPrices[symbol] || 0;
    const value = holding.shares * currentPrice;
    holdingsWithValues[symbol] = {
      shares: holding.shares,
      avgCost: holding.avgCost,
      currentPrice: currentPrice,
      value: value
    };
    totalValue += value;
  }

  res.json({
    userId,
    cash: portfolio.cash,
    holdings: holdingsWithValues,
    totalValue: totalValue + portfolio.cash,
    portfolioValue: totalValue,
    transactions: portfolio.transactions
  });
}

// Get transaction history
function getTransactions(req, res) {
  const userId = req.query.userId || 'default_user';
  
  if (!userPortfolio[userId]) {
    return res.status(404).json({ error: "Portfolio not found" });
  }

  res.json({
    userId,
    transactions: userPortfolio[userId].transactions
  });
}

// Get stock price
function getStockPrice(req, res) {
  const { symbol } = req.params;
  
  if (!stockPrices[symbol]) {
    return res.status(404).json({ error: "Stock not found" });
  }

  res.json({
    symbol: symbol,
    price: stockPrices[symbol],
    timestamp: new Date().toISOString()
  });
}

// Create checkout session for buying stock
async function createCheckoutSession(req, res) {
  const { symbol, shares, userId } = req.body;
  
  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: "Invalid symbol or shares" });
  }

  const user = userId || 'default_user';
  
  if (!userPortfolio[user]) {
    userPortfolio[user] = {
      cash: 10000,
      holdings: {},
      transactions: []
    };
  }

  const price = stockPrices[symbol];
  if (!price) {
    return res.status(404).json({ error: "Stock not found" });
  }

  const totalPrice = price * shares * 100; // Stripe uses cents

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${symbol} - ${shares} shares @ $${price.toFixed(2)}`,
              description: `Purchase ${shares} shares of ${symbol}`
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: shares,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&symbol=${symbol}&shares=${shares}&userId=${user}`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-cancelled`,
      metadata: {
        symbol: symbol,
        shares: shares,
        userId: user,
        type: 'stock_purchase'
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Process successful payment and update portfolio
async function processPayment(req, res) {
  const { sessionId, symbol, shares, userId } = req.body;
  
  const user = userId || 'default_user';
  
  if (!userPortfolio[user]) {
    return res.status(404).json({ error: "Portfolio not found" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const portfolio = userPortfolio[user];
    const price = stockPrices[symbol];
    const totalCost = price * parseInt(shares);

    // Check if user has enough cash
    if (portfolio.cash < totalCost) {
      return res.status(400).json({ error: "Insufficient cash" });
    }

    // Update portfolio
    if (!portfolio.holdings[symbol]) {
      portfolio.holdings[symbol] = { shares: 0, avgCost: 0 };
    }

    const holding = portfolio.holdings[symbol];
    const oldValue = holding.shares * holding.avgCost;
    const newValue = parseInt(shares) * price;
    
    // Calculate new average cost
    holding.avgCost = (oldValue + newValue) / (holding.shares + parseInt(shares));
    holding.shares += parseInt(shares);

    // Deduct cash
    portfolio.cash -= totalCost;

    // Record transaction
    portfolio.transactions.push({
      id: Date.now(),
      type: 'buy',
      symbol: symbol,
      shares: parseInt(shares),
      price: price,
      total: totalCost,
      date: new Date().toISOString(),
      paymentId: sessionId
    });

    console.log(`✅ Purchased ${shares} shares of ${symbol} for $${totalCost.toFixed(2)}`);

    res.json({
      success: true,
      message: `Successfully purchased ${shares} shares of ${symbol}`,
      portfolio: {
        holdings: portfolio.holdings,
        cash: portfolio.cash
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Sell shares (without payment, just update portfolio)
function sellShares(req, res) {
  const { symbol, shares, userId } = req.body;
  
  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: "Invalid symbol or shares" });
  }

  const user = userId || 'default_user';
  
  if (!userPortfolio[user]) {
    return res.status(404).json({ error: "Portfolio not found" });
  }

  const portfolio = userPortfolio[user];
  const price = stockPrices[symbol];
  
  if (!price) {
    return res.status(404).json({ error: "Stock not found" });
  }

  if (!portfolio.holdings[symbol] || portfolio.holdings[symbol].shares < shares) {
    return res.status(400).json({ error: "Insufficient shares to sell" });
  }

  const holding = portfolio.holdings[symbol];
  const totalProceeds = price * parseInt(shares);

  // Update holdings
  holding.shares -= parseInt(shares);
  if (holding.shares === 0) {
    delete portfolio.holdings[symbol];
  }

  // Add cash
  portfolio.cash += totalProceeds;

  // Record transaction
  portfolio.transactions.push({
    id: Date.now(),
    type: 'sell',
    symbol: symbol,
    shares: parseInt(shares),
    price: price,
    total: totalProceeds,
    date: new Date().toISOString()
  });

  console.log(`✅ Sold ${shares} shares of ${symbol} for $${totalProceeds.toFixed(2)}`);

  res.json({
    success: true,
    message: `Successfully sold ${shares} shares of ${symbol}`,
    proceeds: totalProceeds,
    portfolio: {
      holdings: portfolio.holdings,
      cash: portfolio.cash
    }
  });
}

module.exports = {
  getPortfolio,
  getTransactions,
  getStockPrice,
  createCheckoutSession,
  processPayment,
  sellShares
};
