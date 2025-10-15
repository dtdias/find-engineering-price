const { db } = require('model/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const { User, Enterprise } = db;

const PASSWORD_SALTS = process.env.PASSWORD_SALTS || 8;
const JWT_SECRET = process.env.JWT_SECRET || 'dev';
/**
 * Controller class for handling authentication-related operations.
 */
class AuthController {
  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async signup(req, res) {
    const { name, email, password, document } = req.body;
    if (!name || !email || !password || !document) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
      const user = await User.create({
        id: randomUUID(),
        name,
        email,
        document,
        password: bcrypt.hashSync(password, PASSWORD_SALTS)
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
      res.status(201).json({
        message: 'User created successfully',
        token
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'User already exists' });
    }
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async signin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
    res.status(200).json({
      message: 'User logged in successfully',
      id: user.id,
      token
    });
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static signout(req, res) {
    res.clearCookie('authorization');
    res.status(200).json({ message: 'User logged out successfully' });
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static validate(req, res) {
    const token = req.headers.authorization;
    if (!token || ['null', 'undefined'].includes(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if(err.name === 'TokenExpiredError'){
          return res.status(400).json({ message: 'Expired' });
        }
        return res.status(401).json({ message: 'Unauthorized' });
      }

      res.status(200).json({ message: 'Valid token', id: decoded.id });
    });
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async forgotPassword(req, res) {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    try {
      const newPassword = req.body.password || req.query.password;
      user.password = bcrypt.hashSync(newPassword, PASSWORD_SALTS);
      await user.save();
      res.status(200).json({ message: 'New password sent to email' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  /**
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   */
  static async changePassword(req, res) {
    if (!req.params.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email: req.params.email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentPassword = req.body.currentPassword || req.query.currentPassword;
    if(!require('bcryptjs').compareSync(currentPassword, user.password)) {
      return res.status(406).json({ message: 'Wrong password' });
    }
    
    try {
      const newPassword = req.body.password || req.query.password;
      user.password = bcrypt.hashSync(newPassword, PASSWORD_SALTS);
      await user.save();
      res.status(200).json({ message: 'New password sent to email' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

exports.default = AuthController;