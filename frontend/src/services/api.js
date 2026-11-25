const API_URL = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessToken = '';
let onAuthFailure = () => {};

export const setAccessToken = (token) => { accessToken = token || ''; };
export const setAuthFailureHandler = (handler) => { onAuthFailure = handler || (() => {}); };

const request = async (path, options = {}) => {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401 && !['/auth/refresh', '/auth/login', '/auth/register'].includes(path)) {
    const refresh = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) {
      const data = await refresh.json();
      setAccessToken(data.accessToken);
      headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
    }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const sessionExpired = response.status === 401
      || (path === '/posts/feed' && response.status === 404 && data.message === 'User not found');
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.sessionExpired = sessionExpired;
    if (sessionExpired) {
      setAccessToken('');
      onAuthFailure();
    }
    throw error;
  }
  return data;
};

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
