'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Supplies', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID
      },
      code: {
        type: Sequelize.INTEGER,
        unique: true
      },
      description: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING
      },
      hasPrice: {
        type: Sequelize.STRING
      },
      isRepresent: {
        type: Sequelize.STRING
      },
      classification: {
        type: Sequelize.STRING
      },
      createdAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Supplies');
  }
};