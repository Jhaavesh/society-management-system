import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('societyOS.session');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('societyOS.token');
    if (token && !session) {
      setLoading(true);
      api.societies()
        .then(() => {})
        .catch(() => {
          localStorage.removeItem('societyOS.token');
          localStorage.removeItem('societyOS.session');
          setSession(null);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('societyOS.token', data.token);
      localStorage.setItem('societyOS.session', JSON.stringify(data));
      setSession(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('societyOS.token');
    localStorage.removeItem('societyOS.session');
    setSession(null);
  }, []);

  const value = {
    session,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
