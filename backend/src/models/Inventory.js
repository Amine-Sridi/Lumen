const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    minimumStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'minimum_stock',
      validate: {
        min: 0,
        isInt: true
      }
    },
    maximumStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'maximum_stock',
      validate: {
        min: 0,
        isInt: true,
        isGreaterThanMinimum(value) {
          if (value !== null && value < this.minimumStock) {
            throw new Error('Maximum stock must be greater than or equal to minimum stock');
          }
        }
      }
    },
    lastRestocked: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_restocked'
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['product_id']
      },
      {
        fields: ['quantity']
      }
    ]
  });

  // Instance methods
  Inventory.prototype.isLowStock = function() {
    return this.quantity <= this.minimumStock;
  };

  Inventory.prototype.isOutOfStock = function() {
    return this.quantity === 0;
  };

  Inventory.prototype.canFulfillOrder = function(requestedQuantity) {
    return this.quantity >= requestedQuantity;
  };

  Inventory.prototype.adjustQuantity = async function(adjustment, transaction = null) {
    const newQuantity = this.quantity + adjustment;
    
    if (newQuantity < 0) {
      throw new Error('Insufficient inventory. Cannot reduce below zero.');
    }

    const previousQuantity = this.quantity;
    this.quantity = newQuantity;
    
    await this.save({ transaction });

    return {
      previousQuantity,
      newQuantity,
      adjustment
    };
  };

  // Class methods
  Inventory.getLowStockItems = async function(userId) {
    return await this.findAll({
      where: sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('minimum_stock')
      ),
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true
      }],
      order: [
        [sequelize.fn('CAST', sequelize.col('quantity'), 'FLOAT'), '/', sequelize.fn('CAST', sequelize.col('minimum_stock'), 'FLOAT'), 'ASC']
      ]
    });
  };

  Inventory.getOutOfStockItems = async function(userId) {
    return await this.findAll({
      where: { quantity: 0 },
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true
      }],
      order: [['updated_at', 'DESC']]
    });
  };

  Inventory.getInventoryStats = async function(userId) {
    const { Op } = require('sequelize');
    
    const stats = await this.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Inventory.id')), 'totalProducts'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', 
          sequelize.where(
            sequelize.col('quantity'),
            Op.lte,
            sequelize.col('minimum_stock')
          )
        ), 'lowStockCount'],
        [sequelize.fn('SUM', 
          sequelize.where(
            sequelize.col('quantity'),
            Op.eq,
            0
          )
        ), 'outOfStockCount']
      ],
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        where: { userId: userId, isActive: true },
        required: true,
        attributes: []
      }],
      raw: true
    });

    return stats[0] || {
      totalProducts: 0,
      totalQuantity: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };
  };

  // Associations
  Inventory.associate = function(models) {
    Inventory.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return Inventory;
};