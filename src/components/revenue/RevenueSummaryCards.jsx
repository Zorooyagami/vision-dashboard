// src/components/revenue/RevenueSummaryCards.jsx
import PersonaChip from '../PersonaChip'
import { fmtRev } from './revenueUtils'

export default function RevenueSummaryCards({ totalRev, totalOrders, avgAov, topPersona, selectedPersonas }) {
  const topPersonaObj = topPersona ? { id: topPersona.id } : null

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Revenue</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{fmtRev(totalRev)}</p>
      </div>
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {selectedPersonas.length > 0 ? 'Top Selected' : 'Top by Revenue'}
        </p>
        <div className="mt-1.5">
          {topPersonaObj ? <PersonaChip id={topPersonaObj.id} size="lg" /> : <span className="text-sm text-slate-400">—</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{topPersona ? `${fmtRev(topPersona.revenue)} · $${topPersona.aov} AOV` : '—'}</p>
      </div>
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Orders</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{totalOrders.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-1">Avg AOV: ${avgAov}</p>
      </div>
    </div>
  )
}