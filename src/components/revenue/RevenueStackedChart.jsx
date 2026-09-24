// src/components/revenue/RevenueStackedChart.jsx
import BarChart from '../BarChart'
import { PERSONAS } from '../../data/personas'

export default function RevenueStackedChart({ platform, selectedPersonas, monthly, loading }) {
  const months = Object.keys(monthly)

  const stackedSeries = PERSONAS
    .filter(p => p.id !== 'collector') // not a real computable persona — see note in chat
    .filter(p => selectedPersonas.length === 0 || selectedPersonas.includes(p.id))
    .map(p => ({ key: p.id, color: p.color, name: p.name }))

  const stackedData = Object.fromEntries(
    months.map(m => [
      m,
      Object.fromEntries(
        Object.entries(monthly[m] || {})
          .filter(([k]) => selectedPersonas.length === 0 || selectedPersonas.includes(k))
      ),
    ])
  )

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-slate-900">Revenue by Persona</p>
          <p className="text-xs text-slate-400">Monthly stacked ($K) · {platform === 'combined' ? 'All Platforms' : platform}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stackedSeries.map(p => (
            <div key={p.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
              <span className="text-[10px] font-semibold text-slate-500">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      {loading && <p className="text-xs text-slate-400 text-center py-12">Loading chart…</p>}
      {!loading && stackedSeries.length > 0 && months.length > 0 && (
        <BarChart stacked stackedSeries={stackedSeries} stackedData={stackedData} height={200} data={[]} formatValue={v => `$${Math.round(v)}K`} />
      )}
      {!loading && (stackedSeries.length === 0 || months.length === 0) && (
        <div className="flex items-center justify-center h-32 text-sm text-slate-400">No data for current filter</div>
      )}
    </div>
  )
}