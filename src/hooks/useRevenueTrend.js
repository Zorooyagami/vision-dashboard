// hooks/useRevenueTrend.js
import { useState, useEffect } from 'react';
import { fetchRevenueTrend } from '../services/revenueTrendApi';

export function useRevenueTrend({ period, customRange, platform, selectedPersonas, device }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRevenueTrend({ period, customRange, platform, selectedPersonas, device })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, customRange, platform, JSON.stringify(selectedPersonas), device]);

  return { data, loading, error };
}