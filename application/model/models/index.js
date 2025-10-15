const fs = require('fs');
const path = require('path');
const { Model, Sequelize } = require('sequelize');
const dbConfig = require('../config/config.json');

'use strict';
const { basename } = path;
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env.toLowerCase()];
/** 
 * @typedef DatabaseConfig
 * @type {Object}
 * @property {Sequelize} sequelize
 * @property {Sequelize} Sequelize
 * @property {Model} User
 * @property {Model} Role
 * @property {Model} Permission
 * @property {Model} Enterprise
 * @property {Model} Plan
 * @property {Model} Composition
 * @property {Model} Supply
 * @property {Model} RolePermission
 */

/** @type {DatabaseConfig}  */
const db = {};
console.log(config)
const url = `${config.dialect}://${config.username}:${config.password}@${config.host}:5432/${config.database}`;
let sequelize = new Sequelize(config);

const asAValidFile = (file) => (
  file.indexOf('.') !== 0 &&
  file !== basename &&
  file.slice(-3) === '.js' &&
  file.indexOf('.test.js') === -1,
  file !== ('index.js')
);

fs
  .readdirSync(__dirname)
  .filter(asAValidFile)
  .forEach(filename => {
    const { default: model } = require(path.join(__dirname, filename));
    let cleanName = filename.replace('.js', '').replace('rolepermission', 'rolePermission')
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    db[cleanName] = model(sequelize, Sequelize.DataTypes);
    db[cleanName].associate(db);
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {
  db
};