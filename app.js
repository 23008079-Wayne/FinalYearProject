const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();

const { pool, initializeDatabase } = require("./db");

// Import routes
const searchRoutes = require("./routes/searchRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const pageRoutes = require("./routes/pageRoutes");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Use routes
app.use("/", pageRoutes);
app.use("/", searchRoutes);
app.use("/", paymentRoutes);



// Get Stripe public key
app.get("/get-stripe-key", (req, res) => {
  res.json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});

// Get PayPal client ID
app.get("/get-paypal-id", (req, res) => {
  res.json({ paypalClientId: process.env.PAYPAL_CLIENT_ID });
});

// Create Stripe Payment Intent
app.post("/create-payment-intent", async (req, res) => {
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
});

// Webhook for payment confirmation
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
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
});

app.listen(3000, async () => {
  await initializeDatabase();
  console.log("Server running at http://localhost:3000");
});
