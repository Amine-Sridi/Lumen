const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const StockAdjustment = sequelize.define('StockAdjustment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    adjustmentType: {
      type: DataTypes.ENUM('addition', 'subtraction', 'sale', 'damage', 'expired', 'correction'),
      allowNull: false,
      field: 'adjustment_type'
    },
    quantityChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'quantity_change',
      validate: {
        isInt: true,
        notZero(value) {
          if (value === 0) {
            throw new Error('Quantity change cannot be zero');
          }
        }
      }
    },
    previousQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'previous_quantity',
      validate: {
        min: 0,
        isInt: true
      }
    },
    newQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'new_quantity',
      validate: {
        min: 0,
        isInt: true
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Reference to sale ID, batch number, etc.'
    }
  }, {
    tableName: 'stock_adjustments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Stock adjustments should not be updated
    indexes: [
      {
        fields: ['product_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['adjustment_type']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeValidate: (adjustment) => {
        // Ensure quantity calculations are correct
        const expectedNewQuantity = adjustment.previousQuantity + adjustment.quantityChange;
        if (adjustment.newQuantity !== expectedNewQuantity) {
          adjustment.newQuantity = expectedNewQuantity;
        }
      }
    }
  });

  // Instance methods
  StockAdjustment.prototype.isPositiveAdjustment = function() {
    return this.quantityChange > 0;
  };

  StockAdjustment.prototype.isNegativeAdjustment = function() {
    return this.quantityChange < 0;
  };

  StockAdjustment.prototype.getAdjustmentDescription = function() {
    const type = this.adjustmentType;
    const change = this.quantityChange;
    const absChange = Math.abs(change);
    
    switch (type) {
      case 'addition':
        return `Added ${absChange} units to inventory`;
      case 'subtraction':
        return `Removed ${absChange} units from inventory`;
      case 'sale':
        return `Sold ${absChange} units`;
      case 'damage':
        return `Damaged/lost ${absChange} units`;
      case 'expired':
        return `Expired ${absChange} units`;
      case 'correction':
        return `Inventory correction: ${change > 0 ? 'added' : 'removed'} ${absChange} units`;
      default:
        return `Stock adjustment: ${change > 0 ? '+' : ''}${change} units`;
    }
  };

  // Class methods
  StockAdjustment.createAdjustment = async function(data, transaction = null) {
    const { productId, userId, adjustmentType, quantityChange, reason, reference } = data;
    
    // Get current inventory
    const inventory = await sequelize.models.Inventory.findOne({
      where: { productId: productId },
      transaction: transaction
    });

    if (!inventory) {
      throw new Error('Inventory record not found for this product');
    }

    const previousQuantity = inventory.quantity;
    const newQuantity = previousQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(`Insufficient inventory. Current: ${previousQuantity}, Requested change: ${quantityChange}`);
    }

    // Create the adjustment record
    const adjustment = await this.create({
      productId,
      userId,
      adjustmentType,
      quantityChange,
      previousQuantity,
      newQuantity,
      reason,
      reference
    }, { transaction });

    // Update inventory
    await inventory.update({ quantity: newQuantity }, { transaction });

    return adjustment;
  };

  StockAdjustment.getAdjustmentHistory = async function(productId, userId, days = 30) {
    const { Op } = require('sequelize');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.findAll({
      where: {
        productId: productId,
        userId: userId,
        created_at: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['name', 'barcode']
      }],
      order: [['created_at', 'DESC']]
    });
  };

  StockAdjustment.getAdjustmentsSummary = async function(userId, startDate = null, endDate = null) {
    const { Op } = require('sequelize');
    
    const whereClause = { userId: userId };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    const summary = await this.findAll({
      attributes: [
        'adjustmentType',
        [sequelize.fn('COUNT', sequelize.col('StockAdjustment.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity_change')), 'totalChange']
      ],
      where: whereClause,
      group: ['adjustmentType'],
      raw: true
    });

    // Format the results
    const result = {
      totalAdjustments: 0,
      adjustmentsByType: {}
    };

    summary.forEach(item => {
      result.totalAdjustments += parseInt(item.count);
      result.adjustmentsByType[item.adjustmentType] = {
        count: parseInt(item.count),
        totalChange: parseInt(item.totalChange)
      };
    });

    return result;
  };

  // Associations
  StockAdjustment.associate = function(models) {
    StockAdjustment.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    StockAdjustment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return StockAdjustment;
};