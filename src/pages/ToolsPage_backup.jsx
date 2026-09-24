import { useState, useEffect, useRef } from 'react'
import { PERSONAS } from '../data/personas'
import PersonaChip from '../components/PersonaChip'


// ─── Shared data ─────────────────────────────────────────────────────────────

const PAGES = [
  { id: 'home',     label: 'Homepage' },
  { id: 'pdp',      label: 'Product Detail Page' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'cart',     label: 'Cart' },
  { id: 'category', label: 'Category Listing' },
  { id: 'search',   label: 'Search Results' },
]

// ─── Heatmap ─────────────────────────────────────────────────────────────────


const BASE_HOTSPOTS = [
  { x: 50, y: 14, r: 0.95, label: 'Primary CTA button' },
  { x: 28, y: 32, r: 0.80, label: 'Product card (1)' },
  { x: 50, y: 32, r: 0.72, label: 'Product card (2)' },
  { x: 72, y: 32, r: 0.65, label: 'Product card (3)' },
  { x: 18, y:  8, r: 0.60, label: 'Nav: Categories' },
  { x: 50, y: 54, r: 0.45, label: 'Add to cart (hero)' },
  { x: 82, y:  8, r: 0.38, label: 'Search bar' },
  { x: 50, y: 74, r: 0.28, label: 'Related products' },
  { x: 30, y: 90, r: 0.12, label: 'Footer links' },
]

const PERSONA_SHIFT = {
  collector: { 4: 0.92, 2: 0.88, 0: 0.70 },
  guest:     { 7: 0.10, 6: 0.72, 0: 0.82 },
  loyal:     { 0: 0.98, 5: 0.85, 3: 0.78 },
  firsttime: { 6: 0.65, 0: 0.88, 7: 0.55 },
  active:    { 2: 0.90, 3: 0.85, 5: 0.70 },
}

// Pages with no data for prototype purposes
const EMPTY_COMBINATIONS = new Set(['checkout-app', 'search-app'])

function heatColor(intensity) {
  if (intensity > 0.85) return 'rgba(220,38,38,VAL)'
  if (intensity > 0.65) return 'rgba(234,88,12,VAL)'
  if (intensity > 0.45) return 'rgba(234,179,8,VAL)'
  if (intensity > 0.25) return 'rgba(34,197,94,VAL)'
  return 'rgba(59,130,246,VAL)'
}

function getHotspots(selectedPersonas) {
  return BASE_HOTSPOTS.map((h, i) => {
    let r = h.r
    for (const pid of selectedPersonas) {
      const shift = PERSONA_SHIFT[pid]
      if (shift && shift[i] !== undefined) r = shift[i]
    }
    return { ...h, r }
  })
}

const WIREFRAME_SECTIONS = [
  { label: 'Header / Nav',  h: 10, bg: '#F1F5F9' },
  { label: 'Hero Banner',   h: 18, bg: '#E2E8F0' },
  { label: 'Product Grid',  h: 30, bg: '#F8FAFC' },
  { label: 'CTA Strip',     h:  8, bg: '#EEF2FF' },
  { label: 'Related Items', h: 18, bg: '#F8FAFC' },
  { label: 'Reviews',       h: 10, bg: '#F1F5F9' },
  { label: 'Footer',        h:  6, bg: '#E2E8F0' },
]

const scrollDepths = [100, 84, 67, 52, 38, 21, 9]

function HeatmapPage({ platform, selectedPersonas }) {
  const [page, setPage]             = useState('home')
  const [hType, setHType]           = useState('click')
  const [hmPlatform, setHmPlatform] = useState(platform === 'app' ? 'app' : 'web')
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  // tooltip position (% within SVG container)
  const [tipPos, setTipPos]         = useState(null)
  const svgRef                      = useRef(null)

  const isEmpty = EMPTY_COMBINATIONS.has(`${page}-${hmPlatform}`)
  const hotspots = getHotspots(selectedPersonas)

  const topClicked = [...hotspots]
    .map((h, i) => ({ ...h, idx: i }))
    .sort((a, b) => b.r - a.r)
    .slice(0, 5)
    .map((h, rank) => ({ rank: rank + 1, label: h.label, pct: Math.round(h.r * 100), idx: h.idx }))

  function handleEllipseMouseMove(e, idx) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setTipPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    })
    setHoveredIdx(idx)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Controls bar */}
      <div className="shrink-0 px-6 py-3 border-b flex items-center gap-4 bg-white flex-wrap" style={{ borderColor: '#F1F5F9' }}>
        {/* Page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Page</span>
          <select
            className="border rounded-lg px-3 py-1.5 text-sm text-slate-800 font-medium focus:outline-none cursor-pointer"
            style={{ borderColor: '#E2E8F0' }}
            value={page}
            onChange={e => { setPage(e.target.value); setSelectedIdx(null) }}
          >
            {PAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: '#E2E8F0' }} />

        {/* Platform — Web/App only */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Surface</span>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            {(['web', 'app']).map(p => (
              <button
                key={p}
                onClick={() => setHmPlatform(p)}
                className="px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors"
                style={{ background: hmPlatform === p ? '#6366F1' : '#fff', color: hmPlatform === p ? '#fff' : '#475569' }}
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: '#E2E8F0' }} />

        {/* Heatmap type — same row as surface toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Type</span>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            {([['click', 'Click map'], ['scroll', 'Scroll map'], ['move', 'Move map']]).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setHType(val)}
                className="px-3.5 py-1.5 text-xs font-semibold transition-colors"
                style={{ background: hType === val ? '#6366F1' : '#fff', color: hType === val ? '#fff' : '#475569' }}
              >{lbl}</button>
            ))}
          </div>
        </div>

        {selectedPersonas.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Filtered:</span>
            {selectedPersonas.map(pid => <PersonaChip key={pid} id={pid} size="sm" />)}
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Wireframe + overlay */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="mx-auto" style={{ maxWidth: 560 }}>
            {isEmpty ? (
              /* ── Empty state ── */
              <div className="bg-white rounded-2xl border flex flex-col items-center justify-center py-20 px-8 text-center" style={{ borderColor: '#E2E8F0' }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth={1.5} className="mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <p className="text-sm font-bold text-slate-700 mb-1">Not enough sessions recorded</p>
                <p className="text-xs text-slate-400 max-w-[280px]">
                  There isn't enough data to render a heatmap for <strong>{PAGES.find(p => p.id === page)?.label}</strong> on <strong>{hmPlatform}</strong> yet. Try a different page or surface.
                </p>
                <button
                  onClick={() => { setPage('home'); setHmPlatform('web') }}
                  className="mt-5 px-4 py-2 text-xs font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ background: '#6366F1' }}
                >View Homepage · Web</button>
              </div>
            ) : (
              <div
                className="relative rounded-2xl overflow-hidden border"
                style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.08)' }}
              >
                {/* Device chrome */}
                <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#1E293B' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                  <div className="flex-1 mx-3 rounded px-3 py-0.5 text-[11px] text-slate-400 font-mono" style={{ background: '#0F172A' }}>
                    {hmPlatform === 'web' ? `vision.io/${page}` : `App · ${PAGES.find(p => p.id === page)?.label}`}
                  </div>
                </div>

                {/* Wireframe sections */}
                <div className="relative" style={{ background: '#fff' }}>
                  {WIREFRAME_SECTIONS.map((s, i) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-center border-b"
                      style={{ height: `${s.h * 4.2}px`, background: s.bg, borderColor: '#E2E8F0' }}
                    >
                      <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">{s.label}</span>
                    </div>
                  ))}

                  {/* Click map overlay */}
                  {hType === 'click' && (
                    <svg
                      ref={svgRef}
                      className="absolute inset-0 w-full h-full"
                      style={{ mixBlendMode: 'multiply' }}
                      onMouseLeave={() => { setHoveredIdx(null); setTipPos(null) }}
                    >
                      <defs>
                        {hotspots.map((h, i) => (
                          <radialGradient key={i} id={`hg-${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stopColor={heatColor(h.r).replace('VAL', '0.85')} />
                            <stop offset="60%"  stopColor={heatColor(h.r).replace('VAL', '0.35')} />
                            <stop offset="100%" stopColor={heatColor(h.r).replace('VAL', '0')} />
                          </radialGradient>
                        ))}
                      </defs>
                      {hotspots.map((h, i) => {
                        const radius = 40 + h.r * 50
                        const isSelected = selectedIdx === i
                        const isHovered = hoveredIdx === i
                        return (
                          <g key={i}>
                            <ellipse
                              cx={`${h.x}%`} cy={`${h.y}%`}
                              rx={radius} ry={radius * 0.7}
                              fill={`url(#hg-${i})`}
                              style={{ cursor: 'crosshair', pointerEvents: 'all' }}
                              onMouseMove={e => handleEllipseMouseMove(e, i)}
                              onMouseLeave={() => { setHoveredIdx(null); setTipPos(null) }}
                            />
                            {/* Selection ring */}
                            {isSelected && (
                              <ellipse
                                cx={`${h.x}%`} cy={`${h.y}%`}
                                rx={radius + 6} ry={radius * 0.7 + 4}
                                fill="none"
                                stroke="#6366F1"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                style={{ pointerEvents: 'none' }}
                              />
                            )}
                          </g>
                        )
                      })}
                      {/* Hover tooltip */}
                      {tipPos && hoveredIdx !== null && (
                        <foreignObject
                          x={`${Math.min(tipPos.x + 2, 65)}%`}
                          y={`${Math.max(tipPos.y - 14, 2)}%`}
                          width="160" height="44"
                          style={{ pointerEvents: 'none', overflow: 'visible' }}
                        >
                          <div
                            className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap"
                            style={{ background: '#1E293B', display: 'inline-block' }}
                          >
                            {hotspots[hoveredIdx].label}
                            <span className="ml-2 font-black" style={{ color: heatColor(hotspots[hoveredIdx].r).replace('VAL', '1') }}>
                              {Math.round(hotspots[hoveredIdx].r * 100)}%
                            </span>
                          </div>
                        </foreignObject>
                      )}
                    </svg>
                  )}

                  {/* Move map overlay */}
                  {hType === 'move' && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
                      <defs>
                        {hotspots.map((h, i) => (
                          <radialGradient key={i} id={`mg-${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stopColor={`rgba(99,102,241,${h.r * 0.6})`} />
                            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                          </radialGradient>
                        ))}
                      </defs>
                      {hotspots.map((h, i) => (
                        <ellipse key={i} cx={`${h.x}%`} cy={`${h.y}%`} rx={60 + h.r * 40} ry={40 + h.r * 30} fill={`url(#mg-${i})`} />
                      ))}
                    </svg>
                  )}

                  {/* Scroll map overlay */}
                  {hType === 'scroll' && (
                    <div className="absolute inset-y-0 right-0 w-8 flex flex-col pointer-events-none">
                      {scrollDepths.map((depth, i) => (
                        <div
                          key={i}
                          className="flex-1 flex items-center justify-center"
                          style={{ background: heatColor(depth / 100).replace('VAL', '0.85') }}
                        >
                          <span className="text-[8px] font-bold text-white">{depth}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scroll legend */}
            {hType === 'scroll' && !isEmpty && (
              <div className="mt-3 flex items-center gap-3 justify-center">
                <span className="text-[11px] text-slate-500">0% reach</span>
                <div className="flex h-3 rounded-full overflow-hidden" style={{ width: 160 }}>
                  {['rgba(220,38,38,1)', 'rgba(234,88,12,1)', 'rgba(234,179,8,1)', 'rgba(34,197,94,1)', 'rgba(59,130,246,1)'].reverse().map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500">100% reach</span>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-56 shrink-0 border-l bg-white overflow-y-auto p-4" style={{ borderColor: '#F1F5F9' }}>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {hType === 'scroll' ? 'Scroll Depth' : 'Top Clicked Elements'}
          </p>

          {isEmpty ? (
            <p className="text-[11px] text-slate-400 italic">No data available</p>
          ) : hType === 'scroll' ? (
            <div className="space-y-2">
              {WIREFRAME_SECTIONS.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 truncate max-w-[110px]">{s.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full" style={{ width: `${scrollDepths[i]}%`, background: heatColor(scrollDepths[i] / 100).replace('VAL', '1') }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 w-7 text-right">{scrollDepths[i]}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {topClicked.map(item => {
                const isSelected = selectedIdx === item.idx
                return (
                  <button
                    key={item.rank}
                    onClick={() => setSelectedIdx(isSelected ? null : item.idx)}
                    className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl transition-colors"
                    style={{ background: isSelected ? '#EEF2FF' : 'transparent' }}
                    onMouseEnter={() => setHoveredIdx(item.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <span
                      className="w-4 h-4 rounded text-[9px] font-black text-white flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: item.rank === 1 ? '#DC2626' : item.rank === 2 ? '#EA580C' : item.rank <= 4 ? '#CA8A04' : '#475569' }}
                    >{item.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-snug" style={{ color: isSelected ? '#4338CA' : '#334155' }}>{item.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: isSelected ? '#6366F1' : '#94A3B8' }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">{item.pct}%</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {!isEmpty && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Summary</p>
              <div className="space-y-1.5">
                {[
                  ['Total clicks',    '48.2K'],
                  ['Unique users',    '12.4K'],
                  ['Avg scroll depth','54%'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[11px] text-slate-500">{k}</span>
                    <span className="text-[11px] font-bold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Session Replay ───────────────────────────────────────────────────────────


const FLAG_META = {
  rage_click:     { label: 'Rage click',     bg: '#FEF2F2', color: '#B91C1C' },
  cart_abandoned: { label: 'Cart abandoned', bg: '#FFFBEB', color: '#92400E' },
  error:          { label: 'Error',          bg: '#FFF1F2', color: '#9F1239' },
}


const SESSIONS = [
  {
    id: 's1', userId: 'usr_8821a', personaId: 'collector', platform: 'app',
    duration: '8m 42s', events: 34, date: 'Today, 11:04 AM',
    flags: ['rage_click'],
    entryPage: 'Homepage', exitPage: 'Product Detail Page',
    device: 'iPhone 15 Pro', browser: 'Safari WebView',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:14', name: 'view_item_list', detail: 'Category: Ceramics' },
      { time: '0:52', name: 'select_item',    detail: 'Stoneware Vase #204' },
      { time: '1:18', name: 'view_item' },
      { time: '2:04', name: 'rage_click',     detail: 'Add to cart button — 5× in 2s' },
      { time: '2:07', name: 'add_to_cart' },
      { time: '4:31', name: 'view_cart' },
      { time: '8:42', name: 'session_end' },
    ],
  },
  {
    id: 's2', userId: 'Guest', personaId: 'guest', platform: 'web',
    duration: '1m 58s', events: 8, date: 'Today, 10:47 AM',
    flags: ['cart_abandoned'],
    entryPage: 'Homepage', exitPage: 'Cart',
    device: 'Desktop', browser: 'Chrome 124',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:08', name: 'view_item_list' },
      { time: '0:34', name: 'view_item', detail: 'Linen Tote' },
      { time: '0:51', name: 'add_to_cart' },
      { time: '1:02', name: 'view_cart' },
      { time: '1:58', name: 'session_end', detail: 'Cart abandoned at checkout prompt' },
    ],
  },
  {
    id: 's3', userId: 'usr_4412c', personaId: 'loyal', platform: 'web',
    duration: '12m 07s', events: 52, date: 'Today, 10:12 AM',
    flags: [],
    entryPage: 'Homepage', exitPage: 'Order Confirmation',
    device: 'Desktop', browser: 'Firefox 125',
    eventLog: [
      { time: '0:00',  name: 'session_start' },
      { time: '0:22',  name: 'view_item_list', detail: 'New Arrivals' },
      { time: '1:44',  name: 'add_to_wishlist' },
      { time: '3:10',  name: 'add_to_cart' },
      { time: '5:02',  name: 'begin_checkout' },
      { time: '6:14',  name: 'add_shipping_info' },
      { time: '7:30',  name: 'add_payment_info' },
      { time: '9:12',  name: 'purchase', detail: 'Order #VIS-00831, $218' },
      { time: '12:07', name: 'session_end' },
    ],
  },
  {
    id: 's4', userId: 'usr_9034b', personaId: 'firsttime', platform: 'web',
    duration: '3m 22s', events: 14, date: 'Yesterday, 4:38 PM',
    flags: ['error'],
    entryPage: 'Search Results', exitPage: 'Checkout',
    device: 'Desktop', browser: 'Chrome 124',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:11', name: 'view_item_list', detail: 'Search: "ceramic bowl"' },
      { time: '0:44', name: 'view_item' },
      { time: '1:20', name: 'add_to_cart' },
      { time: '1:55', name: 'begin_checkout' },
      { time: '2:40', name: 'error', detail: 'Payment form validation error' },
      { time: '3:22', name: 'session_end' },
    ],
  },
  {
    id: 's5', userId: 'usr_2207f', personaId: 'active', platform: 'app',
    duration: '5m 14s', events: 26, date: 'Yesterday, 2:15 PM',
    flags: ['rage_click', 'cart_abandoned'],
    entryPage: 'Homepage', exitPage: 'Product Detail Page',
    device: 'Samsung Galaxy S24', browser: 'Chrome Android',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:18', name: 'view_item_list' },
      { time: '0:52', name: 'select_item' },
      { time: '1:30', name: 'view_item' },
      { time: '2:12', name: 'rage_click', detail: 'Size selector — 4× rapid tap' },
      { time: '2:44', name: 'add_to_cart' },
      { time: '3:58', name: 'view_cart' },
      { time: '5:14', name: 'session_end', detail: 'Abandoned after cart view' },
    ],
  },
  {
    id: 's6', userId: 'Guest', personaId: 'guest', platform: 'web',
    duration: '0m 44s', events: 4, date: 'Yesterday, 11:02 AM',
    flags: [],
    entryPage: 'Homepage', exitPage: 'Homepage',
    device: 'Desktop', browser: 'Safari 17',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:08', name: 'view_item_list' },
      { time: '0:44', name: 'session_end' },
    ],
  },
]

const CURSOR_PATH = [
  { x: 50, y: 15 },
  { x: 30, y: 35 },
  { x: 50, y: 35 },
  { x: 50, y: 14 },
  { x: 50, y: 14 },
  { x: 50, y: 14 },
  { x: 50, y: 55 },
  { x: 30, y: 70 },
  { x: 50, y: 85 },
]

function lerp(a, b, t) { return a + (b - a) * t }

// Parse "Xm Ys" → total seconds
function parseDuration(d) {
  const [mPart, sPart] = d.split('m ')
  return parseInt(mPart) * 60 + parseInt(sPart)
}

// Format seconds → "m:ss"
function fmtTime(totalSecs, pct) {
  const s = Math.round(pct / 100 * totalSecs)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const FLAG_COLOR = {
  rage_click: '#DC2626',
  error:      '#9F1239',
  session_end:'#64748B',
  purchase:   '#047857',
  add_to_cart:'#4338CA',
}
function markerColor(name) { return FLAG_COLOR[name] ?? '#6366F1' }

function SessionPlayer({ session, onClose }) {
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed]       = useState(1)
  const [shareOpen, setShareOpen] = useState(false)
  const rafRef  = useRef(0)
  const lastRef = useRef(0)
  const logRef  = useRef(null)

  const totalSecs = parseDuration(session.duration)

  const markers = session.eventLog.map(e => {
    const [m, s] = e.time.split(':').map(Number)
    return { ...e, pct: Math.min(((m * 60 + s) / totalSecs) * 100, 100) }
  })

  // Active event index: last marker whose pct ≤ progress
  const activeIdx = markers.reduce((best, m, i) => (progress >= m.pct ? i : best), 0)

  // Cursor
  const pathIdx = Math.min(Math.floor(progress / 100 * (CURSOR_PATH.length - 1)), CURSOR_PATH.length - 2)
  const pathT   = (progress / 100 * (CURSOR_PATH.length - 1)) - pathIdx
  const cx = lerp(CURSOR_PATH[pathIdx].x, CURSOR_PATH[pathIdx + 1].x, pathT)
  const cy = lerp(CURSOR_PATH[pathIdx].y, CURSOR_PATH[pathIdx + 1].y, pathT)
  const isClicking = Math.abs(progress - 40) < 1.5 || Math.abs(progress - 42) < 1.5 || Math.abs(progress - 44) < 1.5

  // Playback loop
  useEffect(() => {
    if (playing) {
      const tick = (now) => {
        const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0
        lastRef.current = now
        setProgress(p => {
          const next = p + dt * speed * 4
          if (next >= 100) { setPlaying(false); return 100 }
          return next
        })
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      lastRef.current = 0
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, speed])

  // Auto-scroll event log to active entry
  useEffect(() => {
    const container = logRef.current
    if (!container) return
    const active = container.querySelector<HTMLElement>('[data-active="true"]')
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIdx])

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b bg-white" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Session list
            </button>
            <div className="w-px h-5" style={{ background: '#E2E8F0' }} />
            <div>
              <p className="text-sm font-bold text-slate-900">Session {session.userId}</p>
              <p className="text-[11px] text-slate-400">{session.date} · {session.duration} · {session.events} events</p>
            </div>
            <PersonaChip id={session.personaId} size="sm" />
            {session.flags.map(f => (
              <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: FLAG_META[f].bg, color: FLAG_META[f].color }}>
                {FLAG_META[f].label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Speed */}
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: speed === s ? '#6366F1' : '#fff', color: speed === s ? '#fff' : '#475569' }}
                >{s}×</button>
              ))}
            </div>
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors"
              style={{ borderColor: '#E2E8F0', color: '#475569' }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share session
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Player */}
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden bg-slate-50">
            {/* Mock screen */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border bg-white min-h-0" style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.08)' }}>
              <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ background: '#1E293B' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                <div className="flex-1 mx-3 rounded px-3 py-0.5 text-[10px] text-slate-400 font-mono" style={{ background: '#0F172A' }}>
                  vision.io/{session.entryPage.toLowerCase().replace(/ /g, '-')}
                </div>
              </div>
              <div className="relative overflow-hidden" style={{ height: 'calc(100% - 32px)' }}>
                {WIREFRAME_SECTIONS.map(s => (
                  <div key={s.label} className="flex items-center justify-center border-b"
                    style={{ height: `${s.h * 4.5}px`, background: s.bg, borderColor: '#E2E8F0', flexShrink: 0 }}>
                    <span className="text-[9px] font-semibold text-slate-400 tracking-wide uppercase">{s.label}</span>
                  </div>
                ))}
                {/* Animated cursor */}
                <div
                  className="absolute pointer-events-none"
                  style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)', zIndex: 10, transition: 'left 0.08s linear, top 0.08s linear' }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{
                      background: isClicking ? '#DC2626' : '#6366F1',
                      boxShadow: isClicking ? '0 0 0 5px rgba(220,38,38,0.25)' : '0 0 0 2px rgba(99,102,241,0.3)',
                      transition: 'background 0.08s, box-shadow 0.08s',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="shrink-0 space-y-2.5">
              {/* Scrubber + markers */}
              <div className="relative pt-2">
                <input
                  type="range" min={0} max={100} step={0.1}
                  value={progress}
                  onChange={e => { setPlaying(false); setProgress(Number(e.target.value)) }}
                  className="w-full cursor-pointer"
                  style={{
                    height: 6,
                    borderRadius: 9999,
                    appearance: 'none',
                    background: `linear-gradient(to right, #6366F1 ${progress}%, #E2E8F0 ${progress}%)`,
                  }}
                />
                {/* Event markers */}
                {markers.map((m, i) => (
                  <button
                    key={i}
                    title={m.name + (m.detail ? ` — ${m.detail}` : '')}
                    onClick={() => { setPlaying(false); setProgress(m.pct) }}
                    className="absolute w-2.5 h-2.5 rounded-full border-2 border-white hover:scale-150 transition-transform"
                    style={{ left: `${m.pct}%`, top: 2, transform: 'translateX(-50%)', background: markerColor(m.name), zIndex: 5 }}
                  />
                ))}
              </div>

              {/* Play row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { if (progress >= 100) setProgress(0); setPlaying(p => !p) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity shrink-0"
                  style={{ background: '#6366F1' }}
                >
                  {playing
                    ? <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                    : <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  }
                </button>
                <span className="text-xs font-mono text-slate-500 tabular-nums">{fmtTime(totalSecs, progress)} / {session.duration.replace('m ', ':').replace('s', '')}</span>
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  {[['rage_click','#DC2626'], ['purchase','#047857'], ['add_to_cart','#4338CA'], ['other','#6366F1']].map(([lbl, col]) => (
                    <div key={lbl} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
                      <span className="text-[10px] text-slate-400">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata side panel */}
          <div className="w-60 shrink-0 border-l bg-white flex flex-col overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
            <div className="p-4 shrink-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Session Info</p>
              <div className="space-y-1.5">
                {([
                  ['Persona',  <PersonaChip id={session.personaId} size="sm" />],
                  ['Platform', session.platform === 'web' ? '🌐 Web' : '📱 App'],
                  ['Device',   session.device],
                  ['Browser',  session.browser],
                  ['Entry',    session.entryPage],
                  ['Exit',     session.exitPage],
                  ['Duration', session.duration],
                ]).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 w-14 shrink-0 mt-0.5">{k}</span>
                    <span className="text-[11px] text-slate-700 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t px-4 pt-3 pb-2 shrink-0" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Event Log</p>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto px-2 pb-4">
              {markers.map((m, i) => {
                const isActive = i === activeIdx
                return (
                  <button
                    key={i}
                    data-active={isActive}
                    onClick={() => { setPlaying(false); setProgress(m.pct) }}
                    className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-50"
                    style={{ background: isActive ? '#EEF2FF' : 'transparent' }}
                  >
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5 w-8">{m.time}</span>
                    <div>
                      <span className="text-[11px] font-mono font-semibold" style={{ color: markerColor(m.name) }}>{m.name}</span>
                      {m.detail && <p className="text-[10px] text-slate-400 mt-0.5">{m.detail}</p>}
                    </div>
                    {isActive && (
                      <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: '#6366F1' }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)' }}
          onClick={() => setShareOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-[420px] p-6"
            style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-slate-900">Share Session</p>
              <button onClick={() => setShareOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Anyone with this link can view this session replay (read-only).</p>
            <div className="flex gap-2">
              <div
                className="flex-1 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-600 border select-all truncate"
                style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}
              >
                https://vision.io/replay/{session.id}?token=sh_{session.userId}
              </div>
              <button
                onClick={() => {
                  try { navigator.clipboard?.writeText(`https://vision.io/replay/${session.id}`) } catch {}
                }}
                className="px-4 py-2.5 text-xs font-bold rounded-xl text-white hover:opacity-90 transition-opacity shrink-0"
                style={{ background: '#6366F1' }}
              >Copy link</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Link expires in 7 days · Session {session.userId}</p>
          </div>
        </div>
      )}
    </>
  )
}

function SessionReplayPage({ selectedPersonas }) {
  const [personaFilter,  setPersonaFilter]  = useState([])
  const [platformFilter, setPlatformFilter] = useState('all')
  const [flagFilter,     setFlagFilter]     = useState([])
  const [page,           setPage]           = useState('home')
  const [openSession,    setOpenSession]    = useState(null)

  useEffect(() => { setPersonaFilter(selectedPersonas) }, [selectedPersonas])

  const clearAll = () => { setPersonaFilter([]); setPlatformFilter('all'); setFlagFilter([]) }
  const hasFilters = personaFilter.length > 0 || platformFilter !== 'all' || flagFilter.length > 0

  const filtered = SESSIONS.filter(s => {
    if (personaFilter.length > 0 && !personaFilter.includes(s.personaId)) return false
    if (platformFilter !== 'all' && s.platform !== platformFilter) return false
    if (flagFilter.length > 0 && !flagFilter.some(f => s.flags.includes(f))) return false
    return true
  })

  const togglePersona = (pid) =>
    setPersonaFilter(ps => ps.includes(pid) ? ps.filter(x => x !== pid) : [...ps, pid])
  const toggleFlag = (f) =>
    setFlagFilter(fs => fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f])

  if (openSession) {
    return <SessionPlayer session={openSession} onClose={() => setOpenSession(null)} />
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Filter bar */}
      <div className="shrink-0 px-6 py-3 border-b bg-white flex items-center gap-3 flex-wrap" style={{ borderColor: '#F1F5F9' }}>
        {/* Page */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Page</span>
          <select
            className="border rounded-lg px-3 py-1.5 text-sm text-slate-800 font-medium focus:outline-none cursor-pointer"
            style={{ borderColor: '#E2E8F0' }}
            value={page}
            onChange={e => setPage(e.target.value)}
          >
            {PAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: '#E2E8F0' }} />

        {/* Platform */}
        <div className="flex rounded-lg border overflow-hidden shrink-0" style={{ borderColor: '#E2E8F0' }}>
          {(['all', 'web', 'app']).map(p => (
            <button key={p} onClick={() => setPlatformFilter(p)}
              className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
              style={{ background: platformFilter === p ? '#6366F1' : '#fff', color: platformFilter === p ? '#fff' : '#475569' }}>
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>

        {/* Persona filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => togglePersona(p.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all hover:opacity-90"
              style={{
                background:  personaFilter.includes(p.id) ? p.color : '#fff',
                borderColor: personaFilter.includes(p.id) ? p.color : '#E2E8F0',
                color:       personaFilter.includes(p.id) ? '#fff' : '#64748B',
              }}
            >{p.name.split(' ')[0]}</button>
          ))}
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: '#E2E8F0' }} />

        {/* Flags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Flags</span>
          {(Object.keys(FLAG_META)).map(f => (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all"
              style={{
                background:  flagFilter.includes(f) ? FLAG_META[f].bg : '#fff',
                borderColor: flagFilter.includes(f) ? FLAG_META[f].color : '#E2E8F0',
                color:       flagFilter.includes(f) ? FLAG_META[f].color : '#64748B',
              }}
            >{FLAG_META[f].label}</button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {hasFilters && (
            <button onClick={clearAll} className="text-xs font-semibold hover:underline" style={{ color: '#6366F1' }}>
              Clear filters
            </button>
          )}
          <span className="text-xs text-slate-400">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Session table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth={1.5} className="mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-sm font-bold text-slate-700 mb-1">No sessions match your filters</p>
            <p className="text-xs text-slate-400 mb-5">Try removing a filter to see more results.</p>
            <button
              onClick={clearAll}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: '#6366F1' }}
            >Clear all filters</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ background: '#F8FAFC' }}>
              <tr>
                {['User', 'Persona', 'Platform', 'Duration', 'Events', 'Date', 'Flags', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  style={{ borderTop: '1px solid #F8FAFC' }}
                  onClick={() => setOpenSession(s)}
                >
                  <td className="px-5 py-3">
                    <span className="text-sm font-mono font-semibold text-slate-800">{s.userId}</span>
                  </td>
                  <td className="px-5 py-3"><PersonaChip id={s.personaId} size="sm" /></td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      {s.platform === 'web'
                        ? <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                        : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      }
                      {s.platform}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-700">{s.duration}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{s.events}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{s.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.flags.map(f => (
                        <span key={f} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: FLAG_META[f].bg, color: FLAG_META[f].color }}>
                          {FLAG_META[f].label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300 group-hover:text-slate-500 transition-colors">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────


export default function ToolsPage({ platform, selectedPersonas }) {
  const [tab, setTab] = useState('heatmaps')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b shrink-0" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center px-6">
          {([['heatmaps', 'Heatmaps'], ['replay', 'Session Replay']]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-3.5 text-sm font-semibold transition-colors relative"
              style={{ color: tab === id ? '#6366F1' : '#64748B' }}
            >
              {label}
              {tab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#6366F1' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'heatmaps' && <HeatmapPage platform={platform} selectedPersonas={selectedPersonas} />}
      {tab === 'replay'   && <SessionReplayPage selectedPersonas={selectedPersonas} />}
    </div>
  )
}
