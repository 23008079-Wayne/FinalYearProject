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
  'AAPL': 248.50,
  'GOOGL': 195.75,
  'MSFT': 445.30,
  'TSLA': 287.65,
  'JNJ': 185.20,
  'JPM': 225.40
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

// Get live stock price from Finnhub API with API key
async function getLiveStockPrice(req, res) {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({ error: "Symbol is required" });
  }

  try {
    const axios = require('axios');
    const symbol_upper = symbol.toUpperCase();
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    if (!finnhubKey) {
      console.warn('⚠️  FINNHUB_API_KEY not set in .env file');
    }
    
    // Use Finnhub API with API key
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
        params: {
          symbol: symbol_upper,
          token: finnhubKey
        },
        timeout: 5000
      });
      
      if (response.data?.c && response.data.c > 0) {
        return res.json({
          symbol: symbol_upper,
          price: response.data.c,
          name: symbol_upper,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          source: 'finnhub'
        });
      }
    } catch (finnhubError) {
      console.error(`Finnhub API error for ${symbol_upper}:`, finnhubError.message);
    }
    
    // Fallback to hardcoded price if available
    if (stockPrices[symbol_upper]) {
      return res.json({
        symbol: symbol_upper,
        price: stockPrices[symbol_upper],
        name: symbol_upper,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'cached'
      });
    }
    
    res.status(404).json({ error: "Stock not found", symbol: symbol_upper });
  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.error(`Error fetching live price for ${symbol}:`, errorMessage);
    
    // Final fallback: return cached price if available
    if (stockPrices[symbol.toUpperCase()]) {
      return res.json({
        symbol: symbol.toUpperCase(),
        price: stockPrices[symbol.toUpperCase()],
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'cached'
      });
    }
    
    res.status(500).json({ 
      error: "Unable to fetch stock price. Using cached price if available.",
      symbol: symbol
    });
  }
}

// Comprehensive list of common stocks for autocomplete
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
  { symbol: 'MCD', name: 'McDonald\'s Corporation' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'SPOT', name: 'Spotify Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.' },
  { symbol: 'F', name: 'Ford Motor Company' },
  { symbol: 'GM', name: 'General Motors' },
  { symbol: 'UBER', name: 'Uber Technologies' },
  { symbol: 'LYFT', name: 'Lyft Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global' }
];

// Search for stocks by query (symbol or name)
async function searchStocks(req, res) {
  const { query } = req.query;
  
  if (!query || query.length < 1) {
    return res.json({ results: commonStocks.slice(0, 10) });
  }

  try {
    const axios = require('axios');
    const query_upper = query.toUpperCase();
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    // Filter common stocks first (instant autocomplete)
    const autocompleteResults = commonStocks
      .filter(stock => 
        stock.symbol.startsWith(query_upper) || 
        stock.name.toUpperCase().includes(query_upper)
      )
      .slice(0, 8);
    
    // Try to get prices for results using Finnhub
    const resultsWithPrices = await Promise.all(
      autocompleteResults.map(async (stock) => {
        try {
          const priceResponse = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: { 
              symbol: stock.symbol,
              token: finnhubKey
            },
            timeout: 3000
          });
          
          const price = priceResponse.data?.c || stockPrices[stock.symbol] || 'Loading...';
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: price
          };
        } catch (err) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: stockPrices[stock.symbol] || 'N/A'
          };
        }
      })
    );
    
    res.json({ results: resultsWithPrices });
  } catch (error) {
    console.error(`Error in searchStocks:`, error.message);
    // Return common stocks on error
    const filtered = commonStocks
      .filter(s => s.symbol.includes(query.toUpperCase()) || s.name.toUpperCase().includes(query.toUpperCase()))
      .slice(0, 8);
    
    res.json({ results: filtered.length > 0 ? filtered : commonStocks.slice(0, 5) });
  }
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

  try {
    // Try to get live price first, fall back to hardcoded if fails
    let price = null;
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    try {
      const axios = require('axios');
      const quoteResponse = await axios.get(`https://finnhub.io/api/v1/quote`, {
        params: { 
          symbol: symbol.toUpperCase(),
          token: finnhubKey
        },
        timeout: 5000
      });

      if (quoteResponse.data.c && quoteResponse.data.c > 0) {
        price = quoteResponse.data.c;
      }
    } catch (error) {
      // Fall back to hardcoded prices
      price = stockPrices[symbol];
    }

    if (!price) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const totalPrice = price * shares * 100; // Stripe uses cents

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
  getLiveStockPrice,
  searchStocks,
  createCheckoutSession,
  processPayment,
  sellShares
};
