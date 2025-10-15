const { db } = require('model/models');
const { randomUUID } = require('crypto');
const hasRequiredItems = require('../helpers/hasRequiredItems');

const { Role } = db;

/**
 * Controller class for managing roles.
 */
class RoleController {
  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async create(req, res) {
    const { name, enterpriseId } = req.body;
    if (!hasRequiredItems(res, [name, enterpriseId])) return;
    const reference = { id: randomUUID() }
    const role = await Role.create({ name, enterpriseId });

    return res.status(201).json({
      message: 'Role created successfully',
    });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async update(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    if (!hasRequiredItems(res, [id, name])) return;
    await Role.update({ name }, { where: { id } });

    return res.status(200).json({ message: 'Role updated successfully' });
  }

  /** 
   * @param {import('express').Request} req - The request object.
  //  * @param {import('express').Response} res - The response object.
   */
  static async delete(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;
    await Role.destroy({ where: { id } });

    return res.status(200).json({ message: 'Role deleted successfully' });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async get(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;
    const role = await Role.findOne({ where: { id } });

    return res.status(200).json(role);
  }
}

exports.default = RoleController;