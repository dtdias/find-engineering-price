const { Router } = require('express');
const { mongoose, Budget } = require('model/mongo');

const route = Router();

route.get('/budget', async (req, res) => {
    const budgets = (await Budget.find());
    res.render('budget/index', { budgets });
});

route.get('/budget/:id/visualize', async (req, res) => {
    const budget = (await Budget.findById(req.params.id));
    await budget.populate([{
        path: 'compositions',
        populate: {
            path: 'source',
            populate: {
                path: 'children'
            }
        }
    }, {
        path: 'supplies', populate: 'source'
    }])
    // debugger
    res.render('budget/visualize', { budget });
});

// route.get('/budget/:id/edit', async (req, res) => {
//     const composition = (await Budget.findById(req.params.id));
//     await composition.populate('children')
//     res.render('composition/edit', { composition });
// }).put('/budget/:id/edit', async (req, res) => {
//     const {  } = req.body;
//     const data = {}
//     if (code) data.code = code;
//     if (database) data.database = database;
//     if (description) data.description = description;
//     if (unit) data.unit = unit;
//     if (category) data.category = category;
//     if (costCondition) data.costCondition = costCondition;
//     try {
//         if (children) {
//             const compositionsItems = await Promise.all(children.map((child) => {
//                 const { type, code, description, unit, price, _id, pendencies } = child;
//                 return CompositionItem.findByIdAndUpdate(_id, {
//                     type, code, description, unit, price, pendencies
//                 }, { upsert: true, new: true })
//             }))
//             data.children = compositionsItems.map(({ _id }) => _id)
//         }

//         await Budget.findByIdAndUpdate(req.params.id, data);
//         res.status(200).json({ message: 'Insumo atualizado com sucesso' })
//     } catch (error) {
//         return res.status(400).json({ message: 'Erro ao atualizar a insumo' });
//     }
// })

// route.get('/budget/:id/delete', async (req, res) => {
//     try {
//         await Budget.findByIdAndDelete(req.params.id);

//         res.json({ message: "Deleção realizada com sucesso" });
//     } catch (err) {
//         res.status(500).json({ message: 'Erro ao deletar o insumo' });
//     }
// })

// route.get('/budget/create', async (req, res) => {
//     const id = (await mongoose).mongo.ObjectId.createPk();
//     // debugger
//     res.render('composition/create', { id });
// }).post('/budget/create', async (req, res) => {
//     const { _id,
//         code,
//         database,
//         description,
//         unit,
//         category,
//         costCondition } = req.body;
//     try {
//         await Budget.create({
//             _id,
//             code,
//             database,
//             description,
//             unit,
//             category,
//             costCondition,
//             children
//         });
//         if (children) {

//         }

//         res.status(200).json({ message: 'Insumo criado com sucesso' })
//     } catch (error) {
//         return res.status(400).json({ message: 'Erro ao criar insumo' });
//     }
// })

module.exports = route;