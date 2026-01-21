const bcrypt = require('bcryptjs');
const { pool } = require('./db');

// Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare passwords
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Register user
async function registerUser(username, email, password) {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await hashPassword(password);
    
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, plan) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'free']
    );

    return {
      success: true,
      userId: result.insertId,
      message: 'User registered successfully'
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Username or email already exists'
      };
    }
    throw error;
  } finally {
    connection.release();
  }
}

// Login user
async function loginUser(username, password) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const user = rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan
      }
    };
  } finally {
    connection.release();
  }
}

// Get user by ID
async function getUserById(userId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, username, email, plan FROM users WHERE id = ?',
      [userId]
    );

    return rows[0] || null;
  } finally {
    connection.release();
  }
}

// Update user plan
async function updateUserPlan(userId, plan) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE users SET plan = ? WHERE id = ?',
      [plan, userId]
    );

    return {
      success: true,
      message: 'Plan updated successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// Create subscription
async function createSubscription(userId, plan, paymentMethod, paymentId) {
  const connection = await pool.getConnection();
  try {
    const columnName = paymentMethod === 'stripe' ? 'stripe_customer_id' : 'paypal_order_id';
    
    const [result] = await connection.execute(
      `INSERT INTO subscriptions (user_id, plan, ${columnName}, payment_status) VALUES (?, ?, ?, ?)`,
      [userId, plan, paymentId, 'completed']
    );

    // Update user plan
    await updateUserPlan(userId, plan);

    return {
      success: true,
      subscriptionId: result.insertId
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  getUserById,
  updateUserPlan,
  createSubscription,
  isAuthenticated
};
