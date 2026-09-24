import { useState } from 'react'
import { PERSONAS } from '../../../data/personas'
import PersonaChip from '../../PersonaChip'
import MiniSparkline from '../../MiniSparkline'
import { EVENTS, SAVED_QUERIES } from '../exploreData'

function QueryBuilderTab() {
  const [selectedEvent, setSelectedEvent] = useState('purchase')
  const [groupBy, setGroupBy] = useState('Persona')
  const [timeRange, setTimeRange] = useState('Last 30 days')
  const [conditions, setConditions] = useState([{ id: 1, prop: 'value', op: '>', value: '100', logic: 'AND' }])
  const [viewMode, setViewMode] = useState('table')
  const [savedQueries, setSavedQueries] = useState(SAVED_QUERIES)
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const evt = EVENTS.find(e => e.id === selectedEvent)
  const condProps = evt?.properties.map(p => p.key) ?? []

  // Mock result data
  const resultRows = PERSONAS.map((p, i) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    count: [18420, 12650, 8340, 5210, 3890][i] ?? 1000,
    spark: [5, 6, 7, 6, 8, 9, 8, 10, 11, 10, 12, 13, 12, 14].map(v => v * ([1.8, 1.2, 0.8, 0.5, 0.4][i] ?? 0.3)),
  }))
  const maxCount = resultRows[0]?.count ?? 1

  return (
    <div className="flex-1 overflow-y-auto flex min-h-0">
      {/* Left: saved queries */}
      <div className="w-52 shrink-0 border-r bg-white p-4 space-y-1 overflow-y-auto" style={{ borderColor: '#F1F5F9' }}>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Saved Queries</p>
        {savedQueries.map(q => (
          <button
            key={q.id}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => { setSelectedEvent(q.event); setGroupBy(q.groupBy) }}
          >
            <p className="text-xs font-semibold text-slate-800 leading-snug">{q.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{q.event}</p>
          </button>
        ))}
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-2">Recent</p>
        <button className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <p className="text-xs font-semibold text-slate-700">Refund by currency</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">refund</p>
        </button>
      </div>

      {/* Main query area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Query sentence builder */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Query</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Show me</span>
            <select
              className="border rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-slate-900 focus:outline-none"
              style={{ borderColor: '#6366F1', background: '#EEF2FF', color: '#4338CA' }}
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
            >
              {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <span className="text-slate-500 font-medium">grouped by</span>
            <select
              className="border rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none"
              style={{ borderColor: '#E2E8F0' }}
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
            >
              {['Persona', 'Platform', 'Day', 'Week', 'Month'].map(g => <option key={g}>{g}</option>)}
            </select>
            <span className="text-slate-500 font-medium">over</span>
            <select
              className="border rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none"
              style={{ borderColor: '#E2E8F0' }}
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
            >
              {['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Conditions */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400">WHERE</p>
            {conditions.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                {i > 0 && (
                  <button
                    className="text-[11px] font-bold px-2 py-1 rounded-md"
                    style={{ background: '#F1F5F9', color: '#475569' }}
                    onClick={() => setConditions(cs => cs.map((x, j) => j === i ? { ...x, logic: x.logic === 'AND' ? 'OR' : 'AND' } : x))}
                  >{c.logic}</button>
                )}
                <select
                  className="border rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono focus:outline-none"
                  style={{ borderColor: '#E2E8F0' }}
                  value={c.prop}
                  onChange={e => setConditions(cs => cs.map((x, j) => j === i ? { ...x, prop: e.target.value } : x))}
                >
                  {condProps.map(p => <option key={p}>{p}</option>)}
                  {condProps.length === 0 && <option>property</option>}
                </select>
                <select
                  className="border rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  style={{ borderColor: '#E2E8F0' }}
                  value={c.op}
                  onChange={e => setConditions(cs => cs.map((x, j) => j === i ? { ...x, op: e.target.value } : x))}
                >
                  {['=', '≠', '>', '<', '≥', '≤', 'contains', 'is set'].map(o => <option key={o}>{o}</option>)}
                </select>
                <input
                  className="border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none w-24"
                  style={{ borderColor: '#E2E8F0' }}
                  value={c.value}
                  onChange={e => setConditions(cs => cs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                />
                {conditions.length > 1 && (
                  <button onClick={() => setConditions(cs => cs.filter(x => x.id !== c.id))} className="text-slate-400 hover:text-red-500">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setConditions(cs => [...cs, { id: Date.now(), prop: condProps[0] ?? 'value', op: '=', value: '', logic: 'AND' }])}
              className="text-xs font-semibold mt-1"
              style={{ color: '#6366F1' }}
            >+ Add condition</button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-sm font-bold text-slate-900">Results <span className="text-slate-400 font-normal text-xs ml-1">{groupBy} breakdown · {timeRange}</span></p>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                {(['table', 'chart']).map(m => (
                  <button key={m} onClick={() => setViewMode(m)} className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
                    style={{ background: viewMode === m ? '#6366F1' : '#fff', color: viewMode === m ? '#fff' : '#475569' }}>
                    {m}
                  </button>
                ))}
              </div>
              {showSave ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                    placeholder="Report name…"
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && saveName.trim()) {
                        setSavedQueries(qs => [...qs, { id: Date.now().toString(), label: saveName.trim(), event: selectedEvent, groupBy }])
                        setSaveName(''); setShowSave(false)
                      }
                    }}
                  />
                  <button onClick={() => setShowSave(false)} className="text-xs text-slate-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowSave(true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Save as report</button>
              )}
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Export CSV</button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <table className="w-full">
              <thead style={{ background: '#F8FAFC' }}>
                <tr>
                  <th className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">{groupBy.toUpperCase()}</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">COUNT</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">% TOTAL</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">TREND</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((row, i) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #F8FAFC', background: i % 2 === 0 ? '#fff' : '#FAFBFF' }}>
                    <td className="px-5 py-3"><PersonaChip id={row.id} size="md" /></td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">{row.count.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-slate-500">{Math.round(row.count / maxCount * 100)}%</td>
                    <td className="px-5 py-3 text-right"><MiniSparkline data={row.spark} color={row.color} width={48} height={18} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-5 space-y-3">
              {resultRows.map(row => (
                <div key={row.id} className="flex items-center gap-3">
                  <PersonaChip id={row.id} size="sm" />
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.round(row.count / maxCount * 100)}%`, background: row.color }}
                    >
                      <span className="text-[10px] font-bold text-white">{row.count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueryBuilderTab
