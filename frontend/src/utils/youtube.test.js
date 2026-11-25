import assert from 'node:assert/strict';
import test from 'node:test';
import { getYouTubeEmbedUrl } from './youtube.js';

test('converts YouTube Shorts URLs into privacy-enhanced embeds', () => {
  assert.equal(
    getYouTubeEmbedUrl('https://youtube.com/shorts/TICYw82Y9Us'),
    'https://www.youtube-nocookie.com/embed/TICYw82Y9Us',
  );
});

test('supports standard YouTube watch URLs', () => {
  assert.equal(
    getYouTubeEmbedUrl('https://www.youtube.com/watch?v=TICYw82Y9Us'),
    'https://www.youtube-nocookie.com/embed/TICYw82Y9Us',
  );
});

test('rejects non-YouTube hosts and malformed video IDs', () => {
  assert.equal(getYouTubeEmbedUrl('https://youtube.com.evil.example/shorts/TICYw82Y9Us'), null);
  assert.equal(getYouTubeEmbedUrl('https://youtube.com/shorts/not-a-video-id'), null);
});
