const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

// Apply authentication to all inventory routes
router.use(authenticateToken);

// Get inventory with pagination
router.get('/', 
  validateRequest(schemas.pagination),
  inventoryController.getInventory
);

// Get inventory statistics
router.get('/stats', 
  inventoryController.getInventoryStats
);

// Get low stock items
router.get('/low-stock', 
  inventoryController.getLowStockItems
);

// Get out of stock items
router.get('/out-of-stock', 
  inventoryController.getOutOfStockItems
);

// Get inventory history for a product
router.get('/history/:productId', 
  validateRequest({
    params: {
      productId: require('joi').string().uuid().required()
    },
    query: {
      days: require('joi').number().integer().min(1).max(365).default(30)
    }
  }),
  inventoryController.getInventoryHistory
);

// Get inventory by product ID
router.get('/product/:productId', 
  validateRequest({
    params: {
      productId: require('joi').string().uuid().required()
    }
  }),
  inventoryController.getInventoryByProductId
);

// Update inventory
router.put('/product/:productId', 
  validateRequest(schemas.updateInventory),
  inventoryController.updateInventory
);

// Adjust stock
router.post('/adjust', 
  validateRequest(schemas.adjustStock),
  inventoryController.adjustStock
);

// Bulk update inventory
router.post('/bulk-update', 
  validateRequest({
    body: {
      updates: require('joi').array().items(
        require('joi').object({
          productId: require('joi').string().uuid().required(),
          quantity: require('joi').number().integer().min(0).required()
        })
      ).min(1).required()
    }
  }),
  inventoryController.bulkUpdateInventory
);

module.exports = router;