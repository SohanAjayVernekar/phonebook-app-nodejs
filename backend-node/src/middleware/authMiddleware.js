const userModel = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

async function authenticate(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) {
      const error = new Error('Could not validate authentication credentials');
      error.status = 401;
      throw error;
    }
    const payload = verifyToken(header.slice(7));
    const user = await userModel.findById(Number(payload.sub));
    if (!user) {
      const error = new Error('Could not validate authentication credentials');
      error.status = 401;
      throw error;
    }
    req.user = user;
    next();
  } catch (error) {
    const authError = new Error('Could not validate authentication credentials');
    authError.status = 401;
    next(authError);
  }
}

module.exports = { authenticate };
