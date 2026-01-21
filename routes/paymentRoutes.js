const express = require("express");
const router = express.Router();
const { getStripeKey, getPayPalId, createPaymentIntent, handleWebhook } = require("../controllers/paymentController");

// Get Stripe public key
router.get("/get-stripe-key", getStripeKey);

// Get PayPal client ID
router.get("/get-paypal-id", getPayPalId);

// Create Stripe Payment Intent
router.post("/create-payment-intent", createPaymentIntent);

// Webhook for payment confirmation
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;
