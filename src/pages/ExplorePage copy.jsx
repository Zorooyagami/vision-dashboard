import { useState } from 'react'
import { PERSONAS } from '../data/personas'
import PersonaChip from '../components/PersonaChip'
import MiniSparkline from '../components/MiniSparkline'


// ─── shared data ────────────────────────────────────────────────────────────

const CATEGORY_META = {
  browsing: { label: 'Browsing & Interaction', color: '#0D9488', bg: '#F0FDFA' },
  cart:     { label: 'Shopping Cart',          color: '#D97706', bg: '#FFFBEB' },
  checkout: { label: 'Checkout & Purchase',    color: '#4338CA', bg: '#EEF2FF' },
}


const EVENTS = [
  {
    id: 'view_item_list', name: 'view_item_list', description: 'User views a collection, category page, or list of products',
    category: 'browsing', platform: 'Both', volume: 482300, lastSeen: '2 min ago', status: 'Active',
    spark: [38, 42, 44, 41, 48, 52, 49, 54, 58, 62, 60, 65, 68, 72],
    properties: [{ key: 'item_list_id', type: 'string' }, { key: 'item_list_name', type: 'string' }, { key: 'items', type: 'array' }],
  },
  {
    id: 'select_item', name: 'select_item', description: 'User clicks on a specific product from an item list',
    category: 'browsing', platform: 'Both', volume: 318400, lastSeen: '3 min ago', status: 'Active',
    spark: [28, 31, 34, 30, 36, 38, 35, 40, 42, 44, 46, 48, 50, 52],
    properties: [{ key: 'item_list_id', type: 'string' }, { key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }],
  },
  {
    id: 'view_item', name: 'view_item', description: 'User views a detailed product description page',
    category: 'browsing', platform: 'Both', volume: 276800, lastSeen: '1 min ago', status: 'Active',
    spark: [22, 24, 26, 28, 25, 30, 32, 29, 34, 36, 38, 40, 42, 44],
    properties: [{ key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }, { key: 'price', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'add_to_wishlist', name: 'add_to_wishlist', description: 'User saves an item to their favorites list',
    category: 'browsing', platform: 'Both', volume: 98400, lastSeen: '8 min ago', status: 'Active',
    spark: [8, 9, 10, 9, 11, 12, 10, 13, 14, 13, 15, 16, 15, 17],
    properties: [{ key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }, { key: 'price', type: 'number' }],
  },
  {
    id: 'add_to_cart', name: 'add_to_cart', description: 'User adds a product to their shopping cart',
    category: 'cart', platform: 'Both', volume: 184200, lastSeen: '1 min ago', status: 'Active',
    spark: [14, 16, 18, 17, 20, 22, 21, 24, 26, 25, 28, 30, 29, 32],
    properties: [{ key: 'product_id', type: 'string' }, { key: 'price', type: 'number' }, { key: 'quantity', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'remove_from_cart', name: 'remove_from_cart', description: 'User removes a specific product from their cart',
    category: 'cart', platform: 'Both', volume: 42600, lastSeen: '14 min ago', status: 'Active',
    spark: [4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11],
    properties: [{ key: 'product_id', type: 'string' }, { key: 'price', type: 'number' }, { key: 'quantity', type: 'number' }],
  },
  {
    id: 'view_cart', name: 'view_cart', description: 'User navigates to and opens their shopping cart page',
    category: 'cart', platform: 'Web', volume: 128700, lastSeen: '4 min ago', status: 'Active',
    spark: [10, 11, 12, 11, 13, 14, 13, 15, 16, 15, 17, 18, 17, 19],
    properties: [{ key: 'cart_id', type: 'string' }, { key: 'cart_total', type: 'number' }, { key: 'item_count', type: 'number' }],
  },
  {
    id: 'begin_checkout', name: 'begin_checkout', description: 'User clicks to initiate the checkout flow',
    category: 'checkout', platform: 'Both', volume: 96800, lastSeen: '2 min ago', status: 'Active',
    spark: [8, 9, 10, 9, 11, 12, 10, 13, 14, 13, 15, 16, 15, 17],
    properties: [{ key: 'cart_total', type: 'number' }, { key: 'item_count', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'add_shipping_info', name: 'add_shipping_info', description: 'User submits their shipping address or selects a delivery tier',
    category: 'checkout', platform: 'Both', volume: 84300, lastSeen: '3 min ago', status: 'Active',
    spark: [7, 8, 8, 9, 10, 9, 11, 12, 11, 13, 14, 13, 15, 16],
    properties: [{ key: 'shipping_tier', type: 'string' }, { key: 'country', type: 'string' }],
  },
  {
    id: 'add_payment_info', name: 'add_payment_info', description: 'User enters credit card, PayPal, or other billing information',
    category: 'checkout', platform: 'Both', volume: 76400, lastSeen: '4 min ago', status: 'Active',
    spark: [6, 7, 7, 8, 9, 8, 10, 11, 10, 12, 13, 12, 14, 15],
    properties: [{ key: 'payment_type', type: 'string' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'purchase', name: 'purchase', description: 'User completes the transaction; triggers the final confirmation page',
    category: 'checkout', platform: 'Both', volume: 64800, lastSeen: '1 min ago', status: 'Active',
    spark: [5, 6, 6, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 14],
    properties: [{ key: 'order_id', type: 'string' }, { key: 'value', type: 'number' }, { key: 'currency', type: 'string' }, { key: 'items', type: 'array' }],
  },
  {
    id: 'refund', name: 'refund', description: 'A full or partial monetary refund is processed for an order',
    category: 'checkout', platform: 'Both', volume: 8200, lastSeen: '22 min ago', status: 'Active',
    spark: [1, 1, 2, 1, 2, 2, 1, 2, 3, 2, 3, 3, 2, 3],
    properties: [{ key: 'order_id', type: 'string' }, { key: 'refund_amount', type: 'number' }, { key: 'currency', type: 'string' }],
  },
]

// ─── shared UI ──────────────────────────────────────────────────────────────

function CategoryBadge({ cat }) {
  const m = CATEGORY_META[cat]
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

function fmtVol(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// ─── EVENTS PAGE ─────────────────────────────────────────────────────────────

function EventDetailPanel({ event, onClose }) {
  const LABELS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const max = Math.max(...event.spark)
  const W = 340, H = 80, PAD = 8

  const pts = event.spark.map((v, i) => {
    const x = PAD + (i / (event.spark.length - 1)) * (W - PAD * 2)
    const y = H - PAD - (v / max) * (H - PAD * 2)
    return `${x},${y}`
  })
  const area = `M ${pts[0]} L ${pts.join(' L ')} L ${PAD + (W - PAD * 2)},${H} L ${PAD},${H} Z`
  const line = `M ${pts[0]} L ${pts.join(' L ')}`

  const cat = CATEGORY_META[event.category]
  const personaBreakdown = PERSONAS.map((p, i) => ({
    ...p,
    share: [32, 24, 18, 14, 12][i] ?? 8,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div
        className="pointer-events-auto w-[400px] h-full bg-white border-l flex flex-col"
        style={{ borderColor: '#E2E8F0', boxShadow: '-4px 0 24px rgba(15,23,42,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <div>
            <p className="text-sm font-bold text-slate-900 font-mono">{event.name}</p>
            <div className="mt-1"><CategoryBadge cat={event.category} /></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stats row */}
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

          {/* Trend */}
          <div className="rounded-xl p-4" style={{ background: '#F8FAFC' }}>
            <p className="text-xs font-semibold text-slate-500 mb-3">Volume over time (14 weeks)</p>
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

          {/* Persona breakdown */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Breakdown by Persona</p>
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
          </div>

          {/* Properties */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Properties</p>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
              {event.properties.map((prop, i) => (
                <div key={prop.key} className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}>
                  <span className="text-xs font-mono font-semibold text-slate-700">{prop.key}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: '#EEF2FF', color: '#4338CA' }}>{prop.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

function EventsTab() {
  const [events, setEvents] = useState(EVENTS)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  const filtered = events.filter(e => {
    const matchSearch = e.name.includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || e.category === catFilter
    return matchSearch && matchCat
  })

  const grouped = (Object.keys(CATEGORY_META)).map(cat => ({
    cat,
    items: filtered.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: '#E2E8F0' }}
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {[['all', 'All'], ['browsing', 'Browsing'], ['cart', 'Cart'], ['checkout', 'Checkout']].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setCatFilter(val)}
              className="px-3.5 py-2 text-xs font-semibold transition-colors"
              style={{
                background: catFilter === val ? '#6366F1' : '#fff',
                color: catFilter === val ? '#fff' : '#475569',
              }}
            >{lbl}</button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ background: '#6366F1' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add event
        </button>
      </div>

      {/* Event table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <table className="w-full">
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              {['Event', 'Category', 'Platform', 'Volume', 'Last seen', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-4 py-3 tracking-wide">{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ cat, items }) => (
              items.map((event, i) => (
                <tr
                  key={event.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  style={{ borderTop: i === 0 && cat !== 'browsing' ? '2px solid #F1F5F9' : '1px solid #F8FAFC' }}
                  onClick={() => { setSelectedEvent(event); setMenuOpen(null) }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-slate-800">{event.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[240px] truncate">{event.description}</p>
                  </td>
                  <td className="px-4 py-3"><CategoryBadge cat={event.category} /></td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500">{event.platform}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{fmtVol(event.volume)}</span>
                      <MiniSparkline data={event.spark} color={CATEGORY_META[event.category].color} width={40} height={16} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{event.lastSeen}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: event.status === 'Active' ? '#ECFDF5' : '#F8FAFC', color: event.status === 'Active' ? '#047857' : '#94A3B8' }}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                      onClick={() => setMenuOpen(menuOpen === event.id ? null : event.id)}
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                    </button>
                    {menuOpen === event.id && (
                      <div className="absolute right-4 top-10 bg-white rounded-xl border z-10 overflow-hidden" style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 16px rgba(15,23,42,0.12)', minWidth: 120 }}>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                        <button
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                          style={{ color: '#B91C1C' }}
                          onClick={() => { setEvents(evs => evs.map(e => e.id === event.id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e)); setMenuOpen(null) }}
                        >{event.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onAdd={e => setEvents(evs => [...evs, e])} />}
    </div>
  )
}

// ─── FUNNELS PAGE ─────────────────────────────────────────────────────────────


const SAVED_FUNNELS = [
  { id: 'f1', name: 'Wishlist to Purchase', steps: ['view_item', 'add_to_wishlist', 'add_to_cart', 'purchase'], conversion: 14.2, lastEdited: '2 days ago' },
  { id: 'f2', name: 'Checkout Drop-off', steps: ['begin_checkout', 'add_shipping_info', 'add_payment_info', 'purchase'], conversion: 67.8, lastEdited: '5 days ago' },
]

function FunnelViz({ steps, data }) {
  const max = data[0] || 1
  return (
    <div className="space-y-2 py-2">
      {steps.map((step, i) => {
        const pct = Math.round((data[i] / max) * 100)
        const drop = i > 0 ? Math.round(((data[i - 1] - data[i]) / data[i - 1]) * 100) : 0
        return (
          <div key={step}>
            {i > 0 && (
              <div className="flex items-center gap-2 my-1 px-2">
                <div className="w-px h-4 self-stretch" style={{ background: '#E2E8F0', marginLeft: 16 }} />
                <span className="text-[11px] text-slate-400 font-medium">{drop}% drop-off</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#6366F1' }}>{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold text-slate-700">{step}</span>
                  <span className="text-xs font-bold text-slate-900">{fmtVol(data[i])} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#6366F1', opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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

// ─── QUERY BUILDER PAGE ───────────────────────────────────────────────────────



const SAVED_QUERIES = [
  { id: 'q1', label: 'App purchases by persona', event: 'purchase', groupBy: 'Persona' },
  { id: 'q2', label: 'High-value cart adds', event: 'add_to_cart', groupBy: 'Platform' },
]

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

// ─── JOURNEYS PAGE ────────────────────────────────────────────────────────────

function JourneysTab({ selectedPersonas }) {
  const [startEvent, setStartEvent] = useState('view_item_list')
  const [direction, setDirection] = useState('forward')
  const [personaFilter, setPersonaFilter] = useState('all')
  const [hoveredPath, setHoveredPath] = useState(null)

  // Journey flow data: each node is positioned in a column
  // Format: { from, to, pct, users }
  const FLOW_FORWARD = [
    { from: 'view_item_list', to: 'view_item',       pct: 99, users: 157600 },
    { from: 'view_item_list', to: 'select_item',     pct: 26, users: 71900 },
    { from: 'view_item_list', to: 'Exit',             pct: 17, users: 47000 },
    { from: 'view_item',      to: 'add_to_cart',     pct: 44, users: 69300 },
    { from: 'view_item',      to: 'add_to_wishlist', pct: 28, users: 44100 },
    { from: 'view_item',      to: 'Exit',             pct: 28, users: 44100 },
    { from: 'add_to_cart',    to: 'begin_checkout',  pct: 52, users: 36000 },
    { from: 'add_to_cart',    to: 'view_cart',       pct: 30, users: 20800 },
    { from: 'add_to_cart',    to: 'Exit',             pct: 18, users: 12500 },
    { from: 'begin_checkout', to: 'purchase',        pct: 67, users: 24100 },
    { from: 'begin_checkout', to: 'Exit',             pct: 33, users: 11900 },
    { from: 'add_to_wishlist', to: 'add_to_cart',   pct: 61, users: 26900 },
    { from: 'add_to_wishlist', to: 'Exit',           pct: 39, users: 17200 },
  ]

  const FLOW_BACKWARD = [
    { from: 'add_payment_info', to: 'purchase',      pct: 85, users: 64900 },
    { from: 'add_shipping_info', to: 'purchase',     pct: 62, users: 47400 },
    { from: 'begin_checkout',    to: 'purchase',     pct: 52, users: 39700 },
    { from: 'add_to_cart',       to: 'purchase',     pct: 35, users: 26700 },
    { from: 'view_item',         to: 'purchase',     pct: 23, users: 17600 },
  ]

  const flows = direction === 'forward' ? FLOW_FORWARD : FLOW_BACKWARD

  // Columns: determine unique steps per column
  const columns = direction === 'forward'
    ? [
      ['view_item_list'],
      ['view_item', 'select_item', 'Exit'],
      ['add_to_cart', 'add_to_wishlist', 'Exit'],
      ['begin_checkout', 'view_cart', 'add_to_wishlist', 'Exit'],
      ['purchase', 'Exit'],
    ]
    : [
      ['add_payment_info', 'add_shipping_info', 'begin_checkout', 'add_to_cart', 'view_item'],
      ['purchase'],
    ]

  const nodeColor = (name) =>
    name === 'Exit' ? '#94A3B8' :
    name === 'purchase' ? '#6366F1' :
    name.includes('cart') ? '#D97706' :
    name.includes('checkout') || name.includes('payment') || name.includes('shipping') ? '#4338CA' :
    '#0D9488'

  const COL_W = 130, COL_H = 300, NODE_H = 32, NODE_MARGIN = 12
  const SVG_W = columns.length * (COL_W + 40)

  // Calculate node y positions per column
  const nodePositions = {}
  columns.forEach((col, ci) => {
    const totalH = col.length * NODE_H + (col.length - 1) * NODE_MARGIN
    const startY = (COL_H - totalH) / 2
    col.forEach((name, ni) => {
      nodePositions[`${ci}:${name}`] = { col: ci, y: startY + ni * (NODE_H + NODE_MARGIN) }
    })
  })

  // Find a node position; nodes can appear in different columns
  const findNode = (name, preferCol) => {
    for (let ci = 0; ci < columns.length; ci++) {
      if (preferCol !== undefined && ci !== preferCol) continue
      const key = `${ci}:${name}`
      if (nodePositions[key]) {
        return { x: ci * (COL_W + 40) + COL_W / 2, y: nodePositions[key].y + NODE_H / 2 }
      }
    }
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {(['forward', 'backward']).map(d => (
            <button key={d} onClick={() => setDirection(d)} className="px-4 py-2 text-xs font-semibold capitalize transition-colors"
              style={{ background: direction === d ? '#6366F1' : '#fff', color: direction === d ? '#fff' : '#475569' }}>
              {d === 'forward' ? 'Forward from →' : '← Backward to'}
            </button>
          ))}
        </div>
        <select
          className="border rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none"
          style={{ borderColor: '#E2E8F0' }}
          value={startEvent}
          onChange={e => setStartEvent(e.target.value)}
        >
          {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <button onClick={() => setPersonaFilter('all')} className="px-3 py-2 text-xs font-semibold transition-colors"
            style={{ background: personaFilter === 'all' ? '#6366F1' : '#fff', color: personaFilter === 'all' ? '#fff' : '#475569' }}>All</button>
          {PERSONAS.map(p => (
            <button key={p.id} onClick={() => setPersonaFilter(p.id)} className="px-3 py-2 text-xs font-semibold transition-colors"
              style={{ background: personaFilter === p.id ? p.color : '#fff', color: personaFilter === p.id ? '#fff' : '#475569' }}>
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <button className="ml-auto px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Save journey view</button>
      </div>

      {/* Sankey-style flow visualization */}
      <div className="bg-white rounded-2xl p-6 overflow-x-auto" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-900">
            {direction === 'forward' ? `Paths from ${startEvent}` : `Paths before purchase`}
          </p>
          <p className="text-xs text-slate-400">Hover a path to see detail</p>
        </div>

        <div className="relative overflow-x-auto">
          <svg width={SVG_W} height={COL_H + 60} style={{ minWidth: SVG_W }}>
            {/* Draw edges */}
            {flows.map(({ from, to, pct, users }) => {
              // Find source col: earliest col that has 'from'
              let srcCol = -1
              columns.forEach((col, ci) => { if (col.includes(from) && srcCol === -1) srcCol = ci })
              let tgtCol = -1
              columns.forEach((col, ci) => { if (col.includes(to) && tgtCol === -1) tgtCol = ci })
              if (srcCol === -1 || tgtCol === -1) return null

              const src = findNode(from, srcCol)
              const tgt = findNode(to, tgtCol)
              if (!src || !tgt) return null

              const pathId = `${from}-${to}`
              const isHovered = hoveredPath === pathId
              const strokeW = Math.max(2, pct / 5)
              const cx = (src.x + tgt.x) / 2

              return (
                <g key={pathId}>
                  <path
                    d={`M ${src.x} ${src.y} C ${cx} ${src.y} ${cx} ${tgt.y} ${tgt.x} ${tgt.y}`}
                    fill="none"
                    stroke={isHovered ? nodeColor(to) : '#CBD5E1'}
                    strokeWidth={isHovered ? strokeW + 2 : strokeW}
                    strokeOpacity={isHovered ? 0.8 : 0.4}
                    style={{ transition: 'all 0.15s', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPath(pathId)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                  {isHovered && (
                    <text x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={nodeColor(to)}>
                      {pct}% · {fmtVol(users)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Draw nodes */}
            {columns.map((col, ci) =>
              col.map((name) => {
                const key = `${ci}:${name}`
                const pos = nodePositions[key]
                if (!pos) return null
                const x = ci * (COL_W + 40)
                const color = nodeColor(name)
                const isExit = name === 'Exit'
                return (
                  <g key={key}>
                    <rect
                      x={x} y={pos.y} width={COL_W} height={NODE_H} rx={8}
                      fill={isExit ? '#F8FAFC' : color + '18'}
                      stroke={isExit ? '#E2E8F0' : color}
                      strokeWidth={isExit ? 1 : 1.5}
                    />
                    <text
                      x={x + COL_W / 2} y={pos.y + NODE_H / 2 + 4}
                      textAnchor="middle" fontSize="10" fontWeight={isExit ? '500' : '700'}
                      fill={isExit ? '#94A3B8' : color}
                      style={{ fontFamily: 'ui-monospace, monospace' }}
                    >
                      {name.length > 16 ? name.slice(0, 14) + '…' : name}
                    </text>
                  </g>
                )
              })
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-1 flex-wrap">
        {[
          { label: 'Browsing', color: '#0D9488' },
          { label: 'Cart', color: '#D97706' },
          { label: 'Checkout/Purchase', color: '#4338CA' },
          { label: 'Purchase', color: '#6366F1' },
          { label: 'Exit', color: '#94A3B8' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ROOT EXPLORE PAGE ────────────────────────────────────────────────────────


const TABS = [
  { id: 'events',   label: 'Events' },
  { id: 'funnels',  label: 'Funnels' },
  { id: 'query',    label: 'Query Builder' },
  { id: 'journeys', label: 'Journeys' },
]

export default function ExplorePage({ platform, selectedPersonas }) {
  const [tab, setTab] = useState('events')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-nav */}
      <div className="bg-white border-b shrink-0" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center px-6 gap-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-3.5 text-sm font-semibold transition-colors relative"
              style={{ color: tab === t.id ? '#6366F1' : '#64748B' }}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#6366F1' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'events'   && <EventsTab />}
      {tab === 'funnels'  && <FunnelsTab />}
      {tab === 'query'    && <QueryBuilderTab />}
      {tab === 'journeys' && <JourneysTab selectedPersonas={selectedPersonas} />}
    </div>
  )
}
