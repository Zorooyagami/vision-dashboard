import { useState } from 'react'
import MiniSparkline from '../MiniSparkline'
import { Card, ViewAllBtn } from './shared'
import { KPI_OPTIONS, DEFAULT_PINNED } from './homeConstants'

/* ---------- Picker dropdown ---------- */
function KpiPicker({
  available,
  onPick,
  onClose,
}) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? available.filter(k => k.label.toLowerCase().includes(search.toLowerCase()))
    : available

  return (
    <div className="border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFF' }} onClick={e => e.stopPropagation()}>
      <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#F1F5F9' }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          autoFocus
          type="text"
          placeholder="Search metrics…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
        />
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-400">
            {available.length === 0 ? 'All metrics pinned' : 'No matches'}
          </p>
        ) : (
          filtered.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-white transition-colors text-left"
              style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}
            >
              <span className="text-sm text-slate-700">{opt.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-900">{opt.value}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: opt.pos ? '#ECFDF5' : '#FEF2F2', color: opt.pos ? '#047857' : '#B91C1C' }}
                >
                  {opt.pos ? '↑' : '↓'} {opt.change}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

/* ---------- Pinned row ---------- */
function PinnedKpiRow({
  kpi,
  index,
  total,
  onMove,
  onRemove,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors relative"
      style={{ borderTop: index > 0 ? '1px solid #F8FAFC' : 'none' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(kpi.id, 'up')}
          disabled={index === 0}
          className="text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => onMove(kpi.id, 'down')}
          disabled={index === total - 1}
          className="text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <p className="flex-1 text-sm text-slate-700 font-medium truncate">{kpi.label}</p>

      <MiniSparkline data={[...kpi.spark]} color={kpi.pos ? '#10B981' : '#EF4444'} width={48} height={20} />

      <div className="text-right shrink-0 min-w-[70px]">
        <p className="text-sm font-black text-slate-900">{kpi.value}</p>
        <span className="text-[10px] font-bold" style={{ color: kpi.pos ? '#047857' : '#B91C1C' }}>
          {kpi.pos ? '↑' : '↓'} {kpi.change}
        </span>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(v => !v)
          }}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-7 z-20 rounded-xl shadow-lg border py-1 min-w-[110px]"
            style={{ background: '#fff', borderColor: '#E2E8F0' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onRemove(kpi.id)
                setMenuOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Main widget ---------- */
export default function KpiWatchlist({ onViewAll }) {
  const [pinnedIds, setPinnedIds] = useState(DEFAULT_PINNED)
  const [showPicker, setShowPicker] = useState(false)

  const moveKpi = (id, dir) => {
    setPinnedIds(prev => {
      const idx = prev.indexOf(id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const removeKpi = (id) => setPinnedIds(prev => prev.filter(p => p !== id))

  const addKpi = (id) => {
    setPinnedIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    setShowPicker(false)
  }

  const pinnedKpis = pinnedIds
    .map(id => KPI_OPTIONS.find(k => k.id === id))
    .filter((k) => Boolean(k))

  const available = KPI_OPTIONS.filter(k => !pinnedIds.includes(k.id))

  return (
    <Card className="col-span-2 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
        <div>
          <p className="text-sm font-bold text-slate-900">KPIs to Track</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Your personal metric watchlist</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => {
              e.stopPropagation()
              setShowPicker(v => !v)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors hover:opacity-90"
            style={{ background: '#EEF2FF', color: '#4338CA' }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add KPI
          </button>
          <ViewAllBtn onClick={onViewAll} />
        </div>
      </div>

      {showPicker && (
        <KpiPicker available={available} onPick={addKpi} onClose={() => setShowPicker(false)} />
      )}

      {pinnedKpis.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-slate-400">No KPIs pinned yet</p>
          <p className="text-xs text-slate-300 mt-1">Click "+ Add KPI" to pin metrics you care about</p>
        </div>
      ) : (
        pinnedKpis.map((kpi, i) => (
          <PinnedKpiRow
            key={kpi.id}
            kpi={kpi}
            index={i}
            total={pinnedKpis.length}
            onMove={moveKpi}
            onRemove={removeKpi}
          />
        ))
      )}
    </Card>
  )
}