const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platamx_payments',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
        payment_method VARCHAR(50) NOT NULL,
        payment_provider VARCHAR(50) NOT NULL,
        provider_payment_id VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        last_four VARCHAR(4),
        expiry_month VARCHAR(2),
        expiry_year VARCHAR(4),
        card_brand VARCHAR(50),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Routes
app.post('/process-payment', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      userId, 
      orderId, 
      amount, 
      currency = 'MXN', 
      paymentMethod,
      paymentToken 
    } = req.body;
    
    if (!userId || !orderId || !amount || !paymentMethod || !paymentToken) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Create payment record
    const paymentId = uuidv4();
    let stripePaymentId = null;
    
    // Process with Stripe
    if (paymentMethod === 'card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe requires cents
        currency: currency.toLowerCase(),
        payment_method: paymentToken,
        confirm: true,
        return_url: 'https://platamx.com/payment-confirmation'
      });
      
      stripePaymentId = paymentIntent.id;
      
      // Insert payment record
      await client.query(
        `INSERT INTO payments (
          id, user_id, order_id, amount, currency, payment_method, 
          payment_provider, provider_payment_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          paymentId, 
          userId, 
          orderId, 
          amount, 
          currency, 
          paymentMethod, 
          'stripe', 
          stripePaymentId, 
          paymentIntent.status
        ]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      res.status(201).json({
        paymentId,
        status: paymentIntent.status,
        providerPaymentId: stripePaymentId
      });
    } else {
      // Handle other payment methods
      return res.status(400).json({ message: 'Unsupported payment method' });
    }
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    console.error('Payment processing error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Payment processing failed' });
  } finally {
    client.release();
  }
});

app.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/payments', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      payments: result.rows,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/payment-methods', async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      provider, 
      lastFour, 
      expiryMonth, 
      expiryYear, 
      cardBrand,
      isDefault = false 
    } = req.body;
    
    if (!userId || !type || !provider) {
      return res.status(400).json({ message: 'Missing required payment method information' });
    }
    
    const id = uuidv4();
    
    // If setting as default, update existing payment methods
    if (isDefault) {
      await pool.query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }
    
    // Insert new payment method
    await pool.query(
      `INSERT INTO payment_methods (
        id, user_id, type, provider, last_four, expiry_month, 
        expiry_year, card_brand, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id, 
        userId, 
        type, 
        provider, 
        lastFour, 
        expiryMonth, 
        expiryYear, 
        cardBrand, 
        isDefault
      ]
    );
    
    res.status(201).json({
      id,
      userId,
      type,
      provider,
      lastFour,
      expiryMonth,
      expiryYear,
      cardBrand,
      isDefault
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/payment-methods', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Payment service is running' });
});

// Start server
const startServer = async () => {
  try {
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

module.exports = app;