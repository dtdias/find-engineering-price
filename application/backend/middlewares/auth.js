const jwt = require('jsonwebtoken');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
exports.CheckAuthorization = function (needAuth) {
  return (req, res, next) => {
    req.userId = req.query.userId
    next();
  }

  return function CheckAuthorization(req, res, next) {
    const token = req.headers.authorization = req.headers.authorization || req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({
        message: 'No token provided.'
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
      const userIdFromToken = payload.id;

      if (!userIdFromToken) {
        return res.status(401).send({
          message: 'Unauthorized.'
        });
      }

      req.userId = userIdFromToken;
      return next();
    } catch (err) {
      return res.status(401).send({
        message: 'Invalid token.'
      });
    }
  }
}