import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export function useModuleData(module, societyId, loader, creator, updater, deleter) {
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

  const updateRecord = useCallback(async (id, payload) => {
    if (!updater) throw new Error('No updater for module');
    if (module !== 'societies' && (!societyId || societyId === 'all')) throw new Error('Select a society first');
    
    const updatedRecord = module === 'societies' 
      ? await api[updater](id, payload) 
      : await api[updater](societyId, id, payload);
      
    setRecords((prev) => prev.map(r => r._id === id ? updatedRecord : r));
    return updatedRecord;
  }, [module, societyId]);

  const deleteRecord = useCallback(async (id) => {
    if (!deleter) throw new Error('No deleter for module');
    if (module !== 'societies' && (!societyId || societyId === 'all')) throw new Error('Select a society first');
    
    if (module === 'societies') {
      await api[deleter](id);
    } else {
      await api[deleter](societyId, id);
    }
      
    setRecords((prev) => prev.filter(r => r._id !== id));
  }, [module, societyId]);

  return { records, loading, error, refetch: fetchRecords, createRecord, updateRecord, deleteRecord };
}
