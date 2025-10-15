const { Router } = require('express');
const { Supply, mongoose } = require('model/mongo');

const route = Router();

route.get('/supply', async (req, res) => {
    const supplies = (await Supply.find());
    res.render('supply/index', { supplies });
});

route.get('/supply/:id/edit', async (req, res) => {
    const supply = (await Supply.findById(req.params.id));
    res.render('supply/edit', { supply });
}).put('/supply/:id/edit', async (req, res) => {
    const { code,
        database,
        description,
        unit,
        category,
        priceContition } = req.body;
    const data = {}
    if (code) data.code = code;
    if (database) data.database = database;
    if (description) data.description = description;
    if (unit) data.unit = unit;
    if (category) data.category = category;
    if (priceContition) data.priceContition = priceContition;

    try {
        await Supply.findByIdAndUpdate(req.params.id, data);
        res.status(200).json({ message: 'Insumo atualizado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao atualizar a insumo' });
    }
})

route.get('/supply/:id/delete', async (req, res) => {
    try {
        await Supply.findByIdAndDelete(req.params.id);

        res.json({ message: "Deleção realizada com sucesso" });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao deletar o insumo' });
    }
})

route.get('/supply/create', async (req, res) => {
    const id = (await mongoose).mongo.ObjectId.createPk();
    res.render('supply/create', { id });
}).post('/supply/create', async (req, res) => {
    const { _id,
        code,
        database,
        description,
        unit,
        category,
        priceContition } = req.body;
    try {
        await Supply.create({
            _id,
            code,
            database,
            description,
            unit,
            category,
            priceContition
        });

        res.status(200).json({ message: 'Insumo criado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao criar insumo' });
    }
})

module.exports = route;