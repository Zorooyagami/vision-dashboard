import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/home/shared'
import LiveSessionPlayer from '../components/live/LiveSessionPlayer'
import { useLiveStream } from '../hooks/useLiveStream'
import { apiFetch } from '../services/apiClient'
import {
  LiveBadge,
  Sparkline,
  FeedRow,
  eventMeta,
  who,
  describe,
  timeAgo,
} from '../components/live/liveShared'

const ACTIVE_WINDOW = 5 * 60 * 1000

function getReplayUserId(session) {
  return session?.userId || session?.anonymousId || null
}

function isGuestSession(session) {
  return (
    session?.isGuest === true ||
    String(getReplayUserId(session) || '').startsWith('guest_') ||
    (!session?.userId && Boolean(session?.anonymousId))
  )
}

function getUserLabel(session) {
  if (!isGuestSession(session)) return who(session)

  const shortId = String(getReplayUserId(session) || '')
    .replace(/^guest_/, '')
    .slice(0, 8)

  return shortId ? `Guest · ${shortId}` : 'Guest'
}

function getTimestamp(value) {
  if (typeof value === 'number') return value

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export default function Live({ onNavigate }) {
  const {
    events = [],
    active,
    history,
    status,
    now,
    recordings = {},
  } = useLiveStream()

  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [watching, setWatching] = useState(null)
  const [looking, setLooking] = useState(null)
  const [watchNote, setWatchNote] = useState(null)

  // Analytics events of a guest carry no user id, only the SDK session id. The recorder
  // shares that session id, so a recording can be matched to a feed row through it.
  const recordingsBySession = useMemo(
    () =>
      Object.fromEntries(
        Object.values(recordings)
          .filter((recording) => recording?.sessionId)
          .map((recording) => [recording.sessionId, recording])
      ),
    [recordings]
  )

  const recFor = (session) => {
    const userId = getReplayUserId(session)
    return (
      (userId && recordings[userId]) ||
      recordingsBySession[session.sessionId] ||
      null
    )
  }

  const openPlayer = (session, recordingSessionId) => {
    setWatching({
      ...session,
      userId: getReplayUserId(session),
      name: getUserLabel(session),
      isGuest: isGuestSession(session),
      sessionId: recordingSessionId,
      pages: session.path ? [session.path] : [],
    })
  }

  const handleWatch = async (session) => {
    setWatchNote(null)

    const userId = getReplayUserId(session)
    const recording = recFor(session)

    if (recording?.sessionId) {
      openPlayer(session, recording.sessionId)
      return
    }

    // Guest with no live recording signal (recording not started yet, or the signal
    // expired). Their recording uses the SDK session id, so open that id directly.
    // The player keeps retrying until the recording exists.
    if (!userId) {
      openPlayer(session, session.sessionId)
      return
    }

    setLooking(session.sessionId)

    try {
      const data = await apiFetch(
        `/api/record/users/${encodeURIComponent(userId)}/sessions`
      )

      const storedSessions = Array.isArray(data)
        ? data
        : Array.isArray(data?.sessions)
          ? data.sessions
          : []

      const playableSessions = storedSessions
        .filter((item) => item.sessionId && item.chunkCount > 0)
        .sort(
          (a, b) =>
            getTimestamp(b.updatedAt || b.createdAt) -
            getTimestamp(a.updatedAt || a.createdAt)
        )

      // Prefer an exact match when analytics and recording share a session ID.
      // Otherwise preserve the existing fallback to this visitor's latest replay.
      const recordingSession =
        playableSessions.find(
          (item) => item.sessionId === session.sessionId
        ) || playableSessions[0]

      if (recordingSession) {
        openPlayer(session, recordingSession.sessionId)
      } else {
        setWatchNote({
          sessionId: session.sessionId,
          text:
            'No recording stored for this visitor yet. Guests and signed-in ' +
            'users can be recorded on enabled pages. If recording has just ' +
            'started, wait a few seconds and try again.',
        })
      }
    } catch (error) {
      console.error('[Live] recording lookup failed', error)

      setWatchNote({
        sessionId: session.sessionId,
        text: `Could not look up the recording (${
          error?.message || 'Unknown error'
        }).`,
      })
    } finally {
      setLooking(null)
    }
  }

  // Live signal for whoever is being watched: by user id, or by session id for guests.
  const liveRec = watching
    ? (watching.userId && recordings[watching.userId]) ||
      recordingsBySession[watching.sessionId] ||
      null
    : null

  const liveRecordingSessionId = liveRec?.sessionId
  const watchingUserId = watching?.userId

  // Follow a new recording signal for the visitor currently being watched.
  useEffect(() => {
    if (!liveRecordingSessionId || !watchingUserId) return

    setWatching((current) => {
      if (
        !current ||
        current.userId !== watchingUserId ||
        current.sessionId === liveRecordingSessionId
      ) {
        return current
      }

      return {
        ...current,
        sessionId: liveRecordingSessionId,
      }
    })
  }, [liveRecordingSessionId, watchingUserId])

  const sessions = useMemo(() => {
    const latestBySession = new Map()

    for (const event of events) {
      if (!event.sessionId) continue

      const timestamp = getTimestamp(event.ts)
      if (!timestamp || now - timestamp >= ACTIVE_WINDOW) continue

      const previous = latestBySession.get(event.sessionId)

      if (!previous || timestamp > getTimestamp(previous.ts)) {
        latestBySession.set(event.sessionId, event)
      }
    }

    return [...latestBySession.values()].sort(
      (a, b) => getTimestamp(b.ts) - getTimestamp(a.ts)
    )
  }, [events, now])

  const perMin = events.filter(
    (event) => now - getTimestamp(event.ts) < 60000
  ).length

  const guests = sessions.filter(isGuestSession).length

  const topPages = useMemo(() => {
    const counts = new Map()

    for (const event of events) {
      if (
        event.path &&
        now - getTimestamp(event.ts) < ACTIVE_WINDOW
      ) {
        counts.set(event.path, (counts.get(event.path) || 0) + 1)
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [events, now])

  const types = [
    ...new Set(events.map((event) => event.event).filter(Boolean)),
  ]

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  const matches = (event) => {
    if (!terms.length) return true

    const searchableText = [
      getUserLabel(event),
      event.userId,
      event.anonymousId,
      event.sessionId,
      describe(event),
      event.path,
      event.device,
      event.browser,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return terms.every((term) => searchableText.includes(term))
  }

  const byType =
    filter === 'all'
      ? events
      : events.filter((event) => event.event === filter)

  const feed = byType.filter(matches)

  // Match any buffered event in the session, not just its latest event.
  const matchedSessions = new Set(
    events.filter(matches).map((event) => event.sessionId)
  )

  const visibleSessions = terms.length
    ? sessions.filter((session) =>
        matchedSessions.has(session.sessionId)
      )
    : sessions

  const stat = (label, value, sub) => (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>

      {sub && (
        <p className="truncate text-xs text-slate-400">{sub}</p>
      )}
    </Card>
  )

  return (
    <>
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ← Home
          </button>

          <h1 className="text-lg font-bold text-slate-900">
            Live
          </h1>

          <LiveBadge status={status} />

          <div className="relative ml-auto w-full sm:w-80">
            <input
              type="search"
              aria-label="Search live activity"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search user, session, event or page…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />

            {query && (
              <button
                type="button"
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
            <p className="text-xs text-slate-400">
              Active users
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {active}
            </p>
            <Sparkline data={history} height={32} />
          </Card>

          {stat('Events / min', perMin)}

          {stat(
            'Known vs guest',
            `${sessions.length - guests} / ${guests}`,
            'active sessions'
          )}

          {stat(
            'Top page now',
            topPages[0]?.[0] || '—',
            topPages[0] ? `${topPages[0][1]} events` : ''
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Card className="p-6 xl:col-span-2">
            <p className="mb-3 text-base font-bold text-slate-900">
              Active sessions{' '}
              <span className="text-xs font-normal text-slate-400">
                ({visibleSessions.length})
              </span>
            </p>

            {visibleSessions.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">
                {terms.length
                  ? 'No active sessions match your search'
                  : 'No active sessions'}
              </p>
            )}

            {visibleSessions.map((session) => {
              const recording = recFor(session)
              const replayUserId = getReplayUserId(session)
              const isLooking = looking === session.sessionId

              return (
                <div
                  key={session.sessionId}
                  className="border-b border-slate-100 py-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getUserLabel(session)}

                        {recording?.sessionId && (
                          <span className="ml-2 text-[10px] font-semibold text-red-500">
                            ● REC
                          </span>
                        )}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {describe(session)} ·{' '}
                        {timeAgo(session.ts, now)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={looking !== null}
                      title={
                        recording?.sessionId
                          ? 'Watch session'
                          : replayUserId
                            ? "Look for this visitor's latest recording"
                            : 'Open this guest session’s recording'
                      }
                      onClick={() => handleWatch(session)}
                      className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isLooking ? 'Looking…' : '▶ Watch'}
                    </button>
                  </div>

                  {watchNote?.sessionId === session.sessionId && (
                    <p
                      role="status"
                      className="mt-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700"
                    >
                      {watchNote.text}
                    </p>
                  )}
                </div>
              )
            })}
          </Card>

          <Card className="p-6 xl:col-span-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="mr-2 text-base font-bold text-slate-900">
                Event feed
              </p>

              {['all', ...types].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${
                    filter === type
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                  }`}
                >
                  {type === 'all' ? 'All' : eventMeta(type).label}
                </button>
              ))}
            </div>

            {terms.length > 0 && (
              <p className="mb-2 text-xs text-slate-400">
                Showing {feed.length} of {byType.length} events
              </p>
            )}

            <div className="max-h-[480px] overflow-y-auto">
              {feed.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  {terms.length
                    ? 'No events match your search'
                    : 'Waiting for activity…'}
                </p>
              )}

              {feed.map((event) => (
                <FeedRow
                  key={event.id}
                  ev={event}
                  now={now}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {watching && (
        <div className="fixed inset-0 z-40 bg-white">
          <LiveSessionPlayer
            session={watching}
            onClose={() => setWatching(null)}
            initialMode="live"
            liveSignal={liveRec?.ts}
          />
        </div>
      )}
    </>
  )
}
