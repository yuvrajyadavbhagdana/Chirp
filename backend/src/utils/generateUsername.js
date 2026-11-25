const { randomBytes } = require('crypto');

const generateUsername = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 14);
  return `${base.length >= 3 ? base : 'user'}${randomBytes(3).toString('hex')}`;
};

module.exports = generateUsername;
