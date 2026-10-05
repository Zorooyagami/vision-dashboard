// src/components/explore/users/UserDetailPanel.jsx
import { useMemo, useState } from 'react'
import { useUserEvents } from '../../../hooks/useUsers'
import { fmtRelativeTime } from '../exploreUtils'
import { PersonaBadge, fmtMoney, groupBySession } from './userUtils'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#F8FAFC' }}>
      <p className="text-[10px] font-semibold text-slate-400 tracking-wide">{label.toUpperCase()}</p>
      <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  )
}

function EventRow({ event }) {
  const [open, setOpen] = useState(false)
  const props = event.properties || {}
  const hasProps = Object.keys(props).length > 0
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="border-l-2 pl-3 py-1.5" style={{ borderColor: '#E2E8F0' }}>
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen(!open)}>
        <span className="text-sm font-mono font-semibold text-slate-800">{event.event}</span>
        <span className="text-[11px] text-slate-400">{time}</span>
      </button>
      <p className="text-[11px] text-slate-400 truncate">{event.path || event.url}</p>

      {open && (
        <div className="mt-2 space-y-2">
          {hasProps && (
            <pre className="text-[11px] rounded-lg p-2 overflow-x-auto" style={{ background: '#F8FAFC', color: '#334155' }}>
              {JSON.stringify(props, null, 2)}
            </pre>
          )}
          {event.deviceInfo && (
            <p className="text-[11px] text-slate-500">
              {[event.deviceInfo.deviceType, event.deviceInfo.os, event.deviceInfo.browser].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function UserDetailPanel({ user, filters, onClose }) {
  const { events, loading, error } = useUserEvents(user.userId, filters)
  const [hideNoise, setHideNoise] = useState(true)

  // heatmap_move fires constantly; hide it (and clicks) by default so the timeline stays readable
  const visible = useMemo(
    () => (hideNoise ? events.filter((e) => !e.event.startsWith('heatmap_')) : events),
    [events, hideNoise]
  )
  const sessions = useMemo(() => groupBySession(visible), [visible])

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(15,23,42,0.35)' }} onClick={onClose}>
      <aside
        className="w-full max-w-md h-full bg-white overflow-y-auto p-6 space-y-5"
        style={{ boxShadow: '-4px 0 24px rgba(15,23,42,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{user.name || user.email || 'Unnamed user'}</h2>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{user.userId}</p>
            <div className="mt-2"><PersonaBadge persona={user.persona} /></div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" aria-label="Close">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total revenue" value={fmtMoney(user.revenue)} />
          <Stat label="Orders" value={user.orders ?? 0} />
          <Stat label="Sessions" value={user.sessions ?? 0} />
          <Stat label="Last active" value={fmtRelativeTime(user.lastActive)} />
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 tracking-wide">EVENT TIMELINE</h3>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
              <input type="checkbox" checked={hideNoise} onChange={(e) => setHideNoise(e.target.checked)} />
              Hide heatmap events
            </label>
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
              Unable to load events. {error}
            </div>
          )}
          {loading && <p className="text-xs text-slate-400">Loading events...</p>}
          {!loading && !error && sessions.length === 0 && (
            <p className="text-xs text-slate-400">No events in this period.</p>
          )}

          <div className="space-y-5">
            {sessions.map(({ sessionId, items }) => (
              <div key={sessionId}>
                <p className="text-[11px] font-semibold text-slate-500 mb-1">
                  Session <span className="font-mono">{sessionId.slice(0, 8)}</span>
                  {' · '}{new Date(items[0].timestamp).toLocaleString()}
                  {' · '}{items.length} events
                </p>
                <div className="space-y-1">
                  {items.map((e, i) => <EventRow key={`${e.timestamp}-${i}`} event={e} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default UserDetailPanel
