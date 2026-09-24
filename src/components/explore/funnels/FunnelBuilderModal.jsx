import { useState } from 'react'
import { EVENTS } from '../exploreData'
import FunnelViz from './FunnelViz'

function FunnelBuilderModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [steps, setSteps] = useState(['view_item_list'])
  const [timeWindow, setTimeWindow] = useState('7')

  // Live mock data: simulate drop-off
  const mockData = steps.map((_, i) => Math.round(100000 * Math.pow(0.72, i)))

  const addStep = (eventId) => {
    if (!steps.includes(eventId)) setSteps(s => [...s, eventId])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.18)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#F1F5F9' }}>
          <p className="text-base font-bold text-slate-900">Create Funnel</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Left: builder */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Funnel name</label>
              <input
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="e.g. Wishlist to Purchase"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Steps</label>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                    <span className="w-5 h-5 rounded-md text-[10px] font-bold text-white flex items-center justify-center shrink-0" style={{ background: '#6366F1' }}>{i + 1}</span>
                    <span className="text-xs font-mono flex-1 text-slate-800">{s}</span>
                    {steps.length > 1 && (
                      <button onClick={() => setSteps(ss => ss.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <select
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none"
                  style={{ borderColor: '#E2E8F0' }}
                  value=""
                  onChange={e => { if (e.target.value) addStep(e.target.value) }}
                >
                  <option value="">+ Add step from events…</option>
                  {EVENTS.filter(e => !steps.includes(e.id)).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Time window (days)</label>
              <select
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none"
                style={{ borderColor: '#E2E8F0' }}
                value={timeWindow}
                onChange={e => setTimeWindow(e.target.value)}
              >
                {['1', '3', '7', '14', '30'].map(d => <option key={d} value={d}>Within {d} day{d !== '1' ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          {/* Right: live preview */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Live preview</p>
            {steps.length < 2 ? (
              <p className="text-sm text-slate-400 mt-6 text-center">Add at least 2 steps to see the funnel</p>
            ) : (
              <FunnelViz steps={steps} data={mockData} />
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-xl border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Cancel</button>
          <button
            onClick={() => {
              if (!name.trim() || steps.length < 2) return
              onSave({ id: Date.now().toString(), name: name.trim(), steps, conversion: Math.round(mockData[mockData.length - 1] / mockData[0] * 1000) / 10, lastEdited: 'Just now' })
              onClose()
            }}
            className="px-5 py-2 text-sm font-bold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: '#6366F1' }}
          >Save Funnel</button>
        </div>
      </div>
    </div>
  )
}

export default FunnelBuilderModal
