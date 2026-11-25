import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken, setAuthFailureHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));
    api.post('/auth/refresh').then((data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    }).catch(() => {}).finally(() => setLoading(false));
    return () => setAuthFailureHandler(null);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (values) => {
    const data = await api.post('/auth/register', values);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setAccessToken('');
    setUser(null);
  };

  const updateUser = (next) => setUser((current) => ({ ...current, ...next }));

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
