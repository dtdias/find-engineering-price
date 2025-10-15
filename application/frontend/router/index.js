import crypto from "node:crypto"
import { Router } from "express";
import { fixUndefinedToken } from "../middleware/CheckAuthentication.js";
import injectCookieManager from "../middleware/ManageCookies.js";
import generateCsvRouter from "./generateCsv.js";
import componentRouter from "./components.js";
import storageMiddleware from "../middleware/Storage.js";

const ENV = {
  API_URL: process.env.API_URL,
  USER_MANAGEMENT_FEATURE: process.env.USER_MANAGEMENT_FEATURE == 'true',
}

export const router = Router()
router.use(injectCookieManager);
router.use(storageMiddleware);

router.use((req, res, next) => {
  res.setHeader('Service-Worker-Allowed', true);
  req.userId = req.query.userId || req.CM.getCookie('userId');
  next();
})

router.get('/entrar', (req, res) => {
  res.render('partial/dashboardShell', {
    title: 'Entrar | Por mil', page: 'signin', userId: req.userId, env: ENV, backendMessage: req.backendMessage
  });
})

router.get('/cadastro', (req, res) => {
  res.render('partial/dashboardShell', {
    title: 'Cadastrar | Por mil', page: 'signup', userId: req.userId, env: ENV, backendMessage: req.backendMessage
  });
})

router.get('/esqueci-minha-senha', (req, res) => {
  res.render('partial/dashboardShell', {
    title: 'Esqueci minha senha | Por mil', page: 'forgot-password', userId: req.userId, env: ENV, backendMessage: req.backendMessage
  });
})

router.get('/sair', (req, res) => {
  req.CM.setCookie('userId', '', { maxAge: 0 })
  res.render('partial/dashboardShell', {
    title: 'Sair | Por mil', page: 'signout', userId: req.userId, env: ENV, backendMessage: req.backendMessage
  });
})

router.use(generateCsvRouter)
router.use(componentRouter)
router.use((req, res, next) => {
  if (!req.userId && !["/entrar","/cadastro","/esqueci-minha-senha","/sair",'/component'].find((path)=> req.path.match(path))) {
    return res.redirect("/entrar")
  }
  next();
})


router.get('/', async (req, res) => {
  const requestEnterprise = await fetch(`${ENV.API_URL}/enterprise/by-user/${req.userId}`)
  if (requestEnterprise.status === 409) return res.redirect('enterprise/details');
  const { enterprise } = await requestEnterprise.json();

  res.render('partial/dashboardShell', {
    title: 'Por Mil', page: req.query.page || 'home', userId: req.userId,
    env: ENV, backendMessage: req.backendMessage, enterprise
  });
})

router.get('/enterprise', async (req, res) => {
  res.render('partial/dashboardShell', {
    title: 'Por Mil', page: 'enterprise/index', userId: req.userId,
    env: ENV, backendMessage: req.backendMessage
  });
})

router.get('/enterprise/details', async (req, res) => {
  const requestEnterprise = await fetch(`${ENV.API_URL}/enterprise/by-user/${req.userId}`)
  if (requestEnterprise.status === 409) {
    req.backendMessage = 'Por gentileza, cadastre uma empresa para continuar.';
  }

  const { enterprise } = await requestEnterprise.json()
  let users, roles;
  if (enterprise) {
    const requestDataByEnterprise = await fetch(`${ENV.API_URL}/users/get-by-enterprise/${enterprise.id}`,);
    const DataByEnterprise = await requestDataByEnterprise.json();
    users = DataByEnterprise.users;
    roles = DataByEnterprise.roles;
  }

  res.render('partial/dashboardShell', {
    title: 'Por Mil', page: 'enterprise/details',
    env: ENV, backendMessage: req.backendMessage, enterprise,
    userId: req.userId, users, roles
  });
})

router.get('/user/details', async (req, res) => {
  const userId = req.CM.getCookie('userId');
  const requestUser = await fetch(`${process.env.API_URL}/users/${userId}`)
  const user = await requestUser.json();

  res.render('partial/dashboardShell', {
    title: 'Por Mil', page: 'user/details', userId: req.userId,
    env: ENV, backendMessage: req.backendMessage, user
  });
})

router.get('/budget', async (req, res) => {
  const authorization = req.CM.getCookie('authorization');

  const [requestEnterprise, requestBudget] = await Promise.all([
    await fetch(`${ENV.API_URL}/enterprise/by-user/${req.userId}`),
    (req.query.id ? await fetch(`${ENV.API_URL}/budget/${req.query.id}`,) : false)
  ]);

  const [{ enterprise }, budget] = await Promise.all([
    await requestEnterprise.json(),
    await (req.query.id ? requestBudget.json() : false)
  ]);

  res.render('partial/dashboardShell', {
    title: 'Orçamentos', page: `budget/create`, userId: req.userId,
    env: ENV, backendMessage: '', budget, enterprise, authorization
  })
})

export default router;