const axios = require('axios');

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox' 
  ? 'https://api.sandbox.paypal.com'
  : 'https://api.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_ID = process.env.PAYPAL_SECRET_ID;

// In-memory storage for PayPal orders (to track before payment)
let paypalOrders = {};

// Get PayPal access token
async function getPayPalAccessToken() {
  try {
    // Debug: Log to verify credentials are loaded
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_ID) {
      throw new Error(`Missing PayPal credentials. CLIENT_ID: ${!!PAYPAL_CLIENT_ID}, SECRET_ID: ${!!PAYPAL_SECRET_ID}`);
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_ID}`).toString('base64');
    
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error.response?.data || error.message);
    throw error;
  }
}

// Create PayPal order
async function createPayPalOrder(req, res) {
  const { symbol, shares, userId } = req.body;
  
  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: "Invalid symbol or shares" });
  }

  const user = userId || 'default_user';
  const stockPrices = {
    'AAPL': 248.50,
    'GOOGL': 195.75,
    'MSFT': 445.30,
    'TSLA': 287.65,
    'JNJ': 185.20,
    'JPM': 225.40
  };

  try {
    // Try to get live price first, fall back to hardcoded if fails
    let price = null;
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    try {
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

    const amount = (price * shares).toFixed(2);

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: amount
              }
            }
          },
          items: [
            {
              name: `${symbol} - ${shares} shares @ $${price.toFixed(2)}`,
              quantity: String(shares),
              unit_amount: {
                currency_code: 'USD',
                value: price.toFixed(2)
              }
            }
          ],
          description: `Purchase ${shares} shares of ${symbol}`
        }
      ],
      application_context: {
        brand_name: 'FinanceAI',
        return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/paypal-success`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/paypal-cancelled`
      }
    };

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Store order details for later
    const orderId = response.data.id;
    paypalOrders[orderId] = {
      symbol,
      shares,
      userId: user,
      amount,
      timestamp: new Date()
    };

    // Find the approval link
    const approvalLink = response.data.links.find(link => link.rel === 'approve');

    res.json({
      orderId: orderId,
      approvalUrl: approvalLink?.href
    });
  } catch (error) {
    console.error('PayPal order creation error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
}

// Capture PayPal payment
async function capturePayPalPayment(req, res) {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Order ID required" });
  }

  if (!paypalOrders[orderId]) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = paypalOrders[orderId];

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      // Payment successful - return details for portfolio update
      res.json({
        success: true,
        orderId: orderId,
        symbol: order.symbol,
        shares: order.shares,
        userId: order.userId,
        amount: order.amount,
        paymentStatus: response.data.status
      });
      
      // Clean up order
      delete paypalOrders[orderId];
    } else {
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
}

module.exports = {
  createPayPalOrder,
  capturePayPalPayment
};
