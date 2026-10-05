// src/components/home/RevenueTrendCard.jsx
import AreaChart from '../AreaChart'
import { Card } from './shared'
import { OUTCOME_MARKERS } from './homeConstants'
import { useFilters } from '../../context/FiltersContext' // adjust path
import { useRevenueTrend } from '../../hooks/useRevenueTrend'

export default function RevenueTrendCard({ decisions, device }) {
  const { platform, selectedPersonas, period, customRange } = useFilters()

  const { data, loading, error } = useRevenueTrend({
    period,
    customRange,
    platform,
    selectedPersonas,
    device, // optional prop until a real device filter exists in FiltersContext
  })

  const decisionByMonth = Object.fromEntries(
    decisions.map(d => [d.month, { text: d.title, outcome: OUTCOME_MARKERS[d.outcome] }])
  )

  const chartData = data.map(d => ({
    label: d.label,
    value: d.value,
    marker: decisionByMonth[d.label],
  }))

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-base font-bold text-slate-900">Revenue Trend</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {platform === 'combined' ? 'All platforms' : platform === 'web' ? 'Web only' : 'App only'} · $K · markers = logged decisions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {decisions.slice(0, 3).map(d => (
            <div key={d.id} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background:
                    d.outcome === 'success' ? '#10B981' : d.outcome === 'failed' ? '#EF4444' : '#94A3B8',
                }}
              />
              <span className="text-xs text-slate-500 truncate max-w-[120px]">
                {d.month}: {d.title.slice(0, 28)}
                {d.title.length > 28 ? '…' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-xs text-slate-400">Loading revenue trend...</p>}
      {error && <p className="text-xs text-red-500">Unable to load revenue trend.</p>}
      {!loading && !error && <AreaChart data={chartData} color="#6366F1" height={200} formatValue={v => `$${Math.round(v)}K`} />}
    </Card>
  )
}