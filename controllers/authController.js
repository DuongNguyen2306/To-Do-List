const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { genAccessToken, genRefreshToken } = require('../utils/token');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true', // true in production with https
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const accessToken = genAccessToken(user._id);
    const rtInstance = await genRefreshToken(user._id);

    // set refresh token in httpOnly cookie (optional) and return access token in body
    res.cookie('refreshToken', rtInstance.token, cookieOptions);
    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = genAccessToken(user._id);
    const rtInstance = await genRefreshToken(user._id);

    res.cookie('refreshToken', rtInstance.token, cookieOptions);
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    // token can come from cookie or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    // find in DB
    const stored = await RefreshToken.findOne({ token });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });
    if (!stored.isActive()) return res.status(401).json({ message: 'Refresh token expired or revoked' });

    // verify signature
    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // rotation: revoke current refresh token and issue a new one
    stored.revokedAt = new Date();
    const newRt = await genRefreshToken(payload.id);
    stored.replacedByToken = newRt.token;
    await stored.save();

    const accessToken = genAccessToken(payload.id);

    res.cookie('refreshToken', newRt.token, cookieOptions);
    res.json({ accessToken });
  } catch (err) {
    console.error('refreshToken error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      const stored = await RefreshToken.findOne({ token });
      if (stored) {
        stored.revokedAt = new Date();
        await stored.save();
      }
    }
    // clear cookie
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
