// src/components/live/LiveSessionPlayer.jsx
// Watch a session that is still being recorded. Two modes:
//   "start": play the whole journey from the beginning (default, no interruptions)
//   "live":  keep the player at the latest moment, refreshing as new chunks arrive
import { useEffect, useRef, useState } from 'react'
import 'rrweb-player/dist/style.css'
import { apiRequest } from '../../services/apiClient'
import { LiveBadge } from './liveShared'

const API_BASE = '/api/record'
const POLL_MS = 5000
const TAIL_MS = 2000 // in live mode, start this far before the end

const fmtSpan = (secs) => `${Math.floor(secs / 60)}m ${secs % 60}s`

// liveSignal: changes every time the server reports a new chunk for this user, so we
// fetch immediately instead of waiting for the next poll.
export default function LiveSessionPlayer({ session, onClose, initialMode = 'start', liveSignal = null }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const latestRef = useRef([])
  const shownRef = useRef(0)
  const modeRef = useRef(initialMode)
  const refreshRef = useRef(() => {})
  const switchRef = useRef(() => {})

  const [status, setStatus] = useState('waiting') // waiting | ready | error
  const [mode, setMode] = useState(initialMode)
  const [shown, setShown] = useState(0)
  const [available, setAvailable] = useState(0)
  const [span, setSpan] = useState(0) // seconds of recording loaded into the player

  useEffect(() => {
    let cancelled = false
    let timer = null
    let RRWebPlayer = null

    const rebuild = (events) => {
      const el = containerRef.current
      if (!el || !RRWebPlayer || events.length < 2) return
      const rect = el.getBoundingClientRect()
      const total = events[events.length - 1].timestamp - events[0].timestamp
      const live = modeRef.current === 'live'
      playerRef.current?.$destroy?.()
      const player = new RRWebPlayer({
        target: el,
        props: {
          events,
          width: Math.max(Math.floor(rect.width), 320),
          height: Math.max(Math.floor(rect.height - 70), 360),
          autoPlay: !live, // "from start" plays straight away
          skipInactive: !live, // skip long idle gaps when reviewing the whole journey
          showController: true,
        },
      })
      playerRef.current = player
      shownRef.current = events.length
      setShown(events.length)
      setSpan(Math.round(total / 1000))
      setStatus('ready')
      if (live) {
        setTimeout(() => {
          try { player.goto(Math.max(total - TAIL_MS, 0), true) } catch (e) { console.warn('[live replay] goto failed', e) }
        }, 50)
      }
    }

    switchRef.current = (m) => {
      modeRef.current = m
      setMode(m)
      rebuild(latestRef.current)
    }

    let inflight = false
    let queued = false
    const tick = async () => {
      if (inflight) { queued = true; return } // a signal arrived mid-request: run once more after it
      inflight = true
      clearTimeout(timer)
      try {
        const res = await apiRequest(`${API_BASE}/${encodeURIComponent(session.sessionId)}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const { events } = await res.json()
        if (cancelled) return
        const list = events || []
        latestRef.current = list
        setAvailable(list.length)
        const changed = list.length !== shownRef.current
        // first load always builds; later refreshes only in live mode (never interrupt a review)
        if (list.length >= 2 && (!playerRef.current || (changed && modeRef.current === 'live'))) rebuild(list)
      } catch (err) {
        console.error('[LiveSessionPlayer] poll failed', err)
        if (!cancelled && !playerRef.current) setStatus('error')
      } finally {
        inflight = false
        if (!cancelled) {
          if (queued) { queued = false; tick() } else timer = setTimeout(tick, POLL_MS)
        }
      }
    }
    refreshRef.current = () => { if (RRWebPlayer && !cancelled) tick() }

    import('rrweb-player').then((m) => {
      if (cancelled) return
      RRWebPlayer = m.default
      tick()
    })

    return () => {
      cancelled = true
      clearTimeout(timer)
      playerRef.current?.$destroy?.()
      playerRef.current = null
    }
  }, [session.sessionId])

  // New chunk reported by the server -> fetch now (the 5s poll stays as a fallback).
  useEffect(() => {
    if (liveSignal) refreshRef.current()
  }, [liveSignal])

  const pending = mode === 'start' && available > shown
  const seg = (m, label) => (
    <button
      type="button"
      onClick={() => m !== mode && switchRef.current(m)}
      className={`px-3 py-1.5 text-sm font-medium ${mode === m ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Live session</h2>
            <LiveBadge status="live" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {session.name || session.email || session.userId || 'Guest'} · {session.sessionId}
            {status === 'ready' && ` · ${fmtSpan(span)} recorded`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending && (
            <button
              type="button"
              onClick={() => switchRef.current('live')}
              className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              New activity · Go live
            </button>
          )}
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            {seg('start', '▶ From start')}
            {seg('live', '● Live')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 bg-slate-50 p-5">
        <div className="relative flex min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {status === 'waiting' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
                <p className="text-sm text-slate-500">Waiting for the recording to start…</p>
                <p className="mt-1 text-xs text-slate-400">Chunks arrive every few seconds</p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-red-500">Failed to load replay — check console/network tab.</p>
            </div>
          )}
          <div ref={containerRef} className="h-full min-h-[500px] w-full min-w-0 [&_.rr-player]:mx-auto" />
        </div>
      </div>
    </div>
  )
}
