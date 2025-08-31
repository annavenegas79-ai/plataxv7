const express = require('express');
const { createClient } = require('redis');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platamx_notifications',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis client for pub/sub
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Initialize Firebase Admin for push notifications
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'your-smtp-user',
    pass: process.env.SMTP_PASS || 'your-smtp-password'
  }
});

// Initialize database tables
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(255) PRIMARY KEY,
        email_enabled BOOLEAN DEFAULT TRUE,
        push_enabled BOOLEAN DEFAULT TRUE,
        sms_enabled BOOLEAN DEFAULT FALSE,
        marketing_emails BOOLEAN DEFAULT TRUE,
        order_updates BOOLEAN DEFAULT TRUE,
        promotions BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_devices (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        device_token VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, device_token)
      );
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Subscribe to Redis channels for different events
const subscribeToEvents = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  
  // Order events
  await subscriber.subscribe('order:created', async (message) => {
    try {
      const order = JSON.parse(message);
      await sendOrderNotification(order, 'created');
    } catch (error) {
      console.error('Error processing order:created event:', error);
    }
  });
  
  await subscriber.subscribe('order:updated', async (message) => {
    try {
      const order = JSON.parse(message);
      await sendOrderNotification(order, 'updated');
    } catch (error) {
      console.error('Error processing order:updated event:', error);
    }
  });
  
  // Shipment events
  await subscriber.subscribe('shipment:created', async (message) => {
    try {
      const shipment = JSON.parse(message);
      await sendShipmentNotification(shipment, 'created');
    } catch (error) {
      console.error('Error processing shipment:created event:', error);
    }
  });
  
  await subscriber.subscribe('shipment:updated', async (message) => {
    try {
      const shipment = JSON.parse(message);
      await sendShipmentNotification(shipment, 'updated');
    } catch (error) {
      console.error('Error processing shipment:updated event:', error);
    }
  });
  
  // Payment events
  await subscriber.subscribe('payment:completed', async (message) => {
    try {
      const payment = JSON.parse(message);
      await sendPaymentNotification(payment, 'completed');
    } catch (error) {
      console.error('Error processing payment:completed event:', error);
    }
  });
  
  await subscriber.subscribe('payment:failed', async (message) => {
    try {
      const payment = JSON.parse(message);
      await sendPaymentNotification(payment, 'failed');
    } catch (error) {
      console.error('Error processing payment:failed event:', error);
    }
  });
  
  console.log('Subscribed to Redis channels');
};

// Helper functions for sending notifications
const sendOrderNotification = async (order, status) => {
  const { userId, orderId, items } = order;
  
  // Get user preferences
  const prefsResult = await pool.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  
  const prefs = prefsResult.rows[0] || { 
    email_enabled: true, 
    push_enabled: true,
    order_updates: true 
  };
  
  if (!prefs.order_updates) {
    return;
  }
  
  let title, message;
  
  switch (status) {
    case 'created':
      title = 'Pedido confirmado';
      message = `Tu pedido #${orderId} ha sido confirmado. ¡Gracias por tu compra!`;
      break;
    case 'updated':
      title = 'Actualización de pedido';
      message = `Tu pedido #${orderId} ha sido actualizado.`;
      break;
    default:
      title = 'Actualización de pedido';
      message = `Hay una actualización en tu pedido #${orderId}.`;
  }
  
  // Create notification record
  const notificationId = uuidv4();
  
  await pool.query(
    `INSERT INTO notifications (
      id, user_id, type, title, message, data
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      notificationId,
      userId,
      `order_${status}`,
      title,
      message,
      JSON.stringify(order)
    ]
  );
  
  // Send email notification if enabled
  if (prefs.email_enabled) {
    await sendEmail(userId, title, message, {
      type: 'order',
      orderId,
      status
    });
  }
  
  // Send push notification if enabled
  if (prefs.push_enabled) {
    await sendPushNotification(userId, title, message, {
      type: 'order',
      orderId,
      status
    });
  }
};

const sendShipmentNotification = async (shipment, status) => {
  const { userId, orderId, trackingNumber } = shipment;
  
  // Get user preferences
  const prefsResult = await pool.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  
  const prefs = prefsResult.rows[0] || { 
    email_enabled: true, 
    push_enabled: true,
    order_updates: true 
  };
  
  if (!prefs.order_updates) {
    return;
  }
  
  let title, message;
  
  switch (status) {
    case 'created':
      title = 'Envío confirmado';
      message = `Tu pedido #${orderId} ha sido enviado. Número de seguimiento: ${trackingNumber}`;
      break;
    case 'updated':
      title = 'Actualización de envío';
      message = `Hay una actualización en el envío de tu pedido #${orderId}.`;
      break;
    default:
      title = 'Actualización de envío';
      message = `Hay una actualización en el envío de tu pedido #${orderId}.`;
  }
  
  // Create notification record
  const notificationId = uuidv4();
  
  await pool.query(
    `INSERT INTO notifications (
      id, user_id, type, title, message, data
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      notificationId,
      userId,
      `shipment_${status}`,
      title,
      message,
      JSON.stringify(shipment)
    ]
  );
  
  // Send email notification if enabled
  if (prefs.email_enabled) {
    await sendEmail(userId, title, message, {
      type: 'shipment',
      orderId,
      trackingNumber,
      status
    });
  }
  
  // Send push notification if enabled
  if (prefs.push_enabled) {
    await sendPushNotification(userId, title, message, {
      type: 'shipment',
      orderId,
      trackingNumber,
      status
    });
  }
};

const sendPaymentNotification = async (payment, status) => {
  const { userId, orderId, amount } = payment;
  
  // Get user preferences
  const prefsResult = await pool.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  
  const prefs = prefsResult.rows[0] || { 
    email_enabled: true, 
    push_enabled: true,
    order_updates: true 
  };
  
  if (!prefs.order_updates) {
    return;
  }
  
  let title, message;
  
  switch (status) {
    case 'completed':
      title = 'Pago confirmado';
      message = `Tu pago de $${amount} para el pedido #${orderId} ha sido confirmado.`;
      break;
    case 'failed':
      title = 'Pago fallido';
      message = `Tu pago para el pedido #${orderId} no pudo ser procesado. Por favor, intenta nuevamente.`;
      break;
    default:
      title = 'Actualización de pago';
      message = `Hay una actualización en el pago de tu pedido #${orderId}.`;
  }
  
  // Create notification record
  const notificationId = uuidv4();
  
  await pool.query(
    `INSERT INTO notifications (
      id, user_id, type, title, message, data
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      notificationId,
      userId,
      `payment_${status}`,
      title,
      message,
      JSON.stringify(payment)
    ]
  );
  
  // Send email notification if enabled
  if (prefs.email_enabled) {
    await sendEmail(userId, title, message, {
      type: 'payment',
      orderId,
      amount,
      status
    });
  }
  
  // Send push notification if enabled
  if (prefs.push_enabled) {
    await sendPushNotification(userId, title, message, {
      type: 'payment',
      orderId,
      amount,
      status
    });
  }
};

const sendEmail = async (userId, subject, text, data) => {
  try {
    // In a real implementation, you would fetch the user's email from a database
    const userEmail = `user-${userId}@example.com`;
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@platamx.com',
      to: userEmail,
      subject,
      text,
      html: `<p>${text}</p>`
    });
    
    console.log(`Email sent to ${userEmail}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendPushNotification = async (userId, title, body, data) => {
  try {
    // Get user devices
    const devicesResult = await pool.query(
      'SELECT * FROM user_devices WHERE user_id = $1',
      [userId]
    );
    
    if (devicesResult.rows.length === 0) {
      return;
    }
    
    const deviceTokens = devicesResult.rows.map(device => device.device_token);
    
    // Send push notification using Firebase
    if (admin.messaging) {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens: deviceTokens
      };
      
      const response = await admin.messaging().sendMulticast(message);
      console.log(`Push notification sent to ${response.successCount} devices`);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Routes
app.post('/register-device', async (req, res) => {
  try {
    const { userId, deviceToken, deviceType } = req.body;
    
    if (!userId || !deviceToken || !deviceType) {
      return res.status(400).json({ message: 'Missing required device information' });
    }
    
    // Check if device already registered
    const existingResult = await pool.query(
      'SELECT * FROM user_devices WHERE user_id = $1 AND device_token = $2',
      [userId, deviceToken]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing device
      await pool.query(
        'UPDATE user_devices SET device_type = $1, updated_at = NOW() WHERE user_id = $2 AND device_token = $3',
        [deviceType, userId, deviceToken]
      );
    } else {
      // Register new device
      const id = uuidv4();
      
      await pool.query(
        'INSERT INTO user_devices (id, user_id, device_token, device_type) VALUES ($1, $2, $3, $4)',
        [id, userId, deviceToken, deviceType]
      );
    }
    
    res.status(201).json({ message: 'Device registered successfully' });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/preferences', async (req, res) => {
  try {
    const { 
      userId, 
      emailEnabled, 
      pushEnabled, 
      smsEnabled,
      marketingEmails,
      orderUpdates,
      promotions
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if preferences already exist
    const existingResult = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing preferences
      await pool.query(
        `UPDATE user_preferences SET 
          email_enabled = $1, 
          push_enabled = $2, 
          sms_enabled = $3,
          marketing_emails = $4,
          order_updates = $5,
          promotions = $6,
          updated_at = NOW()
        WHERE user_id = $7`,
        [
          emailEnabled !== undefined ? emailEnabled : existingResult.rows[0].email_enabled,
          pushEnabled !== undefined ? pushEnabled : existingResult.rows[0].push_enabled,
          smsEnabled !== undefined ? smsEnabled : existingResult.rows[0].sms_enabled,
          marketingEmails !== undefined ? marketingEmails : existingResult.rows[0].marketing_emails,
          orderUpdates !== undefined ? orderUpdates : existingResult.rows[0].order_updates,
          promotions !== undefined ? promotions : existingResult.rows[0].promotions,
          userId
        ]
      );
    } else {
      // Create new preferences
      await pool.query(
        `INSERT INTO user_preferences (
          user_id, email_enabled, push_enabled, sms_enabled,
          marketing_emails, order_updates, promotions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          emailEnabled !== undefined ? emailEnabled : true,
          pushEnabled !== undefined ? pushEnabled : true,
          smsEnabled !== undefined ? smsEnabled : false,
          marketingEmails !== undefined ? marketingEmails : true,
          orderUpdates !== undefined ? orderUpdates : true,
          promotions !== undefined ? promotions : true
        ]
      );
    }
    
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Return default preferences
      return res.json({
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        marketingEmails: true,
        orderUpdates: true,
        promotions: true
      });
    }
    
    const prefs = result.rows[0];
    
    res.json({
      userId: prefs.user_id,
      emailEnabled: prefs.email_enabled,
      pushEnabled: prefs.push_enabled,
      smsEnabled: prefs.sms_enabled,
      marketingEmails: prefs.marketing_emails,
      orderUpdates: prefs.order_updates,
      promotions: prefs.promotions
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const queryParams = [userId];
    
    if (unreadOnly === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    
    const result = await pool.query(
      query,
      [...queryParams, limit, offset]
    );
    
    // Count total notifications
    let countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
    if (unreadOnly === 'true') {
      countQuery += ' AND is_read = FALSE';
    }
    
    const countResult = await pool.query(
      countQuery,
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      notifications: result.rows,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/user/:userId/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual notification sending endpoint (for testing)
app.post('/send-notification', async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required notification information' });
    }
    
    // Create notification record
    const notificationId = uuidv4();
    
    await pool.query(
      `INSERT INTO notifications (
        id, user_id, type, title, message, data
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        notificationId,
        userId,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      ]
    );
    
    // Get user preferences
    const prefsResult = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    
    const prefs = prefsResult.rows[0] || { 
      email_enabled: true, 
      push_enabled: true
    };
    
    // Send email notification if enabled
    if (prefs.email_enabled) {
      await sendEmail(userId, title, message, data);
    }
    
    // Send push notification if enabled
    if (prefs.push_enabled) {
      await sendPushNotification(userId, title, message, data);
    }
    
    res.status(201).json({
      id: notificationId,
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Notification service is running' });
});

// Start server
const startServer = async () => {
  try {
    await initDb();
    await redisClient.connect();
    await subscribeToEvents();
    
    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
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
  await redisClient.disconnect();
  await pool.end();
  process.exit(0);
});

module.exports = app;