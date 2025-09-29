const { Sale, Product, Inventory, StockAdjustment } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

// Get paginated sales for current user
const getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const { rows: sales, count: totalSales } = await Sale.findAndCountAll({
      where: { 
        userId: userId,
        status: 'completed' 
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand', 'barcode']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['saleDate', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(totalSales / limit);

    res.json({
      success: true,
      data: {
        items: sales,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalSales,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: 'Sales fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get single sale by ID
const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sale = await Sale.findOne({
      where: { 
        id: id,
        userId: userId 
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand', 'barcode', 'imageUrl']
      }]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        code: 'SALE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: sale,
      message: 'Sale fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create new sale with inventory deduction
const createSale = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { productId, quantity, unitPrice, notes } = req.body;
    const userId = req.user.id;

    // Verify product ownership and get current details
    const product = await Product.findOne({
      where: { 
        id: productId,
        userId: userId,
        isActive: true 
      },
      include: [{
        model: Inventory,
        as: 'inventory',
        required: true
      }],
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

    // Check inventory availability
    const inventory = product.inventory;
    if (!inventory.canFulfillOrder(quantity)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Insufficient inventory. Available: ${inventory.quantity}, Requested: ${quantity}`,
        code: 'INSUFFICIENT_INVENTORY'
      });
    }

    // Use provided unit price or product price
    const saleUnitPrice = unitPrice || product.price;
    const totalAmount = (saleUnitPrice * quantity).toFixed(2);

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create sale record
    const sale = await Sale.create({
      userId,
      productId,
      quantity,
      unitPrice: saleUnitPrice,
      totalAmount,
      saleDate: new Date(),
      notes,
      receiptNumber
    }, { transaction });

    // Create stock adjustment for the sale
    await StockAdjustment.createAdjustment({
      productId,
      userId,
      adjustmentType: 'sale',
      quantityChange: -quantity, // Negative for sale
      reason: `Sale: ${receiptNumber}`,
      reference: sale.id
    }, transaction);

    await transaction.commit();

    // Fetch complete sale data
    const completeSale = await Sale.findByPk(sale.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand', 'barcode']
      }]
    });

    res.status(201).json({
      success: true,
      data: completeSale,
      message: 'Sale recorded successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get sales summary with analytics
const getSalesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // Parse dates
    let start = null;
    let end = null;

    if (startDate) {
      start = new Date(startDate);
    }
    
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
    }

    // Get basic summary
    const summary = await Sale.getSalesSummary(userId, start, end);

    // Get top products
    const topProducts = await Sale.getTopProducts(userId, 5, start, end);

    // Get daily breakdown
    const dailyBreakdown = await Sale.getDailySalesBreakdown(userId, start, end);

    res.json({
      success: true,
      data: {
        totalSales: parseInt(summary.totalSales) || 0,
        totalRevenue: parseFloat(summary.totalRevenue) || 0,
        totalItemsSold: parseInt(summary.totalItemsSold) || 0,
        averageSaleValue: summary.totalSales > 0 
          ? (parseFloat(summary.totalRevenue) / parseInt(summary.totalSales)).toFixed(2)
          : 0,
        topProducts: topProducts.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: parseInt(item.dataValues.totalQuantity),
          revenue: parseFloat(item.dataValues.totalRevenue),
          transactionCount: parseInt(item.dataValues.transactionCount)
        })),
        salesByDate: dailyBreakdown.map(item => ({
          date: item.date,
          sales: parseInt(item.sales),
          revenue: parseFloat(item.revenue),
          itemsSold: parseInt(item.itemsSold)
        }))
      },
      message: 'Sales summary fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get sales within date range
const getSalesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Both startDate and endDate are required',
        code: 'MISSING_DATE_RANGE'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.getSalesByDateRange(userId, start, end);

    res.json({
      success: true,
      data: sales,
      message: 'Sales by date range fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get sales by product ID
const getSalesByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
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

    const sales = await Sale.findAll({
      where: { 
        productId: productId,
        userId: userId,
        status: 'completed' 
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand']
      }],
      order: [['saleDate', 'DESC']]
    });

    res.json({
      success: true,
      data: sales,
      message: 'Sales by product fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get daily sales report
const getDailySalesReport = async (req, res, next) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const reportDate = new Date(date);
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get sales for the specific date
    const sales = await Sale.findAll({
      where: {
        userId: userId,
        status: 'completed',
        saleDate: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand']
      }],
      order: [['saleDate', 'DESC']]
    });

    // Calculate summary
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Hourly breakdown
    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
      const hourSales = sales.filter(sale => {
        const saleHour = new Date(sale.saleDate).getHours();
        return saleHour === hour;
      });

      return {
        hour: hour.toString().padStart(2, '0') + ':00',
        sales: hourSales.length,
        revenue: hourSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0),
        itemsSold: hourSales.reduce((sum, sale) => sum + sale.quantity, 0)
      };
    });

    res.json({
      success: true,
      data: {
        date: date,
        summary: {
          totalSales,
          totalRevenue,
          totalItemsSold,
          averageSaleValue: totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0
        },
        hourlyBreakdown: hourlyBreakdown.filter(hour => hour.sales > 0),
        sales: sales
      },
      message: 'Daily sales report fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly sales report
const getMonthlySalesReport = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    // Get monthly summary
    const summary = await Sale.getSalesSummary(userId, startDate, endDate);

    // Get daily breakdown for the month
    const dailyBreakdown = await Sale.getDailySalesBreakdown(userId, startDate, endDate);

    // Get top products for the month
    const topProducts = await Sale.getTopProducts(userId, 10, startDate, endDate);

    // Calculate previous month for comparison
    const prevMonthStart = new Date(startDate);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(prevMonthStart);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() + 1, 0, 23, 59, 59, 999);

    const prevMonthSummary = await Sale.getSalesSummary(userId, prevMonthStart, prevMonthEnd);

    res.json({
      success: true,
      data: {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        summary: {
          totalSales: parseInt(summary.totalSales) || 0,
          totalRevenue: parseFloat(summary.totalRevenue) || 0,
          totalItemsSold: parseInt(summary.totalItemsSold) || 0,
          averageSaleValue: summary.totalSales > 0 
            ? (parseFloat(summary.totalRevenue) / parseInt(summary.totalSales)).toFixed(2)
            : 0
        },
        comparison: {
          previousMonth: {
            totalSales: parseInt(prevMonthSummary.totalSales) || 0,
            totalRevenue: parseFloat(prevMonthSummary.totalRevenue) || 0
          },
          growth: {
            salesGrowth: prevMonthSummary.totalSales > 0 
              ? (((summary.totalSales - prevMonthSummary.totalSales) / prevMonthSummary.totalSales) * 100).toFixed(2)
              : 0,
            revenueGrowth: prevMonthSummary.totalRevenue > 0 
              ? (((summary.totalRevenue - prevMonthSummary.totalRevenue) / prevMonthSummary.totalRevenue) * 100).toFixed(2)
              : 0
          }
        },
        dailyBreakdown: dailyBreakdown,
        topProducts: topProducts.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: parseInt(item.dataValues.totalQuantity),
          revenue: parseFloat(item.dataValues.totalRevenue),
          transactionCount: parseInt(item.dataValues.transactionCount)
        }))
      },
      message: 'Monthly sales report fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get top selling products
const getTopSellingProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const userId = req.user.id;

    let start = null;
    let end = null;

    if (startDate) {
      start = new Date(startDate);
    }
    
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const topProducts = await Sale.getTopProducts(userId, parseInt(limit), start, end);

    res.json({
      success: true,
      data: topProducts.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        category: item.product.category,
        brand: item.product.brand,
        quantity: parseInt(item.dataValues.totalQuantity),
        revenue: parseFloat(item.dataValues.totalRevenue),
        transactionCount: parseInt(item.dataValues.transactionCount)
      })),
      message: 'Top selling products fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a sale (if within allowed timeframe)
const cancelSale = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { saleId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Find sale and verify ownership
    const sale = await Sale.findOne({
      where: { 
        id: saleId,
        userId: userId 
      },
      transaction
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        code: 'SALE_NOT_FOUND'
      });
    }

    // Check if sale can be cancelled
    if (!sale.canBeCancelled()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Sale cannot be cancelled. Only sales within 24 hours can be cancelled.',
        code: 'CANCELLATION_NOT_ALLOWED'
      });
    }

    // Update sale status
    await sale.update({ status: 'cancelled' }, { transaction });

    // Restore inventory
    await StockAdjustment.createAdjustment({
      productId: sale.productId,
      userId: userId,
      adjustmentType: 'correction',
      quantityChange: sale.quantity, // Positive to restore inventory
      reason: `Sale cancellation: ${reason || 'No reason provided'}`,
      reference: sale.id
    }, transaction);

    await transaction.commit();

    // Reload sale with product data
    await sale.reload({
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'category', 'brand']
      }]
    });

    res.json({
      success: true,
      data: sale,
      message: 'Sale cancelled successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  getSalesSummary,
  getSalesByDateRange,
  getSalesByProduct,
  getDailySalesReport,
  getMonthlySalesReport,
  getTopSellingProducts,
  cancelSale
};