'use strict';
const { Model } = require('sequelize');

exports.default =  (sequelize, DataTypes) => {
  class Supply extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Supply.init({
    code: DataTypes.INTEGER,
    description: DataTypes.STRING,
    unit: DataTypes.STRING,
    hasPrice: DataTypes.STRING,
    isRepresent: DataTypes.STRING,
    classification: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Supply',
  });
  return Supply;
};