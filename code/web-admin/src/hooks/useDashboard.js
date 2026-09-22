import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export function useDashboard(societyId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!societyId || societyId === 'all') {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.dashboard(societyId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
