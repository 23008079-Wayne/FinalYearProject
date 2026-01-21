# Payment Integration Setup Guide

## Stripe Sandbox Setup

1. **Create a Stripe Account** (if you don't have one):
   - Go to https://dashboard.stripe.com
   - Sign up for a free account

2. **Get Your Stripe Sandbox Keys**:
   - Go to https://dashboard.stripe.com/test/keys
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_`)
     - **Secret key** (starts with `sk_test_`)

3. **Update .env file**:
   ```
   STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```

4. **Test Card Numbers** (for Stripe sandbox):
   - Visa: `4242 4242 4242 4242`
   - Mastercard: `5555 5555 5555 4444`
   - American Express: `3782 822463 10005`
   - Use any future expiry date and any CVC

---

## PayPal Sandbox Setup

1. **Create PayPal Developer Account**:
   - Go to https://developer.paypal.com/dashboard
   - Sign up with your PayPal account (or create one)

2. **Get Sandbox Credentials**:
   - Go to https://developer.paypal.com/dashboard/apps/sandbox
   - Click on "Sandbox" and view your apps
   - You'll see Business and Personal accounts
   - Note: Client ID for business account (Merchant)

3. **Update .env file**:
   ```
   PAYPAL_CLIENT_ID=YOUR_CLIENT_ID_HERE
   PAYPAL_CLIENT_SECRET=YOUR_SECRET_HERE
   PAYPAL_MODE=sandbox
   ```

4. **Test Sandbox Accounts**:
   - Business account (merchant) - for receiving payments
   - Personal account (buyer) - for testing payments
   - Check https://developer.paypal.com/dashboard/accounts

---

## Testing Your Payment Page

1. **Start your server**:
   ```
   npm start
   ```

2. **Visit the pricing page**:
   ```
   http://localhost:3000/pricing
   ```

3. **Test a Stripe payment**:
   - Click "Upgrade to Pro"
   - Select "Stripe (Card)"
   - Enter test card number: `4242 4242 4242 4242`
   - Enter any future date and CVC
   - Complete the payment

4. **Test a PayPal payment**:
   - Click "Upgrade to Enterprise"
   - Select "PayPal"
   - You'll be redirected to PayPal sandbox
   - Log in with your sandbox personal account
   - Complete the payment

---

## Important Notes

- All transactions in sandbox mode are **not real** and don't charge any cards
- Keep your Secret keys private (don't commit .env to git)
- Add `.env` to `.gitignore`:
  ```
  echo ".env" >> .gitignore
  ```

---

## Going Live (Production)

When ready for production:

1. Switch to **Live keys** from your Stripe dashboard
2. Get PayPal **Live credentials** and set `PAYPAL_MODE=live`
3. Update your `.env` with production keys
4. Set up webhook secrets for payment confirmations
5. Implement a database to track user subscriptions

---

## Webhook Setup (Optional but Recommended)

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/webhook`
3. Subscribe to: `payment_intent.succeeded`
4. Copy signing secret and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

This ensures your database updates when payments succeed, even if the response gets lost.
