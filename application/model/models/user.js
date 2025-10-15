'use strict';
const { Model } = require('sequelize');

exports.default =  (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.hasOne(models.Role, { foreignKey: 'id' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    document: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};