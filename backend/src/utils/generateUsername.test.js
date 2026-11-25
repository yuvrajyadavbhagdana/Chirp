const test = require('node:test');
const assert = require('node:assert/strict');
const generateUsername = require('./generateUsername');

test('generates a valid unique-style username from the supplied name', () => {
  const first = generateUsername('Yuvraj Yadav');
  const second = generateUsername('Yuvraj Yadav');

  assert.match(first, /^[a-z0-9_]{3,20}$/);
  assert.match(first, /^yuvrajyadav/);
  assert.notEqual(first, second);
});

test('uses a valid fallback for names without enough username characters', () => {
  assert.match(generateUsername('李'), /^user[a-f0-9]{6}$/);
});
