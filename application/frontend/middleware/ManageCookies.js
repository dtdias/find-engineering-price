/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export default function injectCookieManager(req, res, next) {
  req.CM = new CookieManager(req,res);
  next();
}

export class CookieManager {
  constructor(req, res) {
    /** @type {import('express').Request}  */
    this.req = req;
    /** @type {import('express').Response}  */
    this.res = res;
  }

  setCookie(name, value, options) {
    this.res.cookie(name, value, options);
  }

  getCookie(name) {
    const regex = new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    const match = this.getCookies()?.match(regex);
    return match ? match[2] : null;
  }

  deleteCookie(name) {
    this.res.clearCookie(name)
  }
  
  getCookies() {
    return this.req.headers.cookie;
  }
}