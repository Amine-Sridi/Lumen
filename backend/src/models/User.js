const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 255]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
      validate: {
        len: [1, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: {
        len: [1, 100]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'business_name',
      validate: {
        len: [0, 255]
      }
    },
    businessType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'business_type',
      validate: {
        len: [0, 100]
      }
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'business_address'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.refreshToken;
    return values;
  };

  // Associations
  User.associate = function(models) {
    User.hasMany(models.Product, {
      foreignKey: 'userId',
      as: 'products',
      onDelete: 'CASCADE'
    });
    
    User.hasMany(models.Sale, {
      foreignKey: 'userId',
      as: 'sales',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.StockAdjustment, {
      foreignKey: 'userId',
      as: 'stockAdjustments',
      onDelete: 'CASCADE'
    });
  };

  return User;
};