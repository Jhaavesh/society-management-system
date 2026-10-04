import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const SocietyContext = createContext(null);

export function SocietyProvider({ children }) {
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, session } = useAuth();

  const fetchSocieties = useCallback(async () => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  const selectSociety = useCallback((id) => {
    setSelectedSocietyId(id);
  }, []);

  // For non-platform admins, they should only ever have one society.
  const isPlatformAdmin = session?.user?.role === 'platform_admin';
  const effectiveSocietyId = isPlatformAdmin ? selectedSocietyId : (session?.user?.societyId || (societies.length > 0 ? societies[0]._id : 'all'));

  const selectedSociety = effectiveSocietyId === 'all'
    ? null
    : societies.find((s) => String(s._id || s.id) === String(effectiveSocietyId));

  const value = {
    societies,
    selectedSocietyId: effectiveSocietyId,
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
