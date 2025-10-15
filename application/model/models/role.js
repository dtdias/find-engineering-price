'use strict';
const { Model } = require('sequelize');

exports.default =  (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Role.hasOne(models.Enterprise, { foreignKey: 'id',  });
    }
  }
  Role.init({
    name: DataTypes.STRING,
    enterprise: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};