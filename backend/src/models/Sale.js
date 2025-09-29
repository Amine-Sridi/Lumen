const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        isInt: true
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
      validate: {
        min: 0.01,
        isDecimal: true
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      validate: {
        min: 0.01,
        isDecimal: true
      }
    },
    saleDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'sale_date'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'completed'
    },
    receiptNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'receipt_number'
    }
  }, {
    tableName: 'sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['sale_date']
      },
      {
        fields: ['status']
      },
      {
        unique: true,
        fields: ['receipt_number'],
        where: {
          receipt_number: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
    ],
    hooks: {
      beforeValidate: (sale) => {
        // Calculate total amount
        if (sale.quantity && sale.unitPrice) {
          sale.totalAmount = (parseFloat(sale.quantity) * parseFloat(sale.unitPrice)).toFixed(2);
        }
      }
    }
  });

  // Instance methods
  Sale.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    // Convert decimal values to numbers for JSON response
    if (values.unitPrice) {
      values.unitPrice = parseFloat(values.unitPrice);
    }
    if (values.totalAmount) {
      values.totalAmount = parseFloat(values.totalAmount);
    }
    return values;
  };

  Sale.prototype.generateReceiptNumber = function() {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${timestamp}-${random}`;
  };

  Sale.prototype.canBeCancelled = function() {
    const hoursSinceSale = (new Date() - new Date(this.saleDate)) / (1000 * 60 * 60);
    return this.status === 'completed' && hoursSinceSale <= 24; // Allow cancellation within 24 hours
  };

  // Class methods
  Sale.getSalesSummary = async function(userId, startDate = null, endDate = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      userId: userId,
      status: 'completed'
    };

    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.saleDate = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.saleDate = {
        [Op.lte]: endDate
      };
    }

    const summary = await this.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalItemsSold']
      ],
      where: whereClause,
      raw: true
    });

    return summary[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalItemsSold: 0
    };
  };

  Sale.getTopProducts = async function(userId, limit = 10, startDate = null, endDate = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      userId: userId,
      status: 'completed'
    };

    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await this.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'transactionCount']
      ],
      where: whereClause,
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['name', 'category', 'brand', 'imageUrl']
      }],
      group: ['Sale.product_id', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: limit
    });
  };

  Sale.getSalesByDateRange = async function(userId, startDate, endDate) {
    const { Op } = require('sequelize');
    
    return await this.findAll({
      where: {
        userId: userId,
        status: 'completed',
        saleDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['name', 'category', 'brand']
      }],
      order: [['saleDate', 'DESC']]
    });
  };

  Sale.getDailySalesBreakdown = async function(userId, startDate = null, endDate = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      userId: userId,
      status: 'completed'
    };

    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await this.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('sale_date')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'sales'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'itemsSold']
      ],
      where: whereClause,
      group: [sequelize.fn('DATE', sequelize.col('sale_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('sale_date')), 'ASC']],
      raw: true
    });
  };

  // Associations
  Sale.associate = function(models) {
    Sale.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Sale.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return Sale;
};