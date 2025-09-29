const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

// Apply authentication to all product routes
router.use(authenticateToken);

// Get products with pagination
router.get('/', 
  validateRequest(schemas.pagination),
  productController.getProducts
);

// Search products
router.get('/search', 
  validateRequest(schemas.searchProducts),
  productController.searchProducts
);

// Get product categories
router.get('/categories', 
  productController.getCategories
);

// Get products by category
router.get('/category/:category', 
  validateRequest(schemas.getProductsByCategory),
  productController.getProductsByCategory
);

// Get product by barcode (for scanning)
router.get('/barcode/:barcode', 
  validateRequest(schemas.getProductByBarcode),
  productController.getProductByBarcode
);

// Get single product by ID
router.get('/:id', 
  validateRequest(schemas.getProduct),
  productController.getProductById
);

// Create new product
router.post('/', 
  validateRequest(schemas.createProduct),
  productController.createProduct
);

// Update product
router.put('/:id', 
  validateRequest(schemas.updateProduct),
  productController.updateProduct
);

// Delete product
router.delete('/:id', 
  validateRequest(schemas.getProduct),
  productController.deleteProduct
);

module.exports = router;