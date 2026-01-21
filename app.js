// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');

const db = require('./db');
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const adminController = require('./controllers/adminController');
const stockController = require('./controllers/stockController');
const { checkAuthenticated, checkAdmin } = require('./middleware/auth');

// multer upload middleware
const upload = require('./middleware/upload');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for JSON / some multipart edge cases
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'superSecretStockPortal',
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());

// Debug logging
app.use((req, res, next) => {
  console.log(`HIT: ${req.method} ${req.url}`);
  next();
});

// Globals for views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// Ensure admin user exists
async function ensureAdminExists() {
  try {
    const [admins] = await db
      .promise()
      .query('SELECT * FROM users WHERE roleId = 2 LIMIT 1');

    if (admins.length > 0) {
      console.log('Admin already exists.');
      return;
    }

    const hashed = await bcrypt.hash('Admin123!', 10);

    const [result] = await db
      .promise()
      .query(
        'INSERT INTO users (username, email, password, roleId) VALUES (?,?,?,2)',
        ['admin', 'admin@stock.com', hashed]
      );

    await db
      .promise()
      .query(
        'INSERT INTO user_profiles (userId, fullName, bio) VALUES (?,?,?)',
        [result.insertId, 'System Admin', 'Auto-created admin']
      );

    console.log('Default admin created: username=admin, password=Admin123!');
  } catch (err) {
    console.error('Error ensuring admin exists:', err);
  }
}

ensureAdminExists();

// ---------------- ROUTES ----------------

// Home
app.get('/', (req, res) => {
  res.render('home', { title: 'Marketmind Home' });
});

// Auth
app.get('/register', authController.showRegister);
app.post('/register', authController.register);

app.get('/login', authController.showLogin);
app.post('/login', authController.login);

app.get('/logout', authController.logout);

// Profile
app.get('/profile', checkAuthenticated, profileController.showProfile);

app.post(
  '/profile',
  checkAuthenticated,
  upload.single('avatar'),
  profileController.updateProfile
);

// Change password
app.post(
  '/profile/password',
  checkAuthenticated,
  profileController.updatePassword
);

// Admin
app.get('/admin/dashboard', checkAdmin, adminController.showDashboard);
// Admin User Management
app.get('/admin/users', checkAdmin, adminController.listUsers);
app.get('/admin/users/edit/:id', checkAdmin, adminController.showEditUser);
app.post('/admin/users/edit/:id', checkAdmin, adminController.updateUser);
app.post('/admin/users/delete/:id', checkAdmin, adminController.deleteUser);

// Freeze / Unfreeze
app.post('/admin/users/freeze/:id', checkAdmin, adminController.freezeUser);
app.post('/admin/users/unfreeze/:id', checkAdmin, adminController.unfreezeUser);

// User Stocks
app.get('/stocks', checkAuthenticated, stockController.showMyStocks);
app.post('/stocks', checkAuthenticated, stockController.addStock);
app.post('/stocks/:stockId/edit', checkAuthenticated, stockController.editStock);
app.post('/stocks/:stockId/delete', checkAuthenticated, stockController.deleteStock);

// Admin Stocks
app.get('/admin/stocks', checkAdmin, stockController.adminShowAllStocks);
app.post('/admin/stocks/:stockId/freeze', checkAdmin, stockController.freezeStock);
app.post('/admin/stocks/:stockId/unfreeze', checkAdmin, stockController.unfreezeStock);
app.get('/admin/stocks/report', checkAdmin, stockController.getExcessHoldingsReport);
app.get('/admin/stocks/export', checkAdmin, stockController.exportReport);



// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
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
