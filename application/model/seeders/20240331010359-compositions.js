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
    const compositions = require('../_seed/compositions.json');
    const step = compositions.length / 1000;
    for (let i = 0; i < compositions.length; i += step) {
      const chunk = compositions.slice(i, i + step - 1).map((supply) => ({ id: randomUUID(), ...supply }));
      await queryInterface.bulkInsert('Compositions', chunk, {
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
    queryInterface.bulkDelete('Compositions', null, {})
  }
};
