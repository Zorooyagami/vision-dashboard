// src/pages/Live.jsx
import { useMemo, useState } from 'react'
import { Card } from '../components/home/shared'
import LiveSessionPlayer from '../components/live/LiveSessionPlayer'
import { useLiveStream } from '../hooks/useLiveStream'
import { LiveBadge, Sparkline, FeedRow, eventMeta, who, describe, timeAgo } from '../components/live/liveShared'

const ACTIVE_WINDOW = 5 * 60 * 1000

export default function Live({ onNavigate }) {
  const { events, active, history, status, now, recordings } = useLiveStream()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const recFor = (s) => (s.userId ? recordings[s.userId] : null) // set when rrweb chunks are arriving
  const [watching, setWatching] = useState(null) // session opened in the replay overlay

  const sessions = useMemo(() => {
    const m = new Map() // events are newest-first, so first hit = latest event
    for (const e of events) if (!m.has(e.sessionId) && now - e.ts < ACTIVE_WINDOW) m.set(e.sessionId, e)
    return [...m.values()]
  }, [events, now])

  const perMin = events.filter((e) => now - e.ts < 60000).length
  const guests = sessions.filter((s) => s.isGuest).length
  const topPages = useMemo(() => {
    const c = {}
    for (const e of events) if (e.path && now - e.ts < ACTIVE_WINDOW) c[e.path] = (c[e.path] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [events, now])

  const types = [...new Set(events.map((e) => e.event))]
  // Search: every word must appear in the user label, ids, event sentence, page, device or browser.
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = (e) => {
    if (!terms.length) return true
    const hay = `${who(e)} ${e.userId || ''} ${e.sessionId} ${describe(e)} ${e.path || ''} ${e.device || ''} ${e.browser || ''}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  }
  const byType = filter === 'all' ? events : events.filter((e) => e.event === filter)
  const feed = byType.filter(matches)
  // a session is shown if ANY of its buffered events match (not only its latest one)
  const matchedSessions = new Set(events.filter(matches).map((e) => e.sessionId))
  const visibleSessions = terms.length ? sessions.filter((s) => matchedSessions.has(s.sessionId)) : sessions

  const stat = (label, value, sub) => (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
    </Card>
  )

  return (
    <>
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onNavigate?.('home')} className="text-xs text-slate-400 hover:text-slate-600">← Home</button>
        <h1 className="text-lg font-bold text-slate-900">Live</h1>
        <LiveBadge status={status} />
        <div className="relative ml-auto w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, session, event or page…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400">Active users</p>
          <p className="text-2xl font-bold text-slate-900">{active}</p>
          <Sparkline data={history} height={32} />
        </Card>
        {stat('Events / min', perMin)}
        {stat('Known vs guest', `${sessions.length - guests} / ${guests}`, 'active sessions')}
        {stat('Top page now', topPages[0]?.[0] || '—', topPages[0] ? `${topPages[0][1]} events` : '')}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="p-6 xl:col-span-2">
          <p className="mb-3 text-base font-bold text-slate-900">Active sessions <span className="text-xs font-normal text-slate-400">({visibleSessions.length})</span></p>
          {visibleSessions.length === 0 && <p className="py-6 text-center text-xs text-slate-400">{terms.length ? 'No active sessions match your search' : 'No active sessions'}</p>}
          {visibleSessions.map((s) => (
            <div key={s.sessionId} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{who(s)}{recFor(s) && <span className="ml-2 text-[10px] font-semibold text-red-500">● REC</span>}</p>
                <p className="truncate text-xs text-slate-400">
                  {describe(s)} · {timeAgo(s.ts, now)}
                </p>
              </div>
              <button
                disabled={!recFor(s)}
                title={s.isGuest ? 'Replay is recorded for signed-in users only' : recFor(s) ? 'Watch session' : 'No recording received yet'}
                onClick={() => setWatching({ ...s, sessionId: recFor(s).sessionId, pages: s.path ? [s.path] : [] })}
                className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ▶ Watch
              </button>
            </div>
          ))}
        </Card>

        <Card className="p-6 xl:col-span-3">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-base font-bold text-slate-900">Event feed</p>
            {['all', ...types].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${filter === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}
              >
                {t === 'all' ? 'All' : eventMeta(t).label}
              </button>
            ))}
          </div>
          {terms.length > 0 && (
            <p className="mb-2 text-xs text-slate-400">Showing {feed.length} of {byType.length} events</p>
          )}
          <div className="max-h-[480px] overflow-y-auto">
            {feed.length === 0 && <p className="py-6 text-center text-xs text-slate-400">{terms.length ? 'No events match your search' : 'Waiting for activity…'}</p>}
            {feed.map((ev) => <FeedRow key={ev.id} ev={ev} now={now} />)}
          </div>
        </Card>
      </div>
    </div>

    {watching && (
      <div className="fixed inset-0 z-40 bg-white">
        <LiveSessionPlayer session={watching} onClose={() => setWatching(null)} />
      </div>
    )}
    </>
  )
}
