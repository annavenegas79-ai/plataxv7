const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Service discovery (hardcoded for simplicity)
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    public: true
  },
  catalog: {
    url: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
    public: {
      GET: ['/products', '/products/:id', '/categories', '/search']
    }
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
    public: false
  },
  shipping: {
    url: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3004',
    public: {
      GET: ['/calculate-rates']
    }
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    public: false
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    services: Object.keys(services)
  });
});

// Setup proxy routes for each service
Object.entries(services).forEach(([service, config]) => {
  const proxyOptions = {
    target: config.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/${service}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('X-Request-ID', req.id);
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
      }
    }
  };
  
  // Check if route needs authentication
  const isPublicRoute = (method, path) => {
    if (config.public === true) return true;
    if (!config.public) return false;
    
    const publicPaths = config.public[method];
    if (!publicPaths) return false;
    
    // Check for exact match
    if (publicPaths.includes(path)) return true;
    
    // Check for parameterized routes
    return publicPaths.some(publicPath => {
      // Convert route pattern to regex
      const regexPattern = publicPath
        .replace(/:\w+/g, '[^/]+') // Replace :param with regex for any character except /
        .replace(/\//g, '\\/');    // Escape forward slashes
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(path);
    });
  };
  
  app.use(`/${service}`, (req, res, next) => {
    const path = req.path;
    const method = req.method;
    
    if (isPublicRoute(method, path)) {
      return next();
    }
    
    authenticate(req, res, next);
  }, createProxyMiddleware(proxyOptions));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error [${req.id}]:`, err);
  res.status(500).json({
    message: 'Internal server error',
    requestId: req.id
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;