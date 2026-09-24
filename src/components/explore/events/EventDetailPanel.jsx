import { useState, useEffect } from 'react'
import { PERSONAS } from '../../../data/personas'
import PersonaChip from '../../PersonaChip'
import { CATEGORY_META } from '../exploreData'
import { CategoryBadge, fmtVol } from '../exploreUtils'
import { useFilters } from '../../../context/FiltersContext'
import { fetchEventDetail } from '../../../services/eventsApi'

function EventDetailPanel({ event, onClose }) {
  const { period, customRange, platform, device } = useFilters()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEventDetail(event.name, { period, customRange, platform, device })
      .then((res) => { if (!cancelled) setDetail(res) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [event.name, period, customRange, platform, device])

  const max = Math.max(...event.spark, 1) // avoid divide-by-zero when spark is all zeros
  const W = 340, H = 80, PAD = 8

  const pts = event.spark.map((v, i) => {
    const x = PAD + (i / (event.spark.length - 1)) * (W - PAD * 2)
    const y = H - PAD - (v / max) * (H - PAD * 2)
    return `${x},${y}`
  })
  const area = `M ${pts[0]} L ${pts.join(' L ')} L ${PAD + (W - PAD * 2)},${H} L ${PAD},${H} Z`
  const line = `M ${pts[0]} L ${pts.join(' L ')}`

  const cat = CATEGORY_META[event.category] || CATEGORY_META.other

  const personaBreakdown = (detail?.personaBreakdown || []).map((row) => {
    const meta = PERSONAS.find((p) => p.id === row.id)
    return { ...row, ...meta }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div
        className="pointer-events-auto w-[400px] h-full bg-white border-l flex flex-col"
        style={{ borderColor: '#E2E8F0', boxShadow: '-4px 0 24px rgba(15,23,42,0.08)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <div>
            <p className="text-sm font-bold text-slate-900 font-mono">{event.name}</p>
            <div className="mt-1"><CategoryBadge cat={event.category} categoryMeta={CATEGORY_META} /></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Volume', value: fmtVol(event.volume) },
              { label: 'Platform', value: event.platform },
              { label: 'Status', value: event.status },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: '#F8FAFC' }}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: '#F8FAFC' }}>
            <p className="text-xs font-semibold text-slate-500 mb-3">Volume over time (7 days)</p>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
              <defs>
                <linearGradient id={`eg-${event.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cat.color} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#eg-${event.id})`} />
              <path d={line} fill="none" stroke={cat.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Breakdown by Persona</p>
            {loading && <p className="text-xs text-slate-400">Loading...</p>}
            {error && <p className="text-xs text-red-500">Unable to load breakdown.</p>}
            {!loading && !error && (
              <div className="space-y-2">
                {personaBreakdown.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <PersonaChip id={p.id} size="sm" />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.share}%`, background: p.color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-8 text-right">{p.share}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Properties</p>
            {loading && <p className="text-xs text-slate-400">Loading...</p>}
            {!loading && !error && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
                {(detail?.properties || []).length === 0 && (
                  <p className="text-xs text-slate-400 px-4 py-3">No properties recorded for this event.</p>
                )}
                {(detail?.properties || []).map((prop, i) => (
                  <div key={prop.key} className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}>
                    <span className="text-xs font-mono font-semibold text-slate-700">{prop.key}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: '#EEF2FF', color: '#4338CA' }}>{prop.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPanel