import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export function useModuleData(module, societyId, loader, creator) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (module !== 'societies' && (!societyId || societyId === 'all')) {
      setRecords([]);
      return;
    }
    if (!loader) {
      setRecords([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = module === 'societies' ? await api[loader]() : await api[loader](societyId);
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [module, societyId, loader]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = useCallback(async (payload) => {
    if (!creator) throw new Error('No creator for module');
    if (module !== 'societies' && (!societyId || societyId === 'all')) throw new Error('Select a society first');
    
    const newRecord = module === 'societies' 
      ? await api[creator](payload) 
      : await api[creator](societyId, payload);
      
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  }, [module, societyId]);

  return { records, loading, error, refetch: fetchRecords, createRecord };
}
