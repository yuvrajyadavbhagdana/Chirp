const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const register = async (req, res) => {
  const { name, username, email, password, avatar } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({ message: 'All required fields must be provided' });
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ message: 'Username must be 3-20 letters, numbers, or underscores' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })) {
    return res.status(409).json({ message: 'Email or username is already in use' });
  }
  const user = await User.create({ name, username, email, password, avatar });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.status(201).json({ accessToken, user: publicUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.json({ accessToken, user: publicUser(user) });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Refresh token is invalid' });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, cookieOptions());
    res.json({ accessToken, user: publicUser(user) });
  } catch {
    res.status(401).json({ message: 'Refresh token is invalid or expired' });
  }
};

const logout = async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};

const me = async (req, res) => res.json(publicUser(req.user));

const publicUser = (user) => ({
  _id: user._id, name: user.name, username: user.username, email: user.email,
  avatar: user.avatar, coverImage: user.coverImage, bio: user.bio, role: user.role, createdAt: user.createdAt,
});

module.exports = { register, login, refresh, logout, me };
