import { useState } from 'react'
import { useFilters } from '../../../context/FiltersContext'
import {
  fetchRecordedUsers,
  fetchSessions,
} from '../../../services/sessionReplayApi'
import { useAsync } from '../../../hooks/useAsync'
import SessionPlayer from './SessionPlayer'

function isGuestUser(user) {
  return (
    user?.isGuest === true ||
    String(user?.userId || '').startsWith('guest_')
  )
}

function getUserLabel(user) {
  if (isGuestUser(user)) {
    const shortId = String(user?.userId || '')
      .replace(/^guest_/, '')
      .slice(0, 8)

    return shortId ? `Guest · ${shortId}` : 'Guest'
  }

  return user?.name?.trim() || user?.email?.trim() || 'Unnamed user'
}

function getUserSubtitle(user) {
  return isGuestUser(user)
    ? 'Anonymous visitor'
    : user?.email?.trim() || 'No email available'
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function Chevron({ back = false }) {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={back ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  )
}

export default function SessionReplayPage() {
  const {
    period,
    customRange,
    selectedPersonas = [],
  } = useFilters()

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [openSession, setOpenSession] = useState(null)

  const usersFilters = {
    period,
    customRange,
    personas: selectedPersonas,
    search,
  }

  const {
    data: users,
    loading: usersLoading,
    error: usersError,
  } = useAsync(
    () => fetchRecordedUsers(usersFilters),
    [period, customRange, selectedPersonas.join(','), search]
  )

  const sessionsFilters = {
    period,
    customRange,
    personas: selectedPersonas,
    userId: selectedUser?.userId,
  }

  const {
    data: sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useAsync(
    () =>
      selectedUser
        ? fetchSessions(sessionsFilters)
        : Promise.resolve([]),
    [
      period,
      customRange,
      selectedPersonas.join(','),
      selectedUser?.userId,
    ]
  )

  // Accept either an extracted array or the API response envelope.
  const userList = Array.isArray(users)
    ? users
    : Array.isArray(users?.users)
      ? users.users
      : []

  const sessionList = Array.isArray(sessions)
    ? sessions
    : Array.isArray(sessions?.sessions)
      ? sessions.sessions
      : []

  function openReplay(session) {
    setOpenSession({
      ...session,
      userId: session.userId || selectedUser?.userId,
      name: getUserLabel(selectedUser),
      email: selectedUser?.email || null,
      isGuest: isGuestUser(selectedUser),
    })
  }

  if (openSession) {
    return (
      <SessionPlayer
        session={openSession}
        onClose={() => setOpenSession(null)}
      />
    )
  }

  // Level 2: selected user's sessions.
  if (selectedUser) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <Chevron back />
            All users
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-bold text-slate-900">
                {getUserLabel(selectedUser)}
              </p>

              {isGuestUser(selectedUser) && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Guest
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {getUserSubtitle(selectedUser)}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {sessionsLoading && (
            <p className="py-12 text-center text-xs text-slate-400">
              Loading sessions…
            </p>
          )}

          {!sessionsLoading && sessionsError && (
            <p className="py-12 text-center text-xs text-red-500">
              Unable to load sessions.
            </p>
          )}

          {!sessionsLoading && !sessionsError && (
            sessionList.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No recorded sessions found.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try changing the date range or filters.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[720px]">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    {[
                      'Session ID',
                      'Pages Visited',
                      'Duration',
                      'Recorded At',
                      'Replay',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {sessionList.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="group cursor-pointer border-t border-slate-50 transition-colors hover:bg-slate-50"
                      onClick={() => openReplay(session)}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">
                        {session.sessionId}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-500">
                        {Array.isArray(session.pages)
                          ? session.pages.join(', ') || '—'
                          : '—'}
                      </td>

                      <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                        {session.duration ?? '—'}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-400">
                        {formatDate(session.createdAt)}
                      </td>

                      <td className="px-5 py-3">
                        <button
                          type="button"
                          aria-label={`Play session ${session.sessionId}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            openReplay(session)
                          }}
                          className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                        >
                          <Chevron />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    )
  }

  // Level 1: all recorded users, including guests.
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
        <input
          type="search"
          aria-label="Search recorded users"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-72"
          placeholder="Search name, email, or user ID…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span className="ml-auto text-xs text-slate-400">
          {usersLoading
            ? 'Loading…'
            : usersError
              ? 'Count unavailable'
              : `${userList.length} user${userList.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {usersLoading && (
          <p className="py-12 text-center text-xs text-slate-400">
            Loading users…
          </p>
        )}

        {!usersLoading && usersError && (
          <p className="py-12 text-center text-xs text-red-500">
            Unable to load users.
          </p>
        )}

        {!usersLoading && !usersError && (
          userList.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                No recorded users found.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try changing your search, date range, or filters.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[720px]">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  {[
                    'User',
                    'User ID',
                    'Sessions',
                    'Last Active',
                    'View',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {userList.map((user) => (
                  <tr
                    key={user.userId}
                    className="group cursor-pointer border-t border-slate-50 transition-colors hover:bg-slate-50"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {getUserLabel(user)}
                        </span>

                        {isGuestUser(user) && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Guest
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {getUserSubtitle(user)}
                      </p>
                    </td>

                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {user.userId || '—'}
                    </td>

                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                      {user.sessionCount ?? 0}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-400">
                      {formatDate(user.lastActivity)}
                    </td>

                    <td className="px-5 py-3">
                      <button
                        type="button"
                        aria-label={`View sessions for ${getUserLabel(user)}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedUser(user)
                        }}
                        className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                      >
                        <Chevron />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}