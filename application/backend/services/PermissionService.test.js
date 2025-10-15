const { describe, it } = require('node:test');

const PermissionService = require('./PermissionService');

describe('PermissionService', () => {
  describe('create', () => {
    it('should create a new permission', async () => {
      const newPermission = {
        name: 'New Permission',
        description: 'Description of New Permission',
      };
      const createdPermission = await PermissionService.create(newPermission);
      expect(createdPermission).to.have.property('id');
      expect(createdPermission.name).to.equal(newPermission.name);
      expect(createdPermission.description).to.equal(newPermission.description);
    });
  });

  describe('update', () => {
    it('should update an existing permission', async () => {
      const updatedPermissionData = {
        id: 'existing_permission_id', 
        name: 'Updated Permission Name',
        description: 'Updated Description',
      };
      const updatedPermission = await PermissionService.update(updatedPermissionData);
      expect(updatedPermission).to.deep.equal(updatedPermissionData);
    });
  });

  describe('delete', () => {
    it('should delete a permission', async () => {
      const permissionIdToDelete = 'permission_id_to_delete'; 
      const deletionResult = await PermissionService.delete(permissionIdToDelete);
      expect(deletionResult).to.be.true; 
    });
  });

  describe('get', () => {
    it('should get a specific permission', async () => {
      const permissionId = 'permission_id_to_fetch'; 
      const fetchedPermission = await PermissionService.get(permissionId);
      expect(fetchedPermission).to.exist; 
      expect(fetchedPermission.id).to.equal(permissionId); 
    });
  });
});
