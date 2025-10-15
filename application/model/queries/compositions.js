const { Op, Sequelize } = require('sequelize');
const { db } = require('../models/index.js');
const { Composition } = require('../../model/mongo/index.js')

exports.getComposition = async function getComposition({
  search, code, codes, description, sortBy, sortOrder, page = 1, limit = 40, withChildrens
}) {
  const where = {};
  let codeSearch;
  if (code || codes) {
    codeSearch = !code ? { $in: (Array.isArray(codes) ? codes?.flatMap(codes => codes?.split(',')) : Array.from(codes)).map(c => RegExp(c, 'ig')) } : RegExp(code, 'ig')
  }
  if ((Array.isArray(codeSearch) && !codeSearch.length) || codeSearch) where.code = codeSearch;
  if (search || description) where.description = RegExp(search || description, 'ig');
  const prequery = Composition.find(
    where,
    {},
    { limit, skip: (!page || page <= 0 ? 0 : page - 1) * limit }
  )
  if (String(withChildrens).match('(true|1)')) {
    const compositions = prequery.populate('children')
    return compositions
  }
  const compostions = await prequery
  return compostions;
}

exports.getUniqueValues = async function getUniqueValues(columnName) {
  try {
    const uniqueValues = await db.Composition.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(columnName)), columnName]],
    });
    return uniqueValues.map(value => value[columnName]);
  } catch (error) {
    console.error('Error fetching unique values:', error);
    throw error;
  }
}