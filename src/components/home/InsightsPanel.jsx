// components/InsightsPanel.jsx
import { useEffect } from 'react';
import { useGenerateInsights } from '../hooks/useGenerateInsights';
import { useInsights } from '../hooks/useInsights';

export function InsightsPanel() {
  const { generate, generating, error } = useGenerateInsights();
  const { insights, loading, fetchInsights } = useInsights();

  useEffect(() => {
    fetchInsights(); // load whatever's already cached on mount
  }, [fetchInsights]);

  const handleClick = () => {
    generate(() => fetchInsights()); // refetch once generation completes
  };

  return (
    <div>
      <button onClick={handleClick} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Insights'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading && <p>Loading insights...</p>}

      {insights &&
        Object.entries(insights).map(([window, data]) => (
          <div key={window}>
            <h3>{window}</h3>
            {data.insights.length === 0 ? (
              <p>No insights yet</p>
            ) : (
              data.insights.map((insight, i) => (
                <div key={i}>
                  <strong>{insight.sentiment}</strong>: {insight.text}
                </div>
              ))
            )}
          </div>
        ))}
    </div>
  );
}