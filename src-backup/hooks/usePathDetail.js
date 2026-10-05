// hooks/usePathDetail.js
import { useState, useCallback } from 'react';
import { fetchPathDetail } from '../services/journeyApi';

export function usePathDetail(filters) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDetail = useCallback((nodes) => {
    setLoading(true);
    setError(null);
    fetchPathDetail(filters, nodes)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters.period, filters.customRange, filters.platform, JSON.stringify(filters.selectedPersonas), filters.device]);

  const clearDetail = useCallback(() => setDetail(null), []);

  return { detail, loading, error, loadDetail, clearDetail };
}