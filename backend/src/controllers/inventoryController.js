const { Inventory, Product, StockAdjustment } = require('../models');
const db = require('../models');

// Get paginated inventory for current user
const getInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const { rows: inventoryItems, count: totalItems } = await Inventory.findAndCountAll({
      include: [{
        model: Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['quantity', 'ASC']], // Show low stock items first
      distinct: true
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        items: inventoryItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalItems,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: 'Inventory fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory item by product ID
const getInventoryByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const inventoryItem = await Inventory.findOne({
      where: { productId: productId },
      include: [{
        model: Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true
      }]
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'INVENTORY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: inventoryItem,
      message: 'Inventory item fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update inventory item
const updateInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, minimumStock, maximumStock } = req.body;
    const userId = req.user.id;

    // Find inventory item and verify product ownership
    const inventoryItem = await Inventory.findOne({
      where: { productId: productId },
      include: [{
        model: Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true
      }]
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'INVENTORY_NOT_FOUND'
      });
    }

    // Update inventory
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (minimumStock !== undefined) updateData.minimumStock = minimumStock;
    if (maximumStock !== undefined) updateData.maximumStock = maximumStock;

    await inventoryItem.update(updateData);

    // Reload to get updated data
    await inventoryItem.reload({
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    res.json({
      success: true,
      data: inventoryItem,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Adjust stock quantity with audit trail
const adjustStock = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { productId, quantity: quantityChange, type, reason } = req.body;
    const userId = req.user.id;

    // Verify product ownership
    const product = await Product.findOne({
      where: { 
        id: productId,
        userId: userId,
        isActive: true 
      },
      transaction
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Create stock adjustment (this will also update inventory)
    const adjustment = await StockAdjustment.createAdjustment({
      productId,
      userId,
      adjustmentType: type,
      quantityChange,
      reason
    }, transaction);

    await transaction.commit();

    // Fetch updated inventory
    const updatedInventory = await Inventory.findOne({
      where: { productId: productId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    res.json({
      success: true,
      data: {
        inventory: updatedInventory,
        adjustment: adjustment
      },
      message: 'Stock adjusted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get items with low stock
const getLowStockItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const lowStockItems = await Inventory.getLowStockItems(userId);

    res.json({
      success: true,
      data: lowStockItems,
      message: 'Low stock items fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get items that are out of stock
const getOutOfStockItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const outOfStockItems = await Inventory.getOutOfStockItems(userId);

    res.json({
      success: true,
      data: outOfStockItems,
      message: 'Out of stock items fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update inventory
const bulkUpdateInventory = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { updates } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(updates) || updates.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Updates array is required and cannot be empty',
        code: 'INVALID_UPDATES'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, quantity } = update;

        // Verify product ownership
        const product = await Product.findOne({
          where: { 
            id: productId,
            userId: userId,
            isActive: true 
          },
          transaction
        });

        if (!product) {
          errors.push(`Product ${productId} not found`);
          continue;
        }

        // Update inventory
        const inventoryItem = await Inventory.findOne({
          where: { productId: productId },
          transaction
        });

        if (inventoryItem) {
          await inventoryItem.update({ quantity }, { transaction });
          results.push({
            productId,
            previousQuantity: inventoryItem.quantity,
            newQuantity: quantity,
            success: true
          });
        } else {
          errors.push(`Inventory for product ${productId} not found`);
        }
      } catch (error) {
        errors.push(`Error updating product ${update.productId}: ${error.message}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Bulk update failed',
        details: errors
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: updates.length,
        successCount: results.length,
        failureCount: errors.length
      },
      message: 'Bulk inventory update completed'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Inventory.getInventoryStats(userId);

    // Calculate additional statistics
    const lowStockItems = await Inventory.getLowStockItems(userId);
    const outOfStockItems = await Inventory.getOutOfStockItems(userId);

    // Calculate total inventory value
    const inventoryValue = await Inventory.findAll({
      attributes: [
        [db.sequelize.fn('SUM', 
          db.sequelize.literal('inventory.quantity * CAST(product.price AS DECIMAL)')
        ), 'totalValue']
      ],
      include: [{
        model: Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        attributes: []
      }],
      raw: true
    });

    const totalValue = inventoryValue[0]?.totalValue || 0;

    res.json({
      success: true,
      data: {
        ...stats,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        totalInventoryValue: parseFloat(totalValue),
        lowStockPercentage: stats.totalProducts > 0 
          ? ((lowStockItems.length / stats.totalProducts) * 100).toFixed(2)
          : 0
      },
      message: 'Inventory statistics fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory history for a product
const getInventoryHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;
    const userId = req.user.id;

    // Verify product ownership
    const product = await Product.findOne({
      where: { 
        id: productId,
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

    const history = await StockAdjustment.getAdjustmentHistory(productId, userId, parseInt(days));

    res.json({
      success: true,
      data: history,
      message: 'Inventory history fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryByProductId,
  updateInventory,
  adjustStock,
  getLowStockItems,
  getOutOfStockItems,
  bulkUpdateInventory,
  getInventoryStats,
  getInventoryHistory
};