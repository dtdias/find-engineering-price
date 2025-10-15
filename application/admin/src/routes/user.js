const { Router } = require('express');
const { db: { User } } = require('model/models');
const PASSWORD_SALTS = process.env.PASSWORD_SALTS || 8;

const route = Router();

route.get('/user', async (req, res) => {
    const users = (await User.findAll()).map(u => u.dataValues);
    res.render('user/index', { users });
});


route.get('/users/:id/edit', async (req, res) => {
    const user = (await User.findByPk(req.params.id)).dataValues;
    res.render('user/edit', { user });
}).put('/users/:id/edit', async (req, res) => {
    const { name, email, document, password } = req.body;
    const data = {}
    if (name) data.name = name;
    if (email) data.email = email;
    if (document) data.document = document;
    if (password) data.password = require('bcryptjs').hashSync(password, PASSWORD_SALTS);
    try {
        await User.update(data, { where: { id: req.params.id } });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao atualizar usuário' });
    }
})

route.get('/users/:id/delete', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.redirect('/');
    } catch (err) {
        res.status(404).json({ message: 'Erro ao deletar usuário' });
    }
})

route.get('/users/create', async (req, res) => {
    const id = require('crypto').randomUUID();
    res.render('user/create', { id });
}).post('/users/create', async (req, res) => {
    const { id, name, email, document, password } = req.body;
    try {
        await User.create({
            id,
            name,
            email,
            document,
            password: require('bcryptjs').hashSync(password, PASSWORD_SALTS)
        });

        res.status(200).json({ message: 'Usuário criado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao criar usuário' });
    }
})

module.exports = route;