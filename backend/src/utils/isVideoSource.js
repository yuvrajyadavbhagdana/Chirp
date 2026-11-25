const isHttpUrl = require('./isHttpUrl');

const isVideoSource = (value) => {
  if (isHttpUrl(value)) return true;
  if (typeof value !== 'string' || !value.startsWith('/videos/')) return false;
  if (value.includes('\\') || value.includes('..') || value.includes('?') || value.includes('#')) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(value) || !/\.(mp4|webm|ogg)$/i.test(value)) return false;
  return value.slice('/videos/'.length).split('/').every((segment) => segment && segment !== '.');
};

module.exports = isVideoSource;
