import { useEffect, useState } from 'react'
import { PERSONAS } from '../data/personas'



const DATE_PRESETS = [
  { label: 'Today',          token: '1d',  display: 'Today' },
  { label: 'Last 7 days',    token: '7d',  display: 'Last 1 Week' },
  { label: 'Last 30 days',   token: '30d', display: 'Last 30 Days' },
  { label: 'Last 90 days',   token: '90d', display: 'Last 90 Days' },
  { label: 'Last 6 months',  token: '180d',  display: 'Last 6 Months' },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Topbar({
  platform,
  onPlatformChange,
  selectedPersonas,
  onPersonasChange,
  title,
  period,
  customRange,
  onPeriodChange,
  showFilters = true,
  projectId,
  projectName,
  onProjectClick,
  onNavigatePath,
}) {
  const [personaOpen, setPersonaOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customFrom, setCustomFrom] = useState(customRange?.from || '')
  const [customTo, setCustomTo] = useState(customRange?.to || '')

  useEffect(() => {
    setCustomFrom(customRange?.from || '')
    setCustomTo(customRange?.to || '')
  }, [customRange?.from, customRange?.to])

  const togglePersona = (id) => {
    onPersonasChange(
      selectedPersonas.includes(id)
        ? selectedPersonas.filter(p => p !== id)
        : [...selectedPersonas, id],
    )
  }

  // Derive the visible date label from the token — component never sees raw strings
  const activePreset = DATE_PRESETS.find(p => p.token === period)
  const dateLabel =
    period === 'custom'
      ? customRange?.from && customRange?.to
        ? `${formatDate(customRange.from)} – ${formatDate(customRange.to)}`
        : 'Custom range'
      : activePreset?.display ?? 'Custom'

  const personaLabel =
    selectedPersonas.length === 0
      ? 'All Personas'
      : selectedPersonas.length === 1
      ? PERSONAS.find(p => p.id === selectedPersonas[0])?.name ?? '1 Persona'
      : `${selectedPersonas.length} Personas`

  const searchItems = [
    { label: 'Overview', path: '/home' },
    { label: 'Conversion Funnel', path: '/conversion' },
    { label: 'Explore', path: '/explore' },
    { label: 'Revenue by Persona', path: '/revenue' },
    { label: 'Revenue Opportunity Radar', path: '/opportunities' },
    { label: 'Personas Explorer', path: '/personas' },
    { label: 'Behavior', path: '/tools' },
    { label: 'Decision Tracking', path: '/decisions' },
    { label: 'Alerts & Insights', path: '/alerts' },
    { label: 'Projects', path: '/projects' },
    { label: 'Settings', path: '/settings' },
  ]

  const filteredSearchItems = searchItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )

  return (
    <header
      className="min-h-14 flex flex-wrap items-center px-3 sm:px-6 py-2 gap-2 sm:gap-3 shrink-0 relative z-30"
      style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <h1 className="truncate font-bold text-[15px] text-slate-900 tracking-tight shrink-0">{title}</h1>

        {projectId && showFilters && (
          <button
            type="button"
            onClick={onProjectClick}
            className="hidden sm:flex min-w-0 max-w-[220px] items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-1.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
            title="Switch project"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate text-[11px] font-semibold text-indigo-700">
              {projectName || projectId}
            </span>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {showFilters && (<>
      {/* ---------- Date range picker ---------- */}
      <div className="relative">
        <button
          onClick={() => {
            setDateOpen(o => !o)
            setPersonaOpen(false)
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 px-3 py-1.5 rounded-lg border transition-colors hover:border-indigo-300"
          style={{ borderColor: dateOpen ? '#6366F1' : '#E2E8F0' }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">{dateLabel}</span>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dateOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDateOpen(false)} />
            <div
              className="absolute top-full left-0 mt-1.5 w-64 rounded-xl shadow-lg border z-20 overflow-hidden"
              style={{ background: '#fff', borderColor: '#E2E8F0' }}
            >
              <p
                className="text-[10px] font-semibold text-slate-400 px-3 py-2 tracking-widest border-b"
                style={{ borderColor: '#F1F5F9' }}
              >
                QUICK SELECT
              </p>

              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.token}
                  onClick={() => {
                    onPeriodChange(preset.token)
                    setDateOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                  style={{ color: period === preset.token ? '#6366F1' : '#374151' }}
                >
                  <span className="font-medium">{preset.label}</span>
                  {period === preset.token && (
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}

              <div className="border-t px-3 py-2.5" style={{ borderColor: '#F1F5F9' }}>
                <p className="text-[10px] font-semibold text-slate-400 tracking-widest mb-2">CUSTOM RANGE</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="min-w-0 flex-1 rounded border px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                    style={{ borderColor: '#E2E8F0' }}
                  />
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="min-w-0 flex-1 rounded border px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <button
                  onClick={() => {
                    onPeriodChange('custom', { from: customFrom, to: customTo })
                    setDateOpen(false)
                  }}
                  disabled={!customFrom || !customTo}
                  className="mt-2 w-full rounded-lg py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: '#6366F1' }}
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---------- Platform toggle ---------- */}
      <div className="flex items-center rounded-lg p-0.5" style={{ background: '#F1F5F9' }}>
        {(['web', 'app', 'combined']).map(p => (
          <button
            key={p}
            onClick={() => onPlatformChange(p)}
            className="px-3 py-1.5 rounded-md transition-all text-xs font-semibold"
            style={
              platform === p
                ? { background: '#fff', color: '#6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#475569' }
            }
          >
            {p === 'combined' ? 'All' : p === 'web' ? 'Desktop' : 'Mobile'}
          </button>
        ))}
      </div>

      {/* ---------- Persona filter ---------- */}
      <div className="relative">
        <button
          onClick={() => {
            setPersonaOpen(o => !o)
            setDateOpen(false)
          }}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
          style={{
            borderColor: personaOpen || selectedPersonas.length ? '#6366F1' : '#E2E8F0',
            color: selectedPersonas.length ? '#6366F1' : '#64748B',
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {personaLabel}
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {personaOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPersonaOpen(false)} />
            <div
              className="absolute top-full left-0 mt-1.5 w-56 rounded-xl shadow-lg border z-20 py-1.5"
              style={{ background: '#fff', borderColor: '#E2E8F0' }}
            >
              <p className="text-[10px] font-semibold text-slate-400 px-3 py-1.5 tracking-widest">
                FILTER BY PERSONA
              </p>
              {PERSONAS.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => togglePersona(persona.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: persona.color,
                      background: selectedPersonas.includes(persona.id) ? persona.color : 'transparent',
                    }}
                  >
                    {selectedPersonas.includes(persona.id) && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: persona.lightBg, color: persona.textColor }}
                  >
                    <span style={{ fontSize: '9px' }}>{persona.icon}</span>
                    {persona.name}
                  </span>
                </button>
              ))}
              {selectedPersonas.length > 0 && (
                <button
                  onClick={() => onPersonasChange([])}
                  className="w-full text-left text-xs text-slate-500 px-3 py-2 hover:text-slate-700 border-t mt-1"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  Clear filter
                </button>
              )}
            </div>
          </>
        )}
      </div>

      </>)}

      {/* ---------- Right side: search + avatar ---------- */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 relative">
        {showFilters && projectId && (
          <button
            type="button"
            onClick={onProjectClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-[11px] font-bold text-indigo-600 sm:hidden"
            title={projectName || projectId}
            aria-label="Switch project"
          >
            {(projectName || projectId).charAt(0).toUpperCase()}
          </button>
        )}

        {!showFilters && (
          <button
            type="button"
            onClick={onProjectClick}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
          >
            Projects
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
            style={{ color: searchOpen ? '#6366F1' : '#64748B' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {searchOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSearchOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1.5 w-64 rounded-xl shadow-lg border z-20 overflow-hidden"
                style={{ background: '#fff', borderColor: '#E2E8F0' }}
              >
                <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: '#F1F5F9' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search screens…"
                    className="flex-1 text-sm outline-none"
                  />
                </div>
                {filteredSearchItems.length > 0 ? (
                  filteredSearchItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        onNavigatePath?.(item.path)
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-center text-xs text-slate-400">No matching screens</p>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        >
          AP
        </div>
      </div>
    </header>
  )
}