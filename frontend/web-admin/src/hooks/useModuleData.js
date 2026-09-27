import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const moduleLoaders = {
  Societies: 'societies',
  Residents: 'residents',
  'Billing & payments': 'bills',
  Complaints: 'complaints',
  Visitors: 'visitors',
  Reports: 'payments'
};

const moduleCreators = {
  Societies: 'createSociety',
  Residents: 'createResident',
  'Billing & payments': 'createBill',
  Complaints: 'createComplaint',
  Visitors: 'createVisitor',
  Reports: 'createPayment'
};

export function useModuleData(module, societyId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!societyId || societyId === 'all') {
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
      const data = await api[loader](societyId);
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
    if (!societyId || societyId === 'all') throw new Error('Select a society first');
    const newRecord = await api[creator](societyId, payload);
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  }, [module, societyId]);

  return { records, loading, error, refetch: fetchRecords, createRecord };
}
