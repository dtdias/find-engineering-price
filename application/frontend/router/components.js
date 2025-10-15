import { randomInt } from 'node:crypto'
import { Router } from "express";

const API_URL = process.env.API_URL;

const componentRouter = Router();

componentRouter.get('/component/user', async (req, res) => {
  const userId = req.CM.getCookie('userId')
  const request = await fetch(`${API_URL}/users/${userId}`,)
  const user = await request.json();
  const greetings = (hour) => (hour < 12) ? "Bom dia" : (hour < 18) ? "Boa tarde" : "Boa noite"
  const messages = ["Olá", "Oi", "E aí", greetings(new Date().getHours())]
  const random = randomInt(messages.length);
  res.render('component/user', { user, message: messages[random] });
})

componentRouter.get('/component/budgets', async (req, res) => {
  const request = await fetch(`${API_URL}/budgets/${req.query.enterpriseId}`,)
  const budgets = await request.json();
  res.render('component/table/budget', { budgets, env: { API_URL } })
})

componentRouter.get('/component/table/composition', async (req, res) => {
  try {
    const query = new URLSearchParams({ ...req.query, withChildren: false });
    const requestCompositions = await fetch(`${API_URL}/api/compositions?${query}`);
    const compositions = await requestCompositions.json();
    const { codes, id, enterpriseDocument, enterpriseName } = req.query
    res.render('component/table/composition', { compositions, codes, id, enterpriseDocument, enterpriseName });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ops, algo deu errado!')
  }
})

componentRouter.get('/component/table/supply', async (req, res) => {
  try {
    const query = new URLSearchParams({ ...req.query, });
    const requestCompositions = await fetch(`${API_URL}/api/supplies?${query}`);
    const supplies = await requestCompositions.json();
    const { codes, id, enterpriseDocument, enterpriseName } = req.query
    res.render('component/table/supply', { supplies, codes, id, enterpriseDocument, enterpriseName });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ops, algo deu errado!')
  }
})

componentRouter.get('/component/table/result', async (req, res) => {
  if (!req.query.id) return res.send('')
  const request = await fetch(`${API_URL}/budget/${req.query.id}?populated=1`,);
  const budget = await request.json();
  if (!(budget.supplies.length || budget.compositions.length)) return res.send('')
  const { enterpriseDocument, enterpriseName } = req.query
  res.render('component/table/result', { budget, env: { API_URL }, enterpriseDocument, enterpriseName });
})

componentRouter.get('/component/table/resultChildren', async (req, res) => {
  if (!req.query.id) return res.send('')
  const request = await fetch(`${API_URL}/budget/items/${req.query.id}?type=composition&budgetId=${req.query.budgetId}`);
  const composition = await request.json();
  res.render('component/table/resultChildren', { composition, item: req.query.item, budgetId: req.query.budgetId, env: { API_URL } });
})

componentRouter.get('/component/table/supplyPrice', async (req, res) => {
  if (!req.query.id) return res.send('')
  const request = await fetch(`${API_URL}/budget/items/${req.query.id}?type=supply`);
  const supply = await request.json();
  const price = Number(String(req.query.currentPrice || supply?.price).replace(',', '.')).toFixed(5)

  res.status(200).send(`<input type="number" class="form-control" style="width:120px;" id="price_${supply._id}" name="price" value="${price}" >`)
})

componentRouter.get('/component/table/:id/:type/:action', async (req, res) => {
  const { id, type, action } = req.params;
  const { itemCode, enterpriseDocument, enterpriseName } = req.query;
  const updateRequest = await fetch(`${API_URL}/budget/${id}/${action}/${type}/${itemCode}?populated=1`, { method: 'PUT' });
  const budget = await updateRequest.json();
  res.render('component/table/result', {
    budget, enterpriseDocument, env: { API_URL }, enterpriseName
  });
})

componentRouter.get('/component/request-budget/:key', async (req, res) => {
  res.json(await req.storage.budget.get(req.userId))
});

componentRouter.get('/component/list/:type', async (req, res) => {
  const { type } = req.params;
  const context = (await req.storage.budget.get(req.userId))?.[type];

  if (!context?.length) return res.send(`
      <h3 class="text-center">${type == 'supply' ? 'Insumos' : 'Composições'} escolhidas</h3>
        <h5 class="text-center">Adicione Composições</h5>
  `)

  const { list, title } = ({
    composition: { list: await getComposition({ codes: context }), title: 'Composições Escolhidas' },
    supply: { list: await getSupplies({ codes: context }), title: 'Insumos Escolhidos' }
  })[type]

  res.render('component/resultList', { list, title, type });
});

componentRouter.get('/component/enterprise-form', async (req, res) => {
  const requestEnterprise = await fetch(`${API_URL}/enterprise/by-user/${req.userId}`);
  const { enterprise } = await requestEnterprise.json();
  const { onlyView } = req.query;

  res.render('component/enterpriseForm', {
    enterprise, userId: req.userId, onlyView, env: { API_URL }
  })
})

componentRouter.get('/component/user-form', async (req, res) => {
  const userId = req.CM.getCookie('userId');
  const { onlyView } = req.query;

  const requestUser = await fetch(`${API_URL}/users/${userId}`,)
  const user = await requestUser.json();

  const requestRole = await fetch(`${API_URL}/roles/${user.role}`,);
  const role = await requestRole.json();

  res.render('component/userForm', { user, role, onlyView, env: { API_URL } });
})

componentRouter.get('/component/budget-form', async (req, res) => {
  const { id, enterpriseId, enterpriseName } = req.query;
  let budget = {};
  if (id) {
    const request = await fetch(`${API_URL}/budget/${req.query.id}`,)
    budget = await request.json();
  }

  res.render('component/budgetForm', { budget, enterpriseName, enterpriseId, env: { API_URL } });
})


componentRouter.get('/component/add-input', async (req, res) => {
  res.render('component/addInput', { query });
})

export default componentRouter;

