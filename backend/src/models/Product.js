const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
        isDecimal: true
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'image_url',
      validate: {
        isUrl: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'barcode'],
        name: 'unique_user_barcode'
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['barcode']
      },
      {
        fields: ['category']
      }
    ],
    validate: {
      barcodeUniquePerUser() {
        // This will be handled by the unique index
      }
    }
  });

  // Instance methods
  Product.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    // Convert price to number for JSON response
    if (values.price) {
      values.price = parseFloat(values.price);
    }
    return values;
  };

  // Class methods
  Product.findByBarcodeAndUser = async function(barcode, userId) {
    return await this.findOne({
      where: {
        barcode: barcode,
        userId: userId,
        isActive: true
      },
      include: [{
        model: sequelize.models.Inventory,
        as: 'inventory'
      }]
    });
  };

  Product.searchProducts = async function(query, userId, limit = 50) {
    const { Op } = require('sequelize');
    
    return await this.findAll({
      where: {
        userId: userId,
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { barcode: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } },
          { brand: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [{
        model: sequelize.models.Inventory,
        as: 'inventory'
      }],
      limit: limit,
      order: [['name', 'ASC']]
    });
  };

  // Associations
  Product.associate = function(models) {
    Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Product.hasOne(models.Inventory, {
      foreignKey: 'productId',
      as: 'inventory',
      onDelete: 'CASCADE'
    });

    Product.hasMany(models.Sale, {
      foreignKey: 'productId',
      as: 'sales',
      onDelete: 'RESTRICT'
    });

    Product.hasMany(models.StockAdjustment, {
      foreignKey: 'productId',
      as: 'stockAdjustments',
      onDelete: 'CASCADE'
    });
  };

  return Product;
};