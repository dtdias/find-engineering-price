'use strict';
const { Model } = require('sequelize');

exports.default =  (sequelize, DataTypes) => {
  class Enterprise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Enterprise.init({
    name: DataTypes.STRING,
    document: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Enterprise',
  });
  return Enterprise;
};