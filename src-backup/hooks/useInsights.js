// hooks/useInsights.js
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api/admin';

export function useInsights() {
  const [insights, setInsights] = useState(null); // now: { generatedAt, insights: [...] } for ONE window
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async (window) => {
     console.log("window", window)
    setLoading(true);
    setError(null);
    try {
      const url = window
        ? `${API_BASE}/insights?window=${window}`
        : `${API_BASE}/insights`; // fallback: all windows
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          console.log("res", res)
          setInsights({ generatedAt: null, insights: [] }); // not generated yet, not an error
          return;
        }
        throw new Error('Failed to fetch insights');
      }
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, error, fetchInsights };
}