require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');

// Import database
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow localhost and expo development URLs
      if (origin.includes('localhost') || 
          origin.includes('192.168.') || 
          origin.startsWith('exp://') ||
          allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    } else {
      // In production, strictly check against allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lumen API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lumen Inventory Management API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Database is managed by migrations, no sync needed
    console.log('✅ Database ready (migrations handle schema).');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server is running on port', PORT);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 ${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('🔒 HTTP server closed.');
        
        db.sequelize.close().then(() => {
          console.log('💾 Database connection closed.');
          process.exit(0);
        }).catch(err => {
          console.error('❌ Error closing database connection:', err);
          process.exit(1);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;