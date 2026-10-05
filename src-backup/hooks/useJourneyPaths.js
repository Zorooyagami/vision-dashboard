// hooks/useJourneyPaths.js
import { useState, useEffect } from 'react';
import { fetchTopPaths } from '../services/journeyApi';

export function useJourneyPaths(filters) {
  const [data, setData] = useState({ topPaths: [], totalSessions: 0, totalPurchasers: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTopPaths(filters)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters.period, filters.customRange, filters.platform, JSON.stringify(filters.selectedPersonas), filters.device]);

  return { ...data, loading, error };
}