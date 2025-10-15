const { Router } = require('express');
const { db: { Enterprise } } = require('model/models');

const route = Router();

route.get('/enterprise', async (req, res) => {
    const enterprises = (await Enterprise.findAll()).map(u => u.dataValues);
    res.render('enterprise/index', { enterprises });
});

route.get('/enterprise/:id/edit', async (req, res) => {
    const enterprise = (await Enterprise.findByPk(req.params.id)).dataValues;
    res.render('enterprise/edit', { enterprise });
}).put('/enterprise/:id/edit', async (req, res) => {
    const { name, email, document } = req.body;
    const data = {}
    if (name) data.name = name;
    if (email) data.email = email;
    if (document) data.document = document;
    try {
        await Enterprise.update(data, { where: { id: req.params.id } });
        res.status(200).json({ message: 'Empresa atualizado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao atualizar a empresa' });
    }
})

route.get('/enterprise/:id/delete', async (req, res) => {
    try {
        await Enterprise.destroy({ where: { id: req.params.id } });

        res.json({ message: "Deleção realizada com sucesso" });
    } catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(500).json({ message: "Não foi possível deletar a empresa pois há dados dependendentes" })
        }
        res.status(500).json({ message: 'Erro ao deletar a empresa' });
    }
})

route.get('/enterprise/create', async (req, res) => {
    const id = require('crypto').randomUUID();
    res.render('enterprise/create', { id });
}).post('/enterprise/create', async (req, res) => {
    const { id, name, document } = req.body;
    try {
        await Enterprise.create({
            id,
            name,
            document,
        });

        res.status(200).json({ message: 'Empresa criado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao criar Empresa' });
    }
})

module.exports = route;