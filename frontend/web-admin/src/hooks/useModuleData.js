import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const moduleLoaders = {
  societies: 'societies',
  buildings: 'buildings',
  flats: 'flats',
  residents: 'residents',
  billing: 'bills',
  complaints: 'complaints',
  notices: 'notices',
  visitors: 'visitors',
  reports: 'payments'
};

const moduleCreators = {
  societies: 'createSociety',
  buildings: 'createBuilding',
  flats: 'createFlat',
  residents: 'createResident',
  billing: 'createBill',
  complaints: 'createComplaint',
  notices: 'createNotice',
  visitors: 'createVisitor',
  reports: 'createPayment'
};

export function useModuleData(module, societyId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (module !== 'societies' && (!societyId || societyId === 'all')) {
      setRecords([]);
      return;
    }
    const loader = moduleLoaders[module];
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
  }, [module, societyId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = useCallback(async (payload) => {
    const creator = moduleCreators[module];
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
