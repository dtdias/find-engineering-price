const { db } = require('model/models');
const { randomUUID } = require('crypto');
const hasRequiredItems = require('../helpers/hasRequiredItems');


const { Enterprise, Role, User } = db;

/**
 * Controller class for managing enterprises.
 */
class EnterpriseController {
  /** 
  * @param {import('express').Request} req - The request object.
  * @param {import('express').Response} res - The response object.
  */
  static async create(req, res) {
    const { name, document } = req.body;
    if (!name || !document) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const enterprise = await Enterprise.create({
      id: randomUUID(),
      name,
      document,
      planId: 0,
    });

    const role = await Role.create({
      id: randomUUID(),
      name: 'Manager',
      enterprise: enterprise.dataValues.id,
    });

    await User.update({ role: role.dataValues.id }, { where: { id: req.userId } }, { returning: true });

    res.status(201).json({
      message: 'Enterprise created successfully',
    });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async update(req, res) {
    const { id } = req.params;
    const { name, document, planId } = req.body;
    if (!hasRequiredItems(res, [id])) return;

    const newData = {};
    if (name) newData.name = name;
    if (document) newData.document = document;
    if (planId) newData.planId = planId;

    await Enterprise.update(newData, { where: { id } });

    res.status(200).json({ message: 'Enterprise updated successfully' });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async delete(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;

    await Enterprise.destroy({ where: { id } });

    res.status(200).json({ message: 'Enterprise deleted successfully' });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async get(req, res) {
    const { id } = req.params;
    const { name, document, planId } = req.query;

    const data = {};
    if (id) data.id = id;
    if (name) data.name = name;
    if (document) data.document = document;
    if (planId) data.planId = planId;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const enterprise = await Enterprise.findOne({ where: data });
      res.status(200).json({ enterprise });
    } catch (error) {
      console.debug(error);
    }
  }

  static async getByUser(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;
    let user = null
    try {
      user = await User.findOne({ where: { id } });
      if (!user) return res.status(404).json({ message: 'User not found' });
    } catch (error) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.dataValues.role) {
      return res.status(409).json({ message: 'User has no role' });
    }

    const role = await Role.findOne({ where: { id: user.dataValues.role } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const enterprise = await Enterprise.findOne({ where: { id: role.dataValues.enterprise } });
    if (!enterprise) {
      return res.status(404).json({ message: 'Enterprise not found' });
    }

    res.status(200).json({ enterprise });
  }
}

exports.default = EnterpriseController;