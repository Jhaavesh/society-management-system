import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const SocietyContext = createContext(null);

export function SocietyProvider({ children }) {
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSocieties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.societies();
      setSocieties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  const selectSociety = useCallback((id) => {
    setSelectedSocietyId(id);
  }, []);

  const selectedSociety = selectedSocietyId === 'all'
    ? null
    : societies.find((s) => String(s._id || s.id) === selectedSocietyId);

  const value = {
    societies,
    selectedSocietyId,
    selectedSociety,
    loading,
    error,
    fetchSocieties,
    selectSociety
  };

  return (
    <SocietyContext.Provider value={value}>
      {children}
    </SocietyContext.Provider>
  );
}

export function useSocieties() {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSocieties must be used within a SocietyProvider');
  }
  return context;
}
