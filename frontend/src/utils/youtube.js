const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const YOUTUBE_SHORT_HOSTS = new Set(['youtu.be', 'www.youtu.be']);

export const getYouTubeEmbedUrl = (source) => {
  let url;
  try {
    url = new URL(source);
  } catch {
    return null;
  }

  let videoId = null;
  if (YOUTUBE_SHORT_HOSTS.has(url.hostname)) {
    videoId = url.pathname.split('/').filter(Boolean)[0];
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    const [format, id] = url.pathname.split('/').filter(Boolean);
    videoId = format === 'watch' ? url.searchParams.get('v') : ['shorts', 'embed', 'live', 'v'].includes(format) ? id : null;
  }

  return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null;
};
