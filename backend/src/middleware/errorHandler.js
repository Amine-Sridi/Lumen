const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lumen-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors || err.message
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const validationErrors = {};
    err.errors.forEach(error => {
      validationErrors[error.path] = error.message;
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: validationErrors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Referenced resource does not exist',
      code: 'FOREIGN_KEY_ERROR'
    });
  }

  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND'
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler middleware
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND'
  });
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    });
  });

  next();
};

module.exports = {
  logger,
  errorHandler,
  notFoundHandler,
  requestLogger
};