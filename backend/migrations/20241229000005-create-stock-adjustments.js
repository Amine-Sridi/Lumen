'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_adjustments', {
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
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      adjustment_type: {
        type: Sequelize.ENUM('add', 'remove', 'set'),
        allowNull: false
      },
      quantity_changed: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      adjustment_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addIndex('stock_adjustments', ['user_id']);
    await queryInterface.addIndex('stock_adjustments', ['product_id']);
    await queryInterface.addIndex('stock_adjustments', ['adjustment_type']);
    await queryInterface.addIndex('stock_adjustments', ['adjustment_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_adjustments');
  }
};