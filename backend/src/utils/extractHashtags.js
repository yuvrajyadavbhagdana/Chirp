const extractHashtags = (content = '') =>
  [...new Set((content.match(/(^|[^A-Za-z0-9_])#([A-Za-z0-9_]+)/g) || [])
    .map((match) => match.trim().replace(/^#/, '').toLowerCase())
    .filter(Boolean))];

module.exports = extractHashtags;
