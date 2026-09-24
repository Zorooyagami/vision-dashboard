import { useState } from 'react'
import { useFilters } from '../../../context/FiltersContext'
import { fetchRecordedUsers, fetchSessions } from '../../../services/sessionReplayApi'
import { useAsync } from '../../../hooks/useAsync' // small generic hook, see below
import SessionPlayer from './SessionPlayer'

export default function SessionReplayPage() {
  const { period, customRange } = useFilters()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null) // { userId, name, email }
  const [openSession, setOpenSession] = useState(null)

  const usersFilters = { period, customRange, search }
  const { data: users, loading: usersLoading, error: usersError } = useAsync(
    () => fetchRecordedUsers(usersFilters),
    [period, customRange, search]
  )

  const sessionsFilters = { period, customRange, userId: selectedUser?.userId }
  const { data: sessions, loading: sessionsLoading, error: sessionsError } = useAsync(
    () => selectedUser ? fetchSessions(sessionsFilters) : Promise.resolve([]),
    [period, customRange, selectedUser?.userId]
  )

  if (openSession) {
    return <SessionPlayer session={openSession} onClose={() => setOpenSession(null)} />
  }

  // ── Level 2: this user's sessions ──
  if (selectedUser) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="shrink-0 px-6 py-3 border-b bg-white flex items-center gap-3" style={{ borderColor: '#F1F5F9' }}>
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            All users
          </button>
          <div className="w-px h-5" style={{ background: '#E2E8F0' }} />
          <div>
            <p className="text-sm font-bold text-slate-900">{selectedUser.name || selectedUser.userId}</p>
            <p className="text-[11px] text-slate-400">{selectedUser.email || '—'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessionsLoading && <p className="text-xs text-slate-400 text-center py-12">Loading sessions…</p>}
          {sessionsError && <p className="text-xs text-red-500 text-center py-12">Unable to load sessions.</p>}
          {!sessionsLoading && !sessionsError && (
            <table className="w-full">
              <thead className="sticky top-0 z-10" style={{ background: '#F8FAFC' }}>
                <tr>
                  {['Session ID', 'Pages Visited', 'Duration', 'Recorded At', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(sessions || []).map(s => (
                  <tr
                    key={s.sessionId}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    style={{ borderTop: '1px solid #F8FAFC' }}
                    onClick={() => setOpenSession(s)}
                  >
                    <td className="px-5 py-3 text-xs font-mono text-slate-600">{s.sessionId}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{s.pages.join(', ') || '—'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">{s.duration}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
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

  // ── Level 1: all users ──
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="shrink-0 px-6 py-3 border-b bg-white flex items-center gap-3" style={{ borderColor: '#F1F5F9' }}>
        <input
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          style={{ borderColor: '#E2E8F0', minWidth: 220 }}
          placeholder="Search name, email, or user ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="ml-auto text-xs text-slate-400">{(users || []).length} user{(users || []).length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {usersLoading && <p className="text-xs text-slate-400 text-center py-12">Loading users…</p>}
        {usersError && <p className="text-xs text-red-500 text-center py-12">Unable to load users.</p>}
        {!usersLoading && !usersError && (
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ background: '#F8FAFC' }}>
              <tr>
                {['User', 'User ID', 'Sessions', 'Last Active', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users || []).map(u => (
                <tr
                  key={u.userId}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  style={{ borderTop: '1px solid #F8FAFC' }}
                  onClick={() => setSelectedUser(u)}
                >
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-slate-800">{u.name || 'Unknown'}</span>
                    <p className="text-[11px] text-slate-400">{u.email || '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">{u.userId}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-700">{u.sessionCount}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(u.lastActivity).toLocaleString()}</td>
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