// src/components/explore/users/UsersTab.jsx
import { useState } from 'react'
import { useFilters } from '../../../context/FiltersContext'
import { useUsers } from '../../../hooks/useUsers'
import { fmtVol, fmtRelativeTime } from '../exploreUtils'
import UserDetailPanel from './UserDetailPanel'
import { PersonaBadge, fmtMoney } from './userUtils'

const SORT_OPTIONS = [
  ['lastActive', 'Last active'],
  ['revenue', 'Revenue'],
  ['events', 'Events'],
  ['sessions', 'Sessions'],
]

const PAGE_SIZES = [10, 25, 50, 100]

function UsersTab() {
  const { platform, period, customRange, device, selectedPersonas } = useFilters()
  const filters = { period, customRange, platform, device, selectedPersonas }

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('') // no sort by default -> all users
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { users, loading, error } = useUsers(filters, { search, sort })

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
  const safePage = Math.min(page, totalPages) // clamps if the data shrinks
  const startIdx = (safePage - 1) * pageSize
  const pagedUsers = users.slice(startIdx, startIdx + pageSize)

  const hasActiveFilters = search !== '' || sort !== ''

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleSort(val) {
    setSort((prev) => (prev === val ? '' : val)) // click again to unselect
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSort('')
    setPage(1)
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
            placeholder="Search by user ID, name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {SORT_OPTIONS.map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => handleSort(val)}
              className="px-3.5 py-2 text-xs font-semibold transition-colors"
              style={{
                background: sort === val ? '#6366F1' : '#fff',
                color: sort === val ? '#fff' : '#475569',
              }}
            >{lbl}</button>
          ))}
        </div>
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors"
          style={{
            borderColor: '#E2E8F0',
            background: '#fff',
            color: hasActiveFilters ? '#B91C1C' : '#CBD5E1',
            cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
          }}
        >
          Clear filters
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          Unable to load users. {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <table className="w-full">
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              {['User', 'Persona', 'Sessions', 'Events', 'Orders', 'Total revenue', 'Last active'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-4 py-3 tracking-wide">{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">Loading users...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">No users match these filters.</td></tr>
            )}
            {!loading && pagedUsers.map((user, i) => (
              <tr
                key={user.userId}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' }}
                onClick={() => setSelectedUser(user)}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{user.name || user.email || 'Unnamed user'}</span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{user.userId}</p>
                </td>
                <td className="px-4 py-3"><PersonaBadge persona={user.persona} /></td>
                <td className="px-4 py-3 text-sm font-medium text-slate-600">{fmtVol(user.sessions)}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-600">{fmtVol(user.eventCount)}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-600">{fmtVol(user.orders)}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmtMoney(user.revenue)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmtRelativeTime(user.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        {!loading && users.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 text-xs text-slate-500"
            style={{ borderTop: '1px solid #F1F5F9' }}
          >
            <div className="flex items-center gap-3">
              <span>
                {startIdx + 1}–{Math.min(startIdx + pageSize, users.length)} of {users.length}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-lg border px-2 py-1 text-xs"
                style={{ borderColor: '#E2E8F0' }}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="px-3 py-1.5 rounded-lg border font-semibold"
                style={{
                  borderColor: '#E2E8F0',
                  color: safePage <= 1 ? '#CBD5E1' : '#475569',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Prev
              </button>
              <span>Page {safePage} of {totalPages}</span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 rounded-lg border font-semibold"
                style={{
                  borderColor: '#E2E8F0',
                  color: safePage >= totalPages ? '#CBD5E1' : '#475569',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          filters={filters}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

export default UsersTab