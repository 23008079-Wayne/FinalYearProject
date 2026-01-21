const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_KEY");
const { createSubscription } = require("../auth");

// Get Stripe public key
function getStripeKey(req, res) {
  res.json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
}

// Get PayPal client ID
function getPayPalId(req, res) {
  res.json({ paypalClientId: process.env.PAYPAL_CLIENT_ID });
}

// Create Stripe Payment Intent
async function createPaymentIntent(req, res) {
  const { amount, plan, email } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      metadata: {
        plan: plan,
        email: email,
        userId: userId
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(400).json({ error: error.message });
  }
}

// Webhook for payment confirmation
async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = parseInt(paymentIntent.metadata.userId);
    const plan = paymentIntent.metadata.plan;
    
    try {
      await createSubscription(userId, plan, 'stripe', paymentIntent.id);
      console.log(`Payment succeeded for user ${userId}, plan: ${plan}`);
    } catch (error) {
      console.error("Error creating subscription:", error);
    }
  }

  res.json({ received: true });
}

module.exports = {
  getStripeKey,
  getPayPalId,
  createPaymentIntent,
  handleWebhook
};
