import { useState } from 'react'
import { SAVED_FUNNELS } from '../exploreData'
import FunnelViz from './FunnelViz'
import FunnelBuilderModal from './FunnelBuilderModal'

function FunnelsTab() {
  const [funnels, setFunnels] = useState(SAVED_FUNNELS)
  const [showBuilder, setShowBuilder] = useState(false)
  const [openFunnel, setOpenFunnel] = useState(null)

  const FUNNEL_DATA = {
    f1: [276800, 98400, 184200, 64800],
    f2: [96800, 84300, 76400, 64800],
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Saved Funnels</h3>
          <p className="text-xs text-slate-400 mt-0.5">Custom funnels built from your tracked events</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ background: '#6366F1' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create funnel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {funnels.map(f => (
          <div
            key={f.id}
            className="bg-white rounded-2xl p-5 cursor-pointer hover:ring-2 transition-all"
            style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}
            onClick={() => setOpenFunnel(f)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{f.steps.length} steps · edited {f.lastEdited}</p>
              </div>
              <span className="text-lg font-black" style={{ color: '#6366F1' }}>{f.conversion}%</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {f.steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg" style={{ background: '#EEF2FF', color: '#4338CA' }}>{s}</span>
                  {i < f.steps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel detail */}
      {openFunnel && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-slate-900">{openFunnel.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">Overall conversion: <strong style={{ color: '#6366F1' }}>{openFunnel.conversion}%</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Duplicate</button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Edit</button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-red-50 transition-colors" style={{ borderColor: '#FCA5A5', color: '#B91C1C' }} onClick={() => { setFunnels(fs => fs.filter(f => f.id !== openFunnel.id)); setOpenFunnel(null) }}>Delete</button>
              <button onClick={() => setOpenFunnel(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 ml-2 transition-colors">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <FunnelViz
            steps={openFunnel.steps}
            data={FUNNEL_DATA[openFunnel.id] ?? openFunnel.steps.map((_, i) => Math.round(100000 * Math.pow(0.72, i)))}
          />
        </div>
      )}

      {showBuilder && (
        <FunnelBuilderModal
          onClose={() => setShowBuilder(false)}
          onSave={f => setFunnels(fs => [...fs, f])}
        />
      )}
    </div>
  )
}

export default FunnelsTab
