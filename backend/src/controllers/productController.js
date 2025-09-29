const { Product, Inventory, User } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

// Get paginated list of products for current user
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const products = await Product.findAll({
      where: { 
        userId: userId
      },
      order: [['created_at', 'DESC']]
    });
    
    const totalProducts = products.length;

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: {
        items: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalProducts,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: 'Products fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Search products by name, barcode, category, or brand
const searchProducts = async (req, res, next) => {
  try {
    const { q: query } = req.query;
    const userId = req.user.id;

    const products = await Product.searchProducts(query, userId, 50);

    res.json({
      success: true,
      data: products,
      message: 'Products searched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findOne({
      where: { 
        id: id,
        userId: userId,
        isActive: true 
      },
      include: [{
        model: Inventory,
        as: 'inventory',
        required: false
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get product by barcode (for scanning)
const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const userId = req.user.id;

    const product = await Product.findByBarcodeAndUser(barcode, userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product found by barcode'
    });
  } catch (error) {
    next(error);
  }
};

// Create new product with initial inventory
const createProduct = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { name, description, barcode, price, category, brand, imageUrl, initialQuantity } = req.body;
    const userId = req.user.id;

    // Check if barcode already exists for this user
    const existingProduct = await Product.findOne({
      where: { 
        barcode: barcode,
        userId: userId 
      },
      transaction
    });

    if (existingProduct) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: 'Product with this barcode already exists',
        code: 'BARCODE_EXISTS'
      });
    }

    // Create product
    const product = await Product.create({
      userId,
      name,
      description,
      barcode,
      price,
      category,
      brand,
      imageUrl
    }, { transaction });

    // Create initial inventory
    const inventory = await Inventory.create({
      productId: product.id,
      quantity: initialQuantity || 0,
      minimumStock: 10 // Default minimum stock
    }, { transaction });

    await transaction.commit();

    // Fetch the complete product with inventory
    const createdProduct = await Product.findByPk(product.id, {
      include: [{
        model: Inventory,
        as: 'inventory'
      }]
    });

    res.status(201).json({
      success: true,
      data: createdProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update existing product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, brand, imageUrl } = req.body;
    const userId = req.user.id;

    // Find product and verify ownership
    const product = await Product.findOne({
      where: { 
        id: id,
        userId: userId,
        isActive: true 
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Update product
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price || product.price,
      category: category !== undefined ? category : product.category,
      brand: brand !== undefined ? brand : product.brand,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl
    });

    // Fetch updated product with inventory
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{
        model: Inventory,
        as: 'inventory'
      }]
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find product and verify ownership
    const product = await Product.findOne({
      where: { 
        id: id,
        userId: userId,
        isActive: true 
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check if product has sales (optional business rule)
    const { Sale } = require('../models');
    const salesCount = await Sale.count({
      where: { productId: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product with existing sales history',
        code: 'PRODUCT_HAS_SALES'
      });
    }

    // Soft delete (set isActive to false)
    await product.update({ isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;

    const products = await Product.findAll({
      where: { 
        userId: userId,
        category: { [Op.iLike]: category },
        isActive: true 
      },
      include: [{
        model: Inventory,
        as: 'inventory',
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products,
      message: 'Products by category fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories for current user
const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const categories = await Product.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('category')), 'count']
      ],
      where: { 
        userId: userId,
        category: { [Op.ne]: null },
        isActive: true 
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    res.json({
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getCategories
};