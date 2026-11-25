const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessToken = '';

export const setAccessToken = (token) => { accessToken = token || ''; };

const request = async (path, options = {}) => {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401 && path !== '/auth/refresh') {
    const refresh = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) {
      const data = await refresh.json();
      setAccessToken(data.accessToken);
      headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
    }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
