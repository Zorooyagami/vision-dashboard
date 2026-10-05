// hooks/useGenerateInsights.js
import { useState, useCallback, useRef } from 'react';

const API_BASE = 'http://localhost:4000/api/admin';

export function useGenerateInsights() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const generate = useCallback(
    (onComplete) => {
      setError(null);
      setGenerating(true);

      fetch(`${API_BASE}/insights/generate`, { method: 'POST' })
        .then((res) => {
          if (res.status === 409) {
            // already running — just start polling, don't error out
            return;
          }
          if (!res.ok) throw new Error('Failed to start generation');
        })
        .catch((err) => {
          setError(err.message);
          setGenerating(false);
          return;
        });

      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/insights/status`);
          const { inProgress } = await res.json();

          if (!inProgress) {
            stopPolling();
            setGenerating(false);
            onComplete?.();
          }
        } catch (err) {
          stopPolling();
          setGenerating(false);
          setError('Lost connection while checking status');
        }
      }, 3000); // poll every 3s
    },
    [stopPolling]
  );

  return { generate, generating, error };
}