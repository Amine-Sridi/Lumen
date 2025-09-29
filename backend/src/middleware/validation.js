const Joi = require('joi');

// Validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = {};
      error.details.forEach(detail => {
        const key = detail.path.join('.');
        validationErrors[key] = detail.message;
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors
      });
    }

    // Replace request data with validated data
    req.body = value.body || req.body;
    req.query = value.query || req.query;
    req.params = value.params || req.params;

    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    body: Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(6).max(255).required(),
      firstName: Joi.string().min(1).max(100).required(),
      lastName: Joi.string().min(1).max(100).required(),
      phone: Joi.string().max(20).optional(),
      businessName: Joi.string().max(255).optional(),
      businessType: Joi.string().max(100).optional(),
      businessAddress: Joi.string().optional()
    }).required()
  }),

  // User login
  login: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }).required()
  }),

  // Refresh token
  refreshToken: Joi.object({
    body: Joi.object({
      refreshToken: Joi.string().required()
    }).required()
  }),

  // Product creation
  createProduct: Joi.object({
    body: Joi.object({
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().optional(),
      barcode: Joi.string().min(1).max(100).required(),
      price: Joi.number().positive().precision(2).required(),
      category: Joi.string().max(100).optional(),
      brand: Joi.string().max(100).optional(),
      imageUrl: Joi.string().uri().optional(),
      initialQuantity: Joi.number().integer().min(0).required()
    }).required()
  }),

  // Product update
  updateProduct: Joi.object({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }).required(),
    body: Joi.object({
      name: Joi.string().min(1).max(255).optional(),
      description: Joi.string().optional(),
      price: Joi.number().positive().precision(2).optional(),
      category: Joi.string().max(100).optional(),
      brand: Joi.string().max(100).optional(),
      imageUrl: Joi.string().uri().optional()
    }).required()
  }),

  // Product by ID
  getProduct: Joi.object({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }).required()
  }),

  // Product by barcode
  getProductByBarcode: Joi.object({
    params: Joi.object({
      barcode: Joi.string().required()
    }).required()
  }),

  // Products by category
  getProductsByCategory: Joi.object({
    params: Joi.object({
      category: Joi.string().required()
    }).required()
  }),

  // Product search
  searchProducts: Joi.object({
    query: Joi.object({
      q: Joi.string().min(1).max(255).required()
    }).required()
  }),

  // Pagination
  pagination: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50)
    }).optional()
  }),

  // Sale creation
  createSale: Joi.object({
    body: Joi.object({
      productId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().positive().precision(2).optional(),
      notes: Joi.string().optional()
    }).required()
  }),

  // Inventory update
  updateInventory: Joi.object({
    params: Joi.object({
      productId: Joi.string().uuid().required()
    }).required(),
    body: Joi.object({
      quantity: Joi.number().integer().min(0).optional(),
      minimumStock: Joi.number().integer().min(0).optional(),
      maximumStock: Joi.number().integer().min(0).optional()
    }).required()
  }),

  // Stock adjustment
  adjustStock: Joi.object({
    body: Joi.object({
      productId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().not(0).required(),
      type: Joi.string().valid('addition', 'subtraction', 'sale', 'damage', 'expired', 'correction').required(),
      reason: Joi.string().optional()
    }).required()
  }),

  // Date range queries
  dateRange: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    }).optional()
  }),

  // Top products query
  topProducts: Joi.object({
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(10),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    }).optional()
  }),

  // Profile update
  updateProfile: Joi.object({
    body: Joi.object({
      firstName: Joi.string().min(1).max(100).optional(),
      lastName: Joi.string().min(1).max(100).optional(),
      phone: Joi.string().max(20).optional().allow(''),
      businessName: Joi.string().max(255).optional().allow(''),
      businessType: Joi.string().max(100).optional().allow(''),
      businessAddress: Joi.string().optional().allow('')
    }).required()
  }),

  // Change password
  changePassword: Joi.object({
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).max(255).required()
    }).required()
  })
};

module.exports = {
  validateRequest,
  schemas
};