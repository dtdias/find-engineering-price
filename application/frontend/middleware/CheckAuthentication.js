/**
 * Creates a new context object.
 * @returns {Object} The newly created context object.
 */

/**
 * Middleware function to check if the user is authenticated.
 * If the user is not authenticated, it redirects to the login page.
 *
 * @param {import('express').Request<{CM : {import('../ManageCookies.js') }}>} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns {void}
 */
export default async function checkAuthentication(req, res, next) {
  const authorization = req.headers.authorization || req.CM.getCookie('authorization')
  const userId = req.userId = await validateAuthorization(authorization);
  if (!userId && authorization) req.CM.deleteCookie('authorization');
  if (!userId) return res.redirect('/entrar');

  next();
}

/**
 * Validates the authorization token by making a request to the authentication server.
 * @param {string} authorization - The authorization token to be validated.
 * @returns {Promise<boolean>} - A promise that resolves to true if the token is valid, false otherwise.
 */
async function validateAuthorization(authorization) {
  const request = await fetch(`${process.env.API_URL}/auth/validate`, );
  const body = await request.json();
  return body?.id || null
}

/**
 * Middleware function to check if the user has an specific bug on token.
 * If the user has an 'undefined' token, it clean the token value to force the user to login.
 * 
 * TODO: After the version 2.1.1, the token is not being setted as 'undefined' anymore, but this middleware is 
 * still here to fix the old tokens that are still in use and this middleware will be removed in the future.
 *
 * @param {import('express').Request<{CM : {import('../ManageCookies.js') }}>} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns {void}
 */
export async function fixUndefinedToken(req, res, next) {
  const authorization = req.headers.authorization || req.CM.getCookie('authorization')
  req.backendMessage = '';
  if (authorization == 'undefined') {
    req.CM.deleteCookie('authorization');
    req.backendMessage = 'Sua sessão expirou, por favor, faça login novamente.';
  }
  next();
}