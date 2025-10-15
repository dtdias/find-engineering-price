const { Router, raw } = require("express");
const { getComposition } = require('model/queries/compositions');
const { getSupplies } = require('model/queries/supplies');
const { Composition, CompositionItem, Supply } = require('../../model/mongo/index.js')

const ExcelJS = require('exceljs');
const UserController = require('../controllers/UserController.js').default;
const EnterpriseController = require('../controllers/EnterpriseController.js').default;
const RoleController = require('../controllers/RoleController.js').default;
const PermissionController = require('../controllers/PermissionController.js').default;
const AuthController = require('../controllers/AuthController.js').default;
const BudgetController = require('../controllers/BudgetController.js').default;

const { CheckAuthorization } = require("../middlewares/auth.js");
const db = require("model/models");

const router = Router({ caseSensitive: true });

router.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', [
    'Authorization', 'hx-current-url', 'hx-request',
    'hx-trigger', 'hx-trigger-name', 'hx-target', 'content-type', 'hx-refresh', 'enterpriseName',
    'x-device-fingerprint', '*'
  ].join(', '));
  res.header('Content-Type', 'application/json');
  next();
})

// SignUp route
router.post('/auth/signup', AuthController.signup)
  .post('/auth/signin', AuthController.signin)
  .get('/auth/validate', AuthController.validate)
  .get('/auth/forgot-password/:email', AuthController.forgotPassword)
  .post('/auth/forgot-password/:email', AuthController.forgotPassword)
  .get('/auth/change-password/:email', AuthController.changePassword)
  .post('/auth/change-password/:email', AuthController.changePassword)
  .post('/auth/signout', CheckAuthorization(true), AuthController.signout);

// Enterprises route
router.post('/enterprises', CheckAuthorization(true), EnterpriseController.create)
  .put('/enterprises/:id', CheckAuthorization(true), EnterpriseController.update)
  .delete('/enterprises/:id', CheckAuthorization(true), EnterpriseController.delete)
  .get('/enterprises/:id', CheckAuthorization(true), EnterpriseController.get);
router
  .get('/enterprise/by-user/:id', EnterpriseController.getByUser);

// Users route
router.post('/users', CheckAuthorization(true), UserController.create)
  .put('/users/:id', CheckAuthorization(true), UserController.update)
  .delete('/users/:id', CheckAuthorization(true), UserController.delete)
  .get('/users/:id', CheckAuthorization(true), UserController.get)
  .get('/users/get-by-enterprise/:enterpriseId', CheckAuthorization(true), UserController.getAllByEnterprise);

// Roles route
router.post('/roles', CheckAuthorization(true), RoleController.create)
  .put('/roles/:id', CheckAuthorization(true), RoleController.update)
  .delete('/roles/:id', CheckAuthorization(true), RoleController.delete)
  .get('/roles/:id', CheckAuthorization(true), RoleController.get);

// Permissions route
router.post('/permissions', CheckAuthorization(true), PermissionController.create)
  .put('/permissions/:id', CheckAuthorization(true), PermissionController.update)
  .delete('/permissions/:id', CheckAuthorization(true), PermissionController.delete)
  .get('/permissions/:id', CheckAuthorization(true), PermissionController.get);

// Budget route 
router
  .get('/budget/items/:id',CheckAuthorization(false), BudgetController.getBudgetItems)
  .post('/budget', CheckAuthorization(true), BudgetController.create)
  .put('/budget/:id', CheckAuthorization(true), BudgetController.update)
  .delete('/budget/:id', CheckAuthorization(true), BudgetController.delete)
  .get('/budget/:id', CheckAuthorization(true), BudgetController.get)
  .get('/budgets/:enterpriseId', CheckAuthorization(true), BudgetController.getAll)
  .put('/budget/:id/:action/:type/:code', CheckAuthorization(true), BudgetController.handleBudget)

router.post('/plan', async (req, res) => {
  const plan = await db.Plan.create(req.body);
  res.status(201).json({ plan });
})

router.get('/api/compositions', async (req, res) => {
  try {
    const response = await getComposition(req.query)
    res.json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/api/supplies', async (req, res) => {
  try {
    const response = await getSupplies(req.query)
    res.json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/api/data-by-codes', async (req, res) => {
  const parseCodes = (codes) => {
    if (codes.match(',')) {
      return codes.split(',')
    }

    return codes
  }
  try {

    const [compositions, supplies] = await Promise.all([
      await (async () => {
        return !req.query.compositions ? [] : await Composition.find({ code: { $in: parseCodes(req.query.compositions) } }).populate('children')
      })(),
      await (async () => {
        const supplies = {};
        const request = (await Promise.all([
          await Supply.find({ code: { $in: parseCodes(req.query.supplies) } }),
          await CompositionItem.find({ code: { $in: parseCodes(req.query.supplies) } })
        ]))
        request.flat().forEach((supply) => {
          const code = supply.code;
          supplies[code] = ({ ...(supplies[code] || {}), ...(supply?.toObject()) })
        })
        return Object.values(supplies)
      })(),
    ])

    res.json({ supplies, compositions })
  } catch (error) {
    console.error(error)
    res.json()
  }
})

router.get('/import-sheet/', async (req, res) => {
  res.header('Content-Type', 'text/html');
  res.status(200).send(`
    <form action="/import-sheet/sinapi" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Enviar</button>
    </form>
  `)
})

router.post(
  '/import-sheet/sinapi',
  raw({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
  async (req, res) => {
    const buffer = [];
    req.on('data', async function (chunk) { buffer.push(chunk) })
    req.on('end', async function () {
      const workbook = await new ExcelJS.Workbook().xlsx.load(Buffer.concat(buffer));
      const performCompositions = async () => {
        const wCompositions = workbook.getWorksheet('Composições')
        const end = wCompositions.actualRowCount - 5;
        const CompositionRegex = /(?<macroNum>\d{2})\.(?<macroName>\w+)\.(?<group>\w+)\.(?<groupNum>.*)/;
        const macroCompositionsIndex = [];
        wCompositions.getColumn('A').eachCell((cell, rowNumber) => { if (CompositionRegex.test(cell)) macroCompositionsIndex.push(rowNumber) })

        const queue = []
        for (let currentIndex in macroCompositionsIndex) {
          queue.push((async function () {
            const nextMacroCompositionIndex = macroCompositionsIndex[+(currentIndex) + 1] || end;
            const [macroComposition, ...childrens] = wCompositions.getRows(macroCompositionsIndex[currentIndex], nextMacroCompositionIndex - macroCompositionsIndex[currentIndex]);
            const [, macro, code, description, unit, _1, technicalNotebook, _2, _3, lastUpdate, costCondition] = macroComposition.values;
            const { macroNum, macroName, group, groupNum } = CompositionRegex.exec(macro).groups;

            const composition = {
              database: 'SINAPI', macro: { number: macroNum, name: macroName }, group: { name: group, nummber: groupNum }, code, description, unit,
              technicalNotebook, lastUpdate, costCondition, children: []
            };

            const compositionsItems = await CompositionItem.insertMany(childrens.map((child) => {
              const [, type, code, description, unit, price, withoutPriceCost, pendencies, technicalNotebook] = child.values;
              return { type, code, description, unit, price, withoutPriceCost, pendencies, technicalNotebook }
            }))
            composition.children = compositionsItems.map(({ id }) => id)
            return composition
          })())
        };
        const result = await Composition.insertMany(await Promise.all(queue));
        console.info(`inserted ${result.length} documents`)
      };


      const performSupplies = async () => {
        const wSupplies = workbook.getWorksheet('Insumos')
        const queue = []
        for (const row of wSupplies.getRows(5, wSupplies.actualRowCount - 5)) {
          const [, code, description, unit, costCondition, category, classfication] = row.values;
          if (code) queue.push({ code, database: 'SINAPI', description, unit, costCondition, category, nbr: String(classfication).replace(/\n/g, "") })
        }
        const result = await Supply.insertMany(queue)
        console.info(`inserted ${result.length} `)
      }
      await Promise.all([performCompositions(), performSupplies()])
      res.redirect('/import-sheet/')
    })
  }
)

module.exports = router;
