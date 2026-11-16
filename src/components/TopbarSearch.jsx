import { useEffect, useMemo, useRef, useState } from 'react'

// Keep destinations in sync with App.jsx. Search navigates to screens; it does
// not search customers, products, recordings, or backend data.
export const SEARCH_PAGES = [
  { label: 'Project Overview', path: '/home', group: 'Workspace', description: 'KPIs, live sessions and at a glance', keywords: 'home overview dashboard kpis' },
  { label: 'Projects', path: '/projects', group: 'Workspace', description: 'Create, configure and edit projects', keywords: 'project settings sdk' },
  { label: 'At a Glance', path: '/at-a-glance', group: 'Workspace', description: 'Observed activity across the selected period', keywords: 'summary observations insights' },
  { label: 'Revenue by Persona', path: '/revenue', group: 'Revenue', description: 'Revenue and behavior by customer group', keywords: 'segment personas' },
  { label: 'Revenue Opportunity Radar', path: '/revenue/opportunity-radar', group: 'Revenue', description: 'Investigate detected opportunities', keywords: 'radar opportunities signals' },
  { label: 'Revenue Investigator', path: '/revenue/investigator', group: 'Revenue', description: 'Cart journeys and session replay evidence', keywords: 'cart abandonment checkout purchases session' },
  { label: 'Explore', path: '/explore', group: 'Explore', description: 'Explore tracked customers and events', keywords: 'users sessions events' },
  { label: 'Funnels', path: '/explore/funnels', group: 'Explore', description: 'Review funnel progression', keywords: 'conversion funnel stages' },
  { label: 'Journey Comparison', path: '/explore/journey', group: 'Explore', description: 'Compare paths for purchasing and other sessions', keywords: 'paths flow journey' },
  { label: 'Personas', path: '/personas', group: 'Audience', description: 'Dynamic customer segments', keywords: 'customer segmentation' },
  { label: 'Products & Audience', path: '/products-audience', group: 'Audience', description: 'Product intelligence and engagement', keywords: 'products' },
  { label: 'Audience Intelligence', path: '/products-audience/audience', group: 'Audience', description: 'Audience patterns and breakdowns', keywords: 'visitors users' },
  { label: 'Behavior', path: '/tools', group: 'Tools', description: 'Behavior tools and diagnostics', keywords: 'heatmap replay tracking' },
  { label: 'Live Sessions', path: '/live', group: 'Tools', description: 'Current activity and session recordings', keywords: 'live feed session replay' },
  { label: 'AI Insights', path: '/insights', group: 'Intelligence', description: 'Generated insights and observed findings', keywords: 'gemini ai insights' },
  { label: 'Ask Vivi', path: '/ask-dashboard', group: 'Intelligence', description: 'Ask questions about tracked analytics', keywords: 'ai ask assistant' },
]

export function searchPages(query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return SEARCH_PAGES
  return SEARCH_PAGES.map((page) => {
    const name = page.label.toLowerCase()
    const haystack = `${name} ${page.group} ${page.description} ${page.keywords}`.toLowerCase()
    if (!words.every((word) => haystack.includes(word))) return null
    const score = words.reduce((sum, word) => sum + (name.startsWith(word) ? 4 : name.includes(word) ? 2 : 0), 0)
    return { ...page, score }
  }).filter(Boolean).sort((a, b) => {
    const groupA = SEARCH_PAGES.findIndex(page => page.group === a.group)
    const groupB = SEARCH_PAGES.findIndex(page => page.group === b.group)
    return groupA - groupB || b.score - a.score
  })
}

const Magnifier = ({ size = 17 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5" strokeLinecap="round"/>
  </svg>
)

export default function TopbarSearch({ onNavigatePath }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const results = useMemo(() => searchPages(query), [query])

  const close = () => { setOpen(false); setQuery(''); setActiveIndex(0) }
  const navigateTo = (path) => { close(); onNavigatePath?.(path) }

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      } else if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

  }, [open])

  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      navigateTo(results[activeIndex].path)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        title="Search pages (⌘K / Ctrl+K)"
        aria-label="Search dashboard pages"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex h-8 items-center justify-center rounded-lg p-2 transition-colors touch-target ${open ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}`}
      >
        <Magnifier size={17} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} aria-hidden="true" />
          <div
            className="absolute right-0 top-full z-20 mt-2 w-[min(90vw,350px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            role="region"
            aria-label="Search dashboard pages"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-slate-400">
              <Magnifier size={15} />
              <input
                ref={inputRef}
                value={query}
                onChange={event => { setQuery(event.target.value); setActiveIndex(0) }}
                onKeyDown={onInputKeyDown}
                placeholder="Search screens…"
                aria-label="Search screens"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400">Esc</span>
            </div>
            <div className="max-h-72 overflow-y-auto px-1.5 py-1.5" aria-label="Matching pages">
              {!results.length ? (
                <p className="px-3 py-5 text-center text-xs text-slate-400">No matching screens</p>
              ) : results.map((item, index) => (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full min-w-0 flex-col rounded-lg px-3 py-2 text-left transition-colors ${activeIndex === index ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="truncate text-[11px] text-slate-400">{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
