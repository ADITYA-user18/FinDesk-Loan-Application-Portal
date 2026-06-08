import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, name, mobile, role }
  const [loading, setLoading] = useState(true);   // true while checking session

  // On app mount — check if cookie session is still valid
  useEffect(() => {
    API.get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (data) => {
    const res = await API.post('/api/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('findesk_token', res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const login = useCallback(async (mobile, password) => {
    const res = await API.post('/api/auth/login', { mobile, password });
    if (res.data.token) {
      localStorage.setItem('findesk_token', res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await API.post('/api/auth/logout');
    localStorage.removeItem('findesk_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    isAgent: user?.role === 'agent',
    isBorrower: user?.role === 'borrower',
    register,
    login,
    logout,
  }), [user, loading, register, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
