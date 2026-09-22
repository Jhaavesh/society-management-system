// src/context/AuthContext.js
import { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SESSION_KEY } from '../types';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(SESSION_KEY)
      .then((raw) => raw && setSession(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setHydrating(false));
  }, []);

  const login = useCallback(async (newSession) => {
    setSession(newSession);
    if (newSession?.token) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession));
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, hydrating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
