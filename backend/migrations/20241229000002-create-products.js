'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('products', ['user_id']);
    await queryInterface.addIndex('products', ['barcode']);
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['is_active']);
    
    // Add unique constraint for barcode per user
    await queryInterface.addIndex('products', ['user_id', 'barcode'], {
      unique: true,
      name: 'unique_user_barcode'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};