'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Compositions', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID
      },
      code: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING
      },
      coeficient: {
        type: Sequelize.STRING
      },
      technicalNotebook: {
        type: Sequelize.STRING
      },
      createdAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt:{
        type: Sequelize.DATE,
      },
      deletedAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Compositions');
  }
};