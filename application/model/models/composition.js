'use strict';
const { Model } = require('sequelize');

exports.default =  (sequelize, DataTypes) => {
  class Composition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Composition.init({
    code: DataTypes.INTEGER,
    description: DataTypes.STRING,
    unit: DataTypes.STRING,
    coeficient: DataTypes.STRING,
    technicalNotebook: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Composition',
  });
  return Composition;
};