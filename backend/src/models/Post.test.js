const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Post = require('./Post');

const createPost = (fields) => new Post({
  author: new mongoose.Types.ObjectId(),
  ...fields,
});

test('accepts a text-only post', async () => {
  await createPost({ content: 'Hello, Chirp!' }).validate();
});

test('accepts an image-only post with an HTTP URL', async () => {
  await createPost({ imageUrl: 'https://example.com/photo.jpg' }).validate();
});

test('accepts a video-only post with an HTTP URL', async () => {
  await createPost({ videoUrl: 'https://example.com/clip.mp4' }).validate();
});

test('accepts a bundled video path', async () => {
  await createPost({ videoUrl: '/videos/sample-reel.mp4' }).validate();
});

test('rejects posts without text or media', async () => {
  await assert.rejects(createPost({}).validate());
});

test('rejects media URLs with unsupported protocols', async () => {
  await assert.rejects(createPost({
    content: 'Check this out',
    imageUrl: 'javascript:alert(1)',
  }).validate());
  await assert.rejects(createPost({
    videoUrl: 'javascript:alert(1)',
  }).validate());
  await assert.rejects(createPost({
    videoUrl: '/videos/../../private.mp4',
  }).validate());
});

test('rejects posts with both an image and a video', async () => {
  await assert.rejects(createPost({
    imageUrl: 'https://example.com/photo.jpg',
    videoUrl: 'https://example.com/clip.mp4',
  }).validate());
});
