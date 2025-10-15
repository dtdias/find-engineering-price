const { db } = require('model/models');
const hasRequiredItems = require('../helpers/hasRequiredItems');
const setIfExsits = require('../helpers/setIfExsits');

const Permission = db.Permission;
const RolePermission = db.RolePermission;

/**
 * Controller for managing permissions.
 */
class PermissionController {
  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async create(req, res) {
    const { name, action, roleId } = req.body;
    if (!hasRequiredItems(res, [name, action, roleId])) return;
    const permission = await Permission.create({ name, action });
    await RolePermission.create({ roleId, permissionId: permission.id })

    return res.status(201).json({
      message: 'Permission created successfully',
    });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async update(req, res) {
    const { id } = req.params;
    const { name, action, roleId } = req.body;
    if (!hasRequiredItems(res, [id, name, action, roleId])) return;

    const permissionData = setIfExsits(['name', 'action'], req.body);
    if (Object.values(permissionData).length) {
      await Permission.update(permissionData, { where: { id } });
    }

    if (roleId) {
      await RolePermission.update({ roleId }, { where: { permissionId: id } });
    }

    return res.status(200).json({ message: 'Permission updated successfully' });
  }

  /** 
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async delete(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;
    await Permission.destroy({ where: { id } });
    await RolePermission.destroy({ where: { permissionId: id } });

    return res.status(200).json({ message: 'Permission deleted successfully' });
  }
  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async get(req, res) {
    const { id } = req.params;
    if (!hasRequiredItems(res, [id])) return;
    const permission = await Permission.findOne({ where: { id } });

    return res.status(200).json({ permission });
  }
}

exports.default = PermissionController;