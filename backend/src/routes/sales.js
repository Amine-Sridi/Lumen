const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

// Apply authentication to all sales routes
router.use(authenticateToken);

// Get sales with pagination
router.get('/', 
  validateRequest(schemas.pagination),
  salesController.getSales
);

// Get sales summary
router.get('/summary', 
  validateRequest(schemas.dateRange),
  salesController.getSalesSummary
);

// Get sales by date range
router.get('/date-range', 
  validateRequest({
    query: {
      startDate: require('joi').date().iso().required(),
      endDate: require('joi').date().iso().min(require('joi').ref('startDate')).required()
    }
  }),
  salesController.getSalesByDateRange
);

// Get top selling products
router.get('/top-products', 
  validateRequest(schemas.topProducts),
  salesController.getTopSellingProducts
);

// Get daily sales report
router.get('/daily-report/:date', 
  validateRequest({
    params: {
      date: require('joi').date().iso().required()
    }
  }),
  salesController.getDailySalesReport
);

// Get monthly sales report
router.get('/monthly-report/:year/:month', 
  validateRequest({
    params: {
      year: require('joi').number().integer().min(2020).max(2050).required(),
      month: require('joi').number().integer().min(1).max(12).required()
    }
  }),
  salesController.getMonthlySalesReport
);

// Get sales by product
router.get('/product/:productId', 
  validateRequest({
    params: {
      productId: require('joi').string().uuid().required()
    }
  }),
  salesController.getSalesByProduct
);

// Get single sale by ID
router.get('/:id', 
  validateRequest({
    params: {
      id: require('joi').string().uuid().required()
    }
  }),
  salesController.getSaleById
);

// Create new sale
router.post('/', 
  validateRequest(schemas.createSale),
  salesController.createSale
);

// Cancel sale
router.post('/:saleId/cancel', 
  validateRequest({
    params: {
      saleId: require('joi').string().uuid().required()
    },
    body: {
      reason: require('joi').string().optional()
    }
  }),
  salesController.cancelSale
);

module.exports = router;