// src/hooks/useJourneyFlow.js
import { useState, useEffect } from 'react';
import { fetchJourneyFlow } from '../services/journeyApi';

export function useJourneyFlow(filters) {
  const [data, setData] = useState({ totalSessions: 0, nodes: {}, edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchJourneyFlow(filters)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters.period, filters.customRange, filters.platform, JSON.stringify(filters.selectedPersonas), filters.device]);

  return { ...data, loading, error };
}