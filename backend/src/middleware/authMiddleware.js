const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }

  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  req.user = user;
  return next();
};

module.exports = protect;
