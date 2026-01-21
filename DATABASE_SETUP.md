# Database & Authentication Setup Guide

## Prerequisites
1. **MySQL Server** installed and running
2. **Node.js** with npm installed

## Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `mysql2` - MySQL database driver
- `bcryptjs` - Password hashing
- `express-session` - Session management

## Step 2: Create MySQL Database
Open MySQL terminal or MySQL Workbench and create a database:

```sql
CREATE DATABASE sentiment_analyzer;
```

## Step 3: Configure Environment Variables
Create or update your `.env` file with:

```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sentiment_analyzer

# Session Secret (use a random string)
SESSION_SECRET=your_random_session_secret_key_here

# Existing Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Existing PayPal Configuration
PAYPAL_CLIENT_ID=YOUR_CLIENT_ID_HERE
PAYPAL_CLIENT_SECRET=YOUR_SECRET_HERE
PAYPAL_MODE=sandbox
```

## Step 4: Start Your Server
```bash
npm start
```

The app will automatically create the required tables:
- `users` - Stores user accounts (username, email, password, current plan)
- `subscriptions` - Tracks user subscriptions and payment history

## Features

### User Authentication
- **Register**: Create new account at `/register`
- **Login**: Log in at `/login`
- **Logout**: Click "Logout" in navigation

### Plan Management
- Users start with **FREE** plan
- Upgrade to **PRO** ($9.99/month) or **ENTERPRISE** ($49.99/month)
- Payment info automatically linked to user account
- User's plan displayed in navbar

### Database Schema

#### users table
| Column | Type | Notes |
|--------|------|-------|
| id | INT | Primary Key, Auto Increment |
| username | VARCHAR(100) | Unique |
| email | VARCHAR(100) | Unique |
| password | VARCHAR(255) | Hashed with bcryptjs |
| plan | VARCHAR(50) | free, pro, or enterprise |
| created_at | TIMESTAMP | Auto set |
| updated_at | TIMESTAMP | Auto update |

#### subscriptions table
| Column | Type | Notes |
|--------|------|-------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key to users |
| plan | VARCHAR(50) | Plan name |
| stripe_customer_id | VARCHAR(255) | Stripe transaction ID |
| paypal_order_id | VARCHAR(255) | PayPal transaction ID |
| payment_status | VARCHAR(50) | pending, completed |
| start_date | TIMESTAMP | When subscription started |
| end_date | DATETIME | When subscription ends |

## Troubleshooting

### Connection Error
If you get "Error: connect ECONNREFUSED 127.0.0.1:3306":
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env

### Table Creation Issues
- Delete your database and let the app recreate tables
- Or manually run the SQL in db.js

### Login Issues
- Ensure users are registered before logging in
- Check that passwords match during registration

## Testing the Flow

1. **Register a new user**: Go to `/register`
2. **Login**: Use your credentials at `/login`
3. **See your plan**: Check navbar (should show "FREE")
4. **Upgrade plan**: Click "Upgrade Plan" and purchase
5. **Check updated plan**: Refresh page - plan should update in navbar

---

For questions or issues, check your server console logs for detailed error messages.
