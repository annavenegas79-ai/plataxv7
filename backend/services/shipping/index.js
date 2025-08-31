const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platamx_shipping',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_addresses (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        street VARCHAR(255) NOT NULL,
        number VARCHAR(50) NOT NULL,
        interior VARCHAR(50),
        neighborhood VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        country VARCHAR(2) NOT NULL DEFAULT 'MX',
        phone VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        address_id UUID NOT NULL REFERENCES shipping_addresses(id),
        carrier VARCHAR(50) NOT NULL,
        tracking_number VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        estimated_delivery TIMESTAMP,
        shipping_cost DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS tracking_updates (
        id UUID PRIMARY KEY,
        shipment_id UUID NOT NULL REFERENCES shipments(id),
        status VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Mock shipping carriers API
const carriers = {
  'fedex': {
    baseUrl: 'https://api.fedex.com',
    apiKey: process.env.FEDEX_API_KEY || 'mock-fedex-key'
  },
  'dhl': {
    baseUrl: 'https://api.dhl.com',
    apiKey: process.env.DHL_API_KEY || 'mock-dhl-key'
  },
  'estafeta': {
    baseUrl: 'https://api.estafeta.com',
    apiKey: process.env.ESTAFETA_API_KEY || 'mock-estafeta-key'
  }
};

// Mock shipping rates calculation
const calculateShippingRates = async (origin, destination, packages) => {
  // In a real implementation, this would call carrier APIs
  const mockRates = [
    {
      carrier: 'fedex',
      service: 'EXPRESS',
      cost: 120.50,
      currency: 'MXN',
      estimatedDays: 2
    },
    {
      carrier: 'fedex',
      service: 'STANDARD',
      cost: 85.75,
      currency: 'MXN',
      estimatedDays: 4
    },
    {
      carrier: 'dhl',
      service: 'EXPRESS',
      cost: 135.00,
      currency: 'MXN',
      estimatedDays: 1
    },
    {
      carrier: 'estafeta',
      service: 'STANDARD',
      cost: 79.99,
      currency: 'MXN',
      estimatedDays: 3
    }
  ];
  
  return mockRates;
};

// Routes
app.post('/addresses', async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      street, 
      number, 
      interior, 
      neighborhood, 
      city, 
      state, 
      postalCode, 
      country = 'MX', 
      phone,
      isDefault = false 
    } = req.body;
    
    if (!userId || !name || !street || !number || !neighborhood || !city || !state || !postalCode || !phone) {
      return res.status(400).json({ message: 'Missing required address information' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const id = uuidv4();
      
      // If setting as default, update existing addresses
      if (isDefault) {
        await client.query(
          'UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = $1',
          [userId]
        );
      }
      
      // Insert new address
      await client.query(
        `INSERT INTO shipping_addresses (
          id, user_id, name, street, number, interior, neighborhood, 
          city, state, postal_code, country, phone, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id, 
          userId, 
          name, 
          street, 
          number, 
          interior, 
          neighborhood, 
          city, 
          state, 
          postalCode, 
          country, 
          phone, 
          isDefault
        ]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        id,
        userId,
        name,
        street,
        number,
        interior,
        neighborhood,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/addresses', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM shipping_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/calculate-rates', async (req, res) => {
  try {
    const { origin, destination, packages } = req.body;
    
    if (!origin || !destination || !packages) {
      return res.status(400).json({ message: 'Missing required shipping information' });
    }
    
    const rates = await calculateShippingRates(origin, destination, packages);
    
    res.json({ rates });
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    res.status(500).json({ message: 'Failed to calculate shipping rates' });
  }
});

app.post('/shipments', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      orderId, 
      userId, 
      addressId, 
      carrier, 
      service,
      packages
    } = req.body;
    
    if (!orderId || !userId || !addressId || !carrier || !packages) {
      return res.status(400).json({ message: 'Missing required shipment information' });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Verify address exists
    const addressResult = await client.query(
      'SELECT * FROM shipping_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );
    
    if (addressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Shipping address not found' });
    }
    
    // In a real implementation, this would call the carrier API to create a shipment
    // For this example, we'll mock the response
    const mockTrackingNumber = `${carrier.toUpperCase()}-${Math.floor(Math.random() * 1000000000)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (carrier === 'fedex' ? 2 : 3));
    
    // Calculate shipping cost
    const rates = await calculateShippingRates(
      { postalCode: '11000' }, // Mock origin
      { postalCode: addressResult.rows[0].postal_code },
      packages
    );
    
    const selectedRate = rates.find(rate => 
      rate.carrier === carrier && rate.service === service
    ) || rates[0];
    
    // Create shipment record
    const shipmentId = uuidv4();
    
    await client.query(
      `INSERT INTO shipments (
        id, order_id, user_id, address_id, carrier, tracking_number, 
        status, estimated_delivery, shipping_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        shipmentId,
        orderId,
        userId,
        addressId,
        carrier,
        mockTrackingNumber,
        'CREATED',
        estimatedDelivery,
        selectedRate.cost
      ]
    );
    
    // Create initial tracking update
    const trackingUpdateId = uuidv4();
    
    await client.query(
      `INSERT INTO tracking_updates (
        id, shipment_id, status, location, description, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        trackingUpdateId,
        shipmentId,
        'CREATED',
        'Shipping Center',
        'Shipment has been created',
        new Date()
      ]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      id: shipmentId,
      orderId,
      userId,
      addressId,
      carrier,
      trackingNumber: mockTrackingNumber,
      status: 'CREATED',
      estimatedDelivery,
      shippingCost: selectedRate.cost
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    console.error('Error creating shipment:', error);
    res.status(500).json({ message: 'Failed to create shipment' });
  } finally {
    client.release();
  }
});

app.get('/shipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipmentResult = await pool.query(
      'SELECT * FROM shipments WHERE id = $1',
      [id]
    );
    
    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    const shipment = shipmentResult.rows[0];
    
    // Get tracking updates
    const trackingResult = await pool.query(
      'SELECT * FROM tracking_updates WHERE shipment_id = $1 ORDER BY timestamp DESC',
      [id]
    );
    
    // Get address details
    const addressResult = await pool.query(
      'SELECT * FROM shipping_addresses WHERE id = $1',
      [shipment.address_id]
    );
    
    res.json({
      ...shipment,
      address: addressResult.rows[0] || null,
      trackingUpdates: trackingResult.rows
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/shipments', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      'SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM shipments WHERE user_id = $1',
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      shipments: result.rows,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching user shipments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Shipping service is running' });
});

// Start server
const startServer = async () => {
  try {
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Shipping service running on port ${PORT}`);
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