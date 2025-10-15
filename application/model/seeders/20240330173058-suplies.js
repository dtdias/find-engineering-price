'use strict';
const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const supplies = require('../_seed/supplies.json');
    const step = supplies.length / 1000;
    for (let i = 0; i < supplies.length; i += step) {
      const chunk = supplies.slice(i, i + step - 1).map((supply) => ({ id: randomUUID(), ...supply }));
      await queryInterface.bulkInsert('Supplies', chunk, {
        logging: console.log,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    queryInterface.bulkDelete('Supplies', null, {})
  }
};
