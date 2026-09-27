// src/hooks/useResidentData.js
import { useState, useEffect, useCallback } from 'react';
import { getResidentData } from '../services/api';
import { ResidentData } from '../types';

export function useResidentData(token, societyId) {
  const [data, setData] = useState<ResidentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchData = useCallback(async () => {
    if (!token || !societyId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getResidentData(token, societyId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, societyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
