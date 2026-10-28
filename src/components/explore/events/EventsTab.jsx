// src/components/explore/events/EventsTab.jsx
import { apiFetch } from '../../../services/apiClient'
import { useProject } from '../../../context/ProjectContext'
import { useEffect, useState } from 'react'
import MiniSparkline from '../../MiniSparkline'
import { CATEGORY_META } from '../exploreData'
import { CategoryBadge, fmtVol, fmtRelativeTime } from '../exploreUtils'
import { useFilters } from '../../../context/FiltersContext'
import { useEvents } from '../../../hooks/useEvents'
import EventDetailPanel from './EventDetailPanel'
import AddEventModal from './AddEventModal'

function EventsTab() {
  const { projectId } = useProject()
  const [editingEvent, setEditingEvent] = useState(null)
  const { platform, period, customRange, device, selectedPersonas } = useFilters()
  const filters = { period, customRange, platform, device, selectedPersonas }

  const { events, loading, error, toggleStatus, addEvent, reload } = useEvents(filters)

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [addError, setAddError] = useState(null)
  useEffect(() => { setShowAddModal(false); setEditingEvent(null); setSelectedEvent(null) }, [projectId])

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || e.category === catFilter
    return matchSearch && matchCat
  })

  const grouped = Object.keys(CATEGORY_META).map(cat => ({
    cat,
    items: filtered.filter(e => e.category === cat),
  })).filter(g => g.items.length > 0)

  const handleAdd = async (payload) => {
    if (editingEvent) {
      await apiFetch('/api/tracking/rules/' + encodeURIComponent(editingEvent.name), { method: 'PATCH', body: JSON.stringify(payload) })
      await reload()
    } else await addEvent(payload)
  }

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
          onClick={() => { setEditingEvent(null); setShowAddModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ background: '#6366F1' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add event
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          Unable to load events. {error}
        </div>
      )}

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
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">Loading events...</td></tr>
            )}
            {!loading && grouped.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">No events match this filter.</td></tr>
            )}
            {!loading && grouped.map(({ cat, items }) => (
              items.map((event, i) => (
                <tr
                  key={event.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  style={{ borderTop: i === 0 && cat !== 'browsing' ? '2px solid #F1F5F9' : '1px solid #F8FAFC' }}
                  onClick={() => { setSelectedEvent(event); setMenuOpen(null) }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-slate-800">{event.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[240px] truncate">{event.tracking ? '↗ Click rule · ' + event.tracking.selector : event.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3"><CategoryBadge cat={event.category} categoryMeta={CATEGORY_META} /></td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500">{event.platform}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{fmtVol(event.volume)}</span>
                      <MiniSparkline data={event.spark} color={CATEGORY_META[event.category]?.color} width={40} height={16} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtRelativeTime(event.lastSeen)}</td>
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
                        {event.tracking && <button onClick={() => { setEditingEvent(event); setShowAddModal(true); setMenuOpen(null) }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Edit click rule</button>}
                        <button
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                          style={{ color: '#B91C1C' }}
                          onClick={() => { toggleStatus(event.name); setMenuOpen(null) }}
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
      {showAddModal && (
        <AddEventModal
          key={projectId}
          initialEvent={editingEvent}
          onClose={() => { setShowAddModal(false); setAddError(null) }}
          onAdd={handleAdd}
          error={addError}
        />
      )}
    </div>
  )
}

export default EventsTab