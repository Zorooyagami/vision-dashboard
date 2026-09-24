import { useState } from 'react'
import { CATEGORY_META } from '../exploreData'

function AddEventModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('browsing')
  const [plat, setPlat] = useState('Both')
  const [props, setProps] = useState([{ key: '', type: 'string' }])

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
      description: desc.trim(),
      category: cat,
      platform: plat,
      volume: Math.floor(Math.random() * 50000) + 1000,
      lastSeen: 'Just now',
      status: 'Active',
      spark: Array.from({ length: 14 }, () => Math.floor(Math.random() * 20) + 5),
      properties: props.filter(p => p.key.trim()),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.18)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#F1F5F9' }}>
          <p className="text-base font-bold text-slate-900">Add Event</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Event name *</label>
            <input
              className="w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2"
              style={{ borderColor: '#E2E8F0' }}
              placeholder="e.g. add_to_cart"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Description</label>
            <textarea
              className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: '#E2E8F0' }}
              rows={2}
              placeholder="What does this event track?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Category</label>
              <select
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                style={{ borderColor: '#E2E8F0' }}
                value={cat}
                onChange={e => setCat(e.target.value)}
              >
                {(Object.keys(CATEGORY_META)).map(c => (
                  <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Platform(s)</label>
              <select
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                style={{ borderColor: '#E2E8F0' }}
                value={plat}
                onChange={e => setPlat(e.target.value)}
              >
                {['Both', 'Web', 'App'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500">Properties</label>
              <button
                onClick={() => setProps(p => [...p, { key: '', type: 'string' }])}
                className="text-xs font-semibold"
                style={{ color: '#6366F1' }}
              >+ Add property</button>
            </div>
            <div className="space-y-2">
              {props.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                    placeholder="property_name"
                    value={p.key}
                    onChange={e => setProps(ps => ps.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                  />
                  <select
                    className="border rounded-lg px-2 py-2 text-xs text-slate-700 focus:outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                    value={p.type}
                    onChange={e => setProps(ps => ps.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}
                  >
                    {['string', 'number', 'boolean', 'array'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {props.length > 1 && (
                    <button onClick={() => setProps(ps => ps.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 px-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-xl border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-bold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: '#6366F1' }}
            disabled={!name.trim()}
          >Add Event</button>
        </div>
      </div>
    </div>
  )
}

export default AddEventModal
