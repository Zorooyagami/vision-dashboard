import { useState } from 'react'
import { VisionMark } from '../components/VisionLogo'
import { PERSONAS } from '../data/personas'
import PersonaChip from '../components/PersonaChip'
import MiniSparkline from '../components/MiniSparkline'
import LineChart from '../components/LineChart'

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']


function PersonaDetail({ persona, onAdjustThresholds }) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: persona.lightBg }}>
          {persona.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">{persona.name}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: persona.lightBg, color: persona.textColor }}>
              {(persona.count / 1000).toFixed(1)}K users
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded ml-auto" style={{ background: '#ECFDF5', color: '#047857' }}>
              {persona.trendPct}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{persona.desc}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 tracking-widest mb-1.5">CLASSIFICATION RULE</p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: persona.lightBg, color: persona.textColor }}
        >
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {persona.criteria}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {([
          ['Revenue', `$${(persona.revenue / 1000000).toFixed(2)}M`],
          ['Avg Order Value', `$${persona.aov}`],
          ['Conv. Rate', persona.convRate],
          ['Retention (30d)', persona.retention],
        ]).map(([label, value]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 border" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-semibold text-slate-400 tracking-widest mb-2">PLATFORM SPLIT</p>
        <div className="space-y-1.5">
          {([['Web', persona.webPct], ['App', persona.appPct]]).map(([label, pct]) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-slate-600 font-medium">{label}</span>
                <span className="font-bold" style={{ color: persona.color }}>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: persona.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity trend sparkline */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 tracking-widest mb-2">6-MONTH ACTIVITY</p>
        <MiniSparkline data={persona.trend.slice(5, 11)} color={persona.color} width={300} height={40} />
        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 px-0.5">
          {MONTHS.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Criteria info + settings link */}
      <div className="rounded-xl p-3 border" style={{ background: '#FAFBFF', borderColor: '#E2E8F0' }}>
        <div className="flex items-start gap-2">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth={2} className="mt-0.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-slate-700">How this Persona is classified</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Vision applies this rule automatically on every session. Classification runs in real-time using login state and order history.
            </p>
            <button
              onClick={onAdjustThresholds}
              className="text-[10px] font-bold mt-1.5 flex items-center gap-1 hover:underline transition-all"
              style={{ color: '#6366F1' }}
            >
              Adjust thresholds in Settings
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PersonasPage({ onNavigateSettings }) {
  const [selected, setSelected] = useState('loyal')
  const [compareIds, setCompareIds] = useState([])
  const [mode, setMode] = useState('explore')

  const toggleCompare = (id) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const selectedPersona = PERSONAS.find(p => p.id === selected)
  const comparePersonas = PERSONAS.filter(p => compareIds.includes(p.id))

  const compareSeries = comparePersonas.map(p => ({
    key: p.id,
    name: p.name,
    color: p.color,
    data: p.trend.slice(5, 11),
  }))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Personas Explorer</h2>
          <p className="text-xs text-slate-400 mt-0.5">5 system-defined classification rules · auto-assigned in real-time</p>
        </div>
        <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: '#F1F5F9' }}>
          {(['explore', 'compare']).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
              style={mode === m ? { background: '#fff', color: '#6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#64748B' }}
            >
              {m === 'explore' ? 'Explore' : 'Compare'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Persona list */}
        <div className="space-y-2">
          {PERSONAS.map(persona => {
            const isActive = mode === 'explore' ? selected === persona.id : compareIds.includes(persona.id)
            return (
              <button
                key={persona.id}
                onClick={() => mode === 'explore' ? setSelected(persona.id) : toggleCompare(persona.id)}
                className="w-full text-left bg-white rounded-2xl p-3.5 transition-all hover:shadow-md"
                style={{
                  borderColor: isActive ? persona.color : '#E2E8F0',
                  boxShadow: isActive ? `0 0 0 1px ${persona.color}` : 'none',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: persona.lightBg }}>
                    {persona.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{persona.name}</p>
                    <p className="text-[10px] text-slate-400">{(persona.count / 1000).toFixed(1)}K users · {persona.pct}%</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#ECFDF5', color: '#047857' }}>{persona.trendPct}</span>
                    <MiniSparkline data={persona.trend.slice(-6)} color={persona.color} width={44} height={16} />
                  </div>
                </div>
                {mode === 'compare' && compareIds.includes(persona.id) && (
                  <div className="mt-2 text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block" style={{ background: persona.lightBg, color: persona.textColor }}>
                    ✓ In comparison
                  </div>
                )}
              </button>
            )
          })}

          {mode === 'compare' && (
            <div className="text-[10px] text-slate-400 text-center py-1">
              {compareIds.length === 0 ? 'Select 2–3 personas to compare' : `${compareIds.length}/3 selected`}
            </div>
          )}
        </div>

        {/* Detail / Compare */}
        <div className="col-span-2">
          {mode === 'explore' && selectedPersona && (
            <PersonaDetail persona={selectedPersona} onAdjustThresholds={onNavigateSettings} />
          )}

          {mode === 'compare' && (
            <div className="space-y-4">
              {compareIds.length === 0 ? (
                <div className="bg-white rounded-xl border p-10 text-center" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex justify-center mb-3">
                    <VisionMark size={40} theme="muted" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Select 2–3 Personas to compare</p>
                  <p className="text-xs text-slate-400 mt-1">Click any personas in the list to add them to the comparison</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${comparePersonas.length}, 1fr)` }}>
                    {comparePersonas.map(p => (
                      <div key={p.id} className="bg-white rounded-xl border p-4" style={{ borderColor: p.color, boxShadow: `0 0 0 1px ${p.color}22` }}>
                        <PersonaChip id={p.id} size="md" />
                        <div className="mt-3 space-y-2">
                          {([
                            ['Revenue', `$${(p.revenue / 1000000).toFixed(2)}M`],
                            ['AOV', `$${p.aov}`],
                            ['Conv. Rate', p.convRate],
                            ['Retention', p.retention],
                            ['Users', `${(p.count / 1000).toFixed(1)}K`],
                          ]).map(([l, v]) => (
                            <div key={l} className="flex justify-between text-xs border-b pb-1.5" style={{ borderColor: '#F1F5F9' }}>
                              <span className="text-slate-500">{l}</span>
                              <span className="font-bold text-slate-900">{v}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="mt-3 w-full text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors"
                        >
                          Remove from comparison
                        </button>
                      </div>
                    ))}
                  </div>

                  {comparePersonas.length >= 2 && (
                    <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E2E8F0' }}>
                      <p className="text-sm font-bold text-slate-900 mb-1">Activity Trend Comparison</p>
                      <p className="text-xs text-slate-400 mb-4">6-month rolling user activity</p>
                      <LineChart labels={MONTHS} series={compareSeries} height={180} />
                      <div className="flex gap-4 mt-3 flex-wrap">
                        {comparePersonas.map(p => (
                          <div key={p.id} className="flex items-center gap-1.5">
                            <span className="w-4 h-0.5 rounded inline-block" style={{ background: p.color }} />
                            <span className="text-xs text-slate-500">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
