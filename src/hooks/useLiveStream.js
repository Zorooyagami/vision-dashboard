// src/hooks/useLiveStream.js
import { useEffect, useRef, useState } from 'react'
import { useProject } from '../context/ProjectContext'

const MAX_EVENTS = 300
const SPARK_POINTS = 40
import { API_BASE_URL } from '../services/apiClient'

const API_BASE = `${API_BASE_URL}/api/admin`

// Friendly names for what the SDK detects (deviceInfo.os / deviceInfo.browser)
const OS_NAMES = { 'Mac OS': 'Mac', Windows: 'Windows', iOS: 'iOS', Android: 'Android', Linux: 'Linux', 'Chrome OS': 'ChromeOS' }
const BROWSER_NAMES = { Chrome: 'Google Chrome', Firefox: 'Firefox', Safari: 'Safari', Edge: 'Microsoft Edge', Opera: 'Opera', Brave: 'Brave', IE: 'Internet Explorer' }

let seq = 0
const withId = (ev) => ({ ...ev, id: `${ev.sessionId}-${ev.ts}-${seq++}` })

// Connects to GET /live/stream (SSE). EventSource auto-reconnects on drop and
// sends a fresh snapshot each time, so state is simply reset from it.
export function useLiveStream() {
  const { projectId } = useProject()
  const [events, setEvents] = useState([]) // newest first
  const [active, setActive] = useState(0)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('connecting')
  const [recordings, setRecordings] = useState({}) // userId -> { sessionId, ts }
  const [now, setNow] = useState(Date.now())
  const guests = useRef({ sessions: new Map(), counts: new Map() }) // stable guest labels while the dashboard is open

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!projectId) return undefined
    setEvents([])
    setHistory([])
    setActive(0)
    setRecordings({})
    setStatus('connecting')
    guests.current = { sessions: new Map(), counts: new Map() }

    const tag = (raw) => {
      const ev = withId(raw)
      if (ev.isGuest) {
        // Number guests only against others with the same setup (device + OS + browser).
        const g = guests.current
        if (!g.sessions.has(ev.sessionId)) {
          const cfg = [ev.device, OS_NAMES[ev.os] || ev.os, BROWSER_NAMES[ev.browser] || ev.browser].filter(Boolean).join(' - ')
          const n = (g.counts.get(cfg) || 0) + 1
          g.counts.set(cfg, n)
          g.sessions.set(ev.sessionId, { n, cfg })
        }
        const { n, cfg } = g.sessions.get(ev.sessionId)
        ev.guestNo = n
        ev.guestCfg = cfg
      }
      return ev
    }

    const es = new EventSource(`${API_BASE}/live/stream?projectId=${encodeURIComponent(projectId)}`)
    es.onopen = () => setStatus('live')
    es.onerror = () => setStatus('reconnecting')

    es.addEventListener('snapshot', (e) => {
      const d = JSON.parse(e.data)
      // tag oldest-first so numbering follows arrival order
      setEvents((d.events || []).map(tag).reverse())
      setActive(d.active || 0)
      setHistory([d.active || 0])
      setRecordings(Object.fromEntries((d.recordings || []).map((r) => [r.userId, r])))
    })
    es.addEventListener('recording', (e) => {
      const r = JSON.parse(e.data)
      setRecordings((prev) => ({ ...prev, [r.userId]: r }))
    })
    es.addEventListener('live', (e) => {
      const ev = tag(JSON.parse(e.data))
      setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS))
    })
    es.addEventListener('stats', (e) => {
      const d = JSON.parse(e.data)
      setActive(d.active)
      setHistory((h) => [...h, d.active].slice(-SPARK_POINTS))
    })

    return () => es.close()
  }, [projectId])

  return { events, active, history, status, now, recordings }
}
