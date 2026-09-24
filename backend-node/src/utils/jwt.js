const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change-this-secret-key-in-production-please-use-a-long-random-value';
const EXPIRATION = `${Number(process.env.JWT_EXPIRATION_MINUTES || 60)}m`;

function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, SECRET, { expiresIn: EXPIRATION });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { createToken, verifyToken };
