const { describe, it } = require('node:test');
const RoleService = require('./RoleService');

describe('RoleService', () => {
  describe('create', () => {
    it('should create a new role', async () => {
      const newRole = {
        name: 'New Role',
        description: 'Description of New Role',
      };
      const createdRole = await RoleService.create(newRole);
      expect(createdRole).to.have.property('id');
      expect(createdRole.name).to.equal(newRole.name);
      expect(createdRole.description).to.equal(newRole.description);
    });
  });

  describe('update', () => {
    it('should update an existing role', async () => {
      const updatedRoleData = {
        id: 'existing_role_id', 
        name: 'Updated Role Name',
        description: 'Updated Description',
      };
      const updatedRole = await RoleService.update(updatedRoleData);
      expect(updatedRole).to.deep.equal(updatedRoleData);
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      const roleIdToDelete = 'role_id_to_delete'; 
      const deletionResult = await RoleService.delete(roleIdToDelete);
      expect(deletionResult).to.be.true; 
    });
  });

  describe('get', () => {
    it('should get a role by ID', async () => {
      const roleId = 'role_id_to_fetch'; 
      const fetchedRole = await RoleService.get(roleId);
      expect(fetchedRole).to.exist; 
      expect(fetchedRole.id).to.equal(roleId); 
    });
  });
});