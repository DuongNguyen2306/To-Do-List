const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const genAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
};

const genRefreshToken = async (userId) => {
  // create jwt refresh token
  const token = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' });
  const expiresAt = new Date(Date.now() + parseExpiry(process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'));
  const rt = new RefreshToken({ token, userId, expiresAt });
  await rt.save();
  return rt;
};

function parseExpiry(exp) {
  // supports formats like '15m', '30d', '7d'
  const num = parseInt(exp.slice(0, -1), 10);
  const unit = exp.slice(-1);
  if (unit === 'm') return num * 60 * 1000;
  if (unit === 'h') return num * 60 * 60 * 1000;
  if (unit === 'd') return num * 24 * 60 * 60 * 1000;
  // fallback days
  return num * 24 * 60 * 60 * 1000;
}

module.exports = { genAccessToken, genRefreshToken };
