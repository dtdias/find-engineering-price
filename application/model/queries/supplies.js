const { Op, where } = require("sequelize");
const { db } = require('../models/index.js');
const { Supply } = require('../../model/mongo/index.js')

// code: code ? RegExp(code, 'ig') : { $in: [Array.isArray(codes) ? codes?.flatMap(codes => codes?.split(',')) : Array.from(codes)] },
exports.getSupplies = async function getSupplies({
  search, code, codes, description, sortBy, sortOrder, page = 1, limit = 40
}) {
  const where = {};
  let codeSearch;
  if (code || codes) {
    codeSearch = !code ? { $in: (Array.isArray(codes) ? codes?.flatMap(codes => codes?.split(',')) : Array.from(codes)).map(c => RegExp(c, 'ig')) } : RegExp(code, 'ig')
  }
  if ((Array.isArray(codeSearch) && !codeSearch.length) || codeSearch) where.code = codeSearch;
  if (search || description) where.description = RegExp(search || description, 'ig');
  const supplies = await Supply.find(
    where,
    {},
    { limit, skip: (!page || page <= 0 ? 0 : page - 1) * limit }
  )

  return supplies;
}