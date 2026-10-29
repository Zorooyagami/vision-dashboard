import { useEffect } from 'react'
import { Card, SparkleIcon, ViewAllBtn } from './shared'
import { SENTIMENT_DOT } from './homeConstants'
import { useGenerateInsights } from './../../hooks/useGenerateInsights'
import { useInsights } from './../../hooks/useInsights'
import { useFilters } from './../../context/FiltersContext'; // adjust path
import { periodToWindow } from './../../utils/periodToWindow';

function InsightCard({ insight, refreshing, onNavigate, onLogDecision }) {
  
  const dot =
    SENTIMENT_DOT[insight.sentiment] || SENTIMENT_DOT.neutral

  return (
    <div
      className="flex flex-col shrink-0 rounded-xl p-4"
      style={{
        width: 228,
        background: '#F8FAFC',
        border: '1px solid #F1F5F9',
      }}
    >
      {/* Sentiment + timestamp */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: dot.color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: dot.color }}
          />

          {insight.sentiment}
        </span>

        <span className="text-[11px] text-slate-400">
          {refreshing ? 'Just now' : insight.timestamp || 'Recently'}
        </span>
      </div>

      {/* Insight */}
      <p className="text-[13px] text-slate-700 leading-snug flex-1">
        {insight.text}
      </p>

      {/* Actions */}
      <div
        className="flex items-center gap-2 mt-4 pt-3"
        style={{ borderTop: '1px solid #F1F5F9' }}
      >
        <button
          onClick={() =>
            onLogDecision?.({
              title: insight.decisionTitle,
              metric: insight.decisionMetric,
              personas: [...(insight.decisionPersonas || [])],
            })
          }
          className="flex-1 text-[12px] font-semibold py-1.5 px-3 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: '#6366F1' }}
        >
          Log Decision
        </button>

        <button
          onClick={() => onNavigate?.(insight.screen)}
          aria-label="View detail"
          className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
          style={{ color: '#64748B' }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function AiInsightsPanel({
  onNavigate,
  onLogDecision,
}) {
  const { period } = useFilters();
  const window = periodToWindow(period);


  const {
    generate,
    generating,
    error: generateError,
  } = useGenerateInsights()

  const {
    insights,
    loading,
    error: fetchError,
    fetchInsights,
  } = useInsights()

  const refreshing = generating

  // Load cached insights when dashboard mounts
  useEffect(() => {
    fetchInsights(window)
  }, [fetchInsights, window])

  const insightList = Array.isArray(insights?.insights) ? insights.insights : [];
  const visibleInsights = insightList.slice(0, 6);

  // The generation hook manages progress/errors. Do not wrap its callback in
  // a promise: start/poll failures do not call the completion callback.
  const handleRefresh = () => {
    if (generating) return;
    generate(() => fetchInsights(window));
  };

  const error = generateError || fetchError;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: '#F1F5F9' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: '#6366F1' }}>
            <SparkleIcon />
          </span>

          <p className="text-sm font-bold text-slate-900">
            AI Insights
          </p>

          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: '#EEF2FF',
              color: '#4338CA',
            }}
          >
            AI-generated
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || generating}
            aria-label="Refresh AI insights"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target disabled:opacity-50"
            style={{ color: '#94A3B8' }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                animation:
                  refreshing || generating
                    ? 'spin 1s linear infinite'
                    : 'none',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <ViewAllBtn
            onClick={() => onNavigate?.('insights')}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 pt-4">
          <div
            className="rounded-lg px-3 py-2 text-[12px]"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FEE2E2',
            }}
          >
            Unable to update AI insights. Please try again.
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !insightList.length && (
        <div className="flex gap-4 px-5 pb-5 pt-4 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex flex-col shrink-0 rounded-xl p-4 animate-pulse"
              style={{
                width: 228,
                height: 166,
                background: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <div className="h-3 w-20 rounded bg-slate-200 mb-4" />
              <div className="h-3 w-full rounded bg-slate-200 mb-2" />
              <div className="h-3 w-5/6 rounded bg-slate-200 mb-2" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !insightList.length && !error && (
        <div className="px-5 py-8 text-center">
          <div
            className="mx-auto mb-2 flex items-center justify-center rounded-lg"
            style={{
              width: 34,
              height: 34,
              background: '#EEF2FF',
              color: '#6366F1',
            }}
          >
            <SparkleIcon />
          </div>

          <p className="text-[13px] font-semibold text-slate-700">
            No insights available
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Generate AI insights to discover opportunities and risks.
          </p>

          <button
            onClick={handleRefresh}
            disabled={generating || refreshing}
            className="mt-3 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
            style={{ background: '#6366F1' }}
          >
            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
      )}

      {!!insightList.length && (
        <p className="px-5 pt-3 text-xs text-slate-400">
          Showing {visibleInsights.length} of {insightList.length} insights
        </p>
      )}

      {/* Cards */}
      {!!insightList.length && (
        <div className="flex gap-4 px-5 pb-5 pt-4 overflow-x-auto">
          {visibleInsights.map((insight, index) => (
            <InsightCard
              key={insight.id || `${window}-${index}`}
              insight={insight}
              refreshing={refreshing || generating}
              onNavigate={onNavigate}
              onLogDecision={onLogDecision}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Card>
  )
}
