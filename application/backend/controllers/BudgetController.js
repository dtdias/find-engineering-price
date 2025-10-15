const { randomUUID } = require('crypto');
const hasRequiredItems = require('../helpers/hasRequiredItems');
const { Budget, Supply, Composition, CompositionItem, mongoose, } = require('../../model/mongo');
const setIfExsits = require('../helpers/setIfExsits');

/**
 * Controller class for managing budget.
 */
class BudgetController {
    /** 
     * @param {import('express').Request} req - The request object.
     * @param {import('express').Response} res - The response object.
     */
    static async create(req, res) {
        const { name, enterpriseId, code, workName } = req.body;
        if (!hasRequiredItems(res, [name, enterpriseId, code, workName])) return;
        const reference = { id: randomUUID(), bdi: 0 };
        const newData = setIfExsits(['name', 'enterpriseId', 'code', 'workName', 'bdi'], req.body, reference);
        const budget = await Budget.create(newData);
        if (req.header('hx-request')) {
            return res.status(200).send(`<div hx-get="/component/budget-form?enterpriseId=${budget.enterpriseId}&enterpriseName=${req.header('enterpriseName')}&id=${budget._id}" hx-trigger="load" hx-swap="outerHTML"></div>`);
        }
        return res.status(201).json({
            message: 'Budget created successfully', id: budget._id
        });
    }

    /** 
     * @param {import('express').Request} req - The request object.
     * @param {import('express').Response} res - The response object.
     */
    static async update(req, res) {
        const { id } = req.params;
        if (!hasRequiredItems(res, [id])) return;
        const newData = setIfExsits(['name', 'enterpriseId', 'code', 'workName', 'bdi'], req.body);
        const budget = await Budget.findByIdAndUpdate(id, newData, {});

        if (req.header('hx-request')) {
            return res.status(200).send(`<div hx-get="/component/budget-form?enterpriseId=${budget.enterpriseId}&enterpriseName=${req.header('enterpriseName')}&id=${budget._id}" hx-trigger="load" hx-swap="outerHTML"></div>`);
        }

        return res.status(200).json({ message: ' updated successfully' });
    }

    /** 
     * @param {import('express').Request} req - The request object.
     * @param {import('express').Response} res - The response object.
     */
    static async delete(req, res) {
        const { id } = req.params;
        if (!hasRequiredItems(res, [id])) return;
        await Budget.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Role deleted successfully' });
    }

    /** 
     * @param {import('express').Request} req - The request object.
     * @param {import('express').Response} res - The response object.
     */
    static async get(req, res) {
        try {
            const { id } = req.params;
            if (!hasRequiredItems(res, [id])) return;
            const budget = await Budget.findById(id);
            if (!!req.query.populated) {
                await budget.populate([{
                    path: 'compositions',
                    populate: {
                        path: 'source',
                        populate: {
                            path: 'children'
                        }
                    }
                }, { path: 'supplies', populate: 'source' }])
            }
            return res.status(200).json(budget.toObject());
        } catch (error) {
            return res.status(500)
        }
    }

    /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
    static async getAll(req, res) {
        try {
            const { enterpriseId } = req.params;
            if (!hasRequiredItems(res, [enterpriseId])) return;
            const budgets = await Budget.find({ enterpriseId });
            if (!!req.query.populated) {
                await budgets.populate([{ path: 'compositions', populate: 'source' }, { path: 'supplies', populate: 'source' }])
            }
            return res.status(200).json(budgets);
        } catch (error) {
            return res.status(500)
        }
    }

    /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
    static async getBudgetItems(req, res) {
        const { id } = req.params;
        const { type } = req.query;
        if (!hasRequiredItems(res, [id])) return;
        let result = null;
        if (type == 'composition') {
            result = { composition: await Composition.findById(id) };
            const budget = await Budget.findById(req.query.budgetId)
            result.metadata = budget.compositions
                .find(composition => {
                    return result.composition._id.equals(composition.source._id);
                });

            await result.composition.populate('children');
        } else {
            const supply = await Supply.findById(id);
            const compositionItem = await CompositionItem.findOne({ code: supply.code })
            result = { ...supply.toObject(), ...compositionItem?.toObject() };
        }
        res.status(200).json(result)
    }

    /** 
    * @param {import('express').Request} req - The request object.
    * @param {import('express').Response} res - The response object.
    */
    static async handleBudget(req, res) {
        try {
            const { id, action, type, code } = req.params
            if (!hasRequiredItems(res, [id, action, type, code])) return;
            const budget = await Budget.findById(id);

            if (action == 'update' && type == 'all') {
                const budgetItems = req.body;
                await Promise.all([
                    async function () {
                        for (const composition of budget.compositions) {
                            const childPrices = new Set();
                            for (let [id, data] of Object.entries(budgetItems.composition[composition.source._id])) {
                                childPrices.add({ id, ...data });
                            }
                            composition.childPrices = Array.from(childPrices);
                        }
                    }(),
                    async function () {
                        for (const supply of budget.supplies) {
                            const { price, quantity } = budgetItems.supply[supply._id]
                            supply.price = price;
                            supply.quantity = quantity;
                        }
                    }()
                ])
                await budget.save()
            } else {
                const Model = type == 'compositions' ? Composition : Supply;
                const item = await Model.findOne({ code });
                if (!item) return res.status(404).json({ message: "Não encontrado" });
                const itemAlreadyExists = budget[type].find((_item) => _item.source._id.equals(item._id));
                if (action == 'add' && !itemAlreadyExists) {
                    budget[type].push(({
                        source: item._id,
                        quantity: 0,
                    }))
                    await budget.save()
                }
                if (action == 'remove' && itemAlreadyExists) {
                    budget[type] = budget[type].filter((_item) => !_item._id.equals(itemAlreadyExists._id))
                    await budget.save()
                }
            }


            if (!!req.query.populated) {
                await budget.populate([{ path: 'compositions', populate: 'source' }, { path: 'supplies', populate: 'source' }])
            }
            res.status(200).json(budget.toObject())
        } catch (error) {
            return res.status(500)
        }
    }
}

exports.default = BudgetController;