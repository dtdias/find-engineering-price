const { Router } = require('express');
const { mongoose, Composition, CompositionItem } = require('model/mongo');

const route = Router();

route.get('/composition', async (req, res) => {
    const compositions = (await Composition.find());
    res.render('composition/index', { compositions });
});

route.get('/composition/:id/edit', async (req, res) => {
    const composition = (await Composition.findById(req.params.id));
    await composition.populate('children')
    res.render('composition/edit', { composition });
}).put('/composition/:id/edit', async (req, res) => {
    const { code,
        database,
        description,
        unit,
        category,
        costCondition,
        children } = req.body;
    const data = {}
    if (code) data.code = code;
    if (database) data.database = database;
    if (description) data.description = description;
    if (unit) data.unit = unit;
    if (category) data.category = category;
    if (costCondition) data.costCondition = costCondition;
    try {
        if (children) {
            const compositionsItems = await Promise.all(children.map((child) => {
                const { type, code, description, unit, price, _id, pendencies } = child;
                return CompositionItem.findByIdAndUpdate(_id, {
                    type, code, description, unit, price, pendencies
                }, { upsert: true, new: true })
            }))
            data.children = compositionsItems.map(({ _id }) => _id)
        }

        await Composition.findByIdAndUpdate(req.params.id, data);
        res.status(200).json({ message: 'Insumo atualizado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao atualizar a insumo' });
    }
})

route.get('/composition/:id/delete', async (req, res) => {
    try {
        await Composition.findByIdAndDelete(req.params.id);

        res.json({ message: "Deleção realizada com sucesso" });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao deletar o insumo' });
    }
})

route.get('/composition/create', async (req, res) => {
    const id = (await mongoose).mongo.ObjectId.createPk();
    // debugger
    res.render('composition/create', { id });
}).post('/composition/create', async (req, res) => {
    const { _id,
        code,
        database,
        description,
        unit,
        category,
        costCondition } = req.body;
    try {
        await Composition.create({
            _id,
            code,
            database,
            description,
            unit,
            category,
            costCondition,
            children
        });
        if (children) {

        }

        res.status(200).json({ message: 'Insumo criado com sucesso' })
    } catch (error) {
        return res.status(400).json({ message: 'Erro ao criar insumo' });
    }
})

module.exports = route;