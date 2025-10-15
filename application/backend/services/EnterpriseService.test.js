const { describe, it } = require('node:test');
const EnterpriseService = require('./EnterpriseService');

describe('EnterpriseService', () => {

  describe('create', () => {
    it('should create a new enterprise', async () => {
      const newEnterprise = {
        name: 'New Enterprise',
        description: 'Description of New Enterprise',
      };
      const createdEnterprise = await EnterpriseService.create(newEnterprise);
      expect(createdEnterprise).to.have.property('id');
      expect(createdEnterprise.name).to.equal(newEnterprise.name);
      expect(createdEnterprise.description).to.equal(newEnterprise.description);
    });
  });

  describe('get', () => {
    it('should get an enterprise by ID', async () => {
      const enterpriseId = 'enterprise_id_to_fetch';
      const fetchedEnterprise = await EnterpriseService.get(enterpriseId);
      expect(fetchedEnterprise).to.exist;
      expect(fetchedEnterprise.id).to.equal(enterpriseId);
    });
  });

  describe('update', () => {
    it('should update an existing enterprise', async () => {
      const updatedEnterpriseData = {
        id: 'existing_enterprise_id',
        name: 'Updated Enterprise Name',
        description: 'Updated Description',
      };
      const updatedEnterprise = await EnterpriseService.update(updatedEnterpriseData);
      expect(updatedEnterprise).to.deep.equal(updatedEnterpriseData);

    });
  });

  describe('delete', () => {
    it('should delete an enterprise', async () => {
      const enterpriseIdToDelete = 'enterprise_id_to_delete';
      const deletionResult = await EnterpriseService.delete(enterpriseIdToDelete);
      expect(deletionResult).to.be.true;
    });
  });
});
