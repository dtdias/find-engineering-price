const { db: { User, Role, Enterprise } } = require('model/models');
const { Op } = require('sequelize');
const hasRequiredItems = require('../helpers/hasRequiredItems');
const setIfExsits = require('../helpers/setIfExsits');

/**
 * Controller class for handling user-related operations.
 */
class UserController {
  /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
  static async create(req, res) {
    const { name, email, password, document, role } = req.body;
    if (!hasRequiredItems(res, [name, email, password, document, role])) return;
    const user = await User.create({ name, email, document, password, role });

    return res.status(201).json({
      message: 'User created successfully',
    });
  }

  /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
  static async update(req, res) {
    const userId = req.params.id;
    const { name, email, document } = req.body;

    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    const newData = setIfExsits(['name', 'email', 'document'], req.body)
    if (Object.keys(newData).length === 0) return res.status(400).json({ message: 'Missing required fields' });
    await User.update(newData, { where: { id: userId } });

    return res.status(200).json({ message: 'User updated successfully' });
  }

  /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
  static async delete(req, res) {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    await User.destroy({ where: { id: userId } });

    return res.status(200).json({ message: 'User deleted successfully' });
  }

  /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
  static async get(req, res) {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async getAllByEnterprise(req, res) {
    const enterpriseId = req.params.enterpriseId;
    if (!enterpriseId) return res.status(400).json({ message: 'Enterprise ID is required' });

    try {
      const roles = await Role.findAll({ where: { enterprise: enterpriseId } });
      const users = await User.findAll({
        where: {
          role: {
            [Op.in]: roles.map(role => role.id)
          }
        }
      });
      if (!users.length) {
        return res.status(404).json({ message: 'No users found' });
      }

      return res.status(200).json({
        users: users.map((user) => user.dataValues),
        roles: roles.map((role) => role.dataValues)
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

exports.default = UserController;