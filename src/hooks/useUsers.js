// src/hooks/useUsers.js
import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from './../services/apiClient'


// ---------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------
function buildQuery(filters = {}, extra = {}) {
  const { period, customRange, platform, device, selectedPersonas } = filters
  const params = new URLSearchParams()

  if (period) params.set('period', period)
  if (period === 'custom' && customRange?.from) params.set('from', customRange.from)
  if (period === 'custom' && customRange?.to) params.set('to', customRange.to)
  if (platform && platform !== 'all') params.set('platform', platform)
  if (device && device !== 'all') params.set('device', device)
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','))

  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v)
  })

  return params.toString()
}

// ---------------------------------------------------------------------
// Low-level fetch helper
//
// apiFetch may return either:
//   (a) a Response object (fetch-style), or
//   (b) an already-parsed JSON body (wrapper-style).
// We handle both so the hook never throws "HTTP undefined".
// ---------------------------------------------------------------------
async function getJson(path) {
  const url = path
  let res

  try {
    res = await apiFetch(url)
  } catch (err) {
    // Network error, CORS failure, or apiFetch threw on non-2xx.
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(msg || 'Network request failed')
  }

  // Case (b): apiFetch already returned parsed data.
  // A real Response always has a numeric `status` and a boolean `ok`.
  const isResponse =
    res &&
    typeof res === 'object' &&
    typeof res.status === 'number' &&
    typeof res.ok === 'boolean'

  if (!isResponse) {
    return res
  }

  // Case (a): we still need to check status and parse.
  if (!res.ok) {
    const status = res.status ?? 0
    let detail = ''
    try {
      const body = await res.text()
      if (body) detail = ` — ${body.slice(0, 160)}`
    } catch {
      // ignore body-read failures
    }
    throw new Error(`HTTP ${status || 'network error'}${detail}`)
  }

  return res.json()
}

// ---------------------------------------------------------------------
// Users list
// ---------------------------------------------------------------------
export function useUsers(filters, { search = '', sort = 'lastActive' } = {}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const query = buildQuery(filters, { search, sort })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const path = `/api/explore/users${query ? `?${query}` : ''}`

    getJson(path)
      .then((data) => {
        if (cancelled) return
        // Support both { users: [...] } and a bare array.
        const list = Array.isArray(data) ? data : (data?.users ?? [])
        setUsers(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  return { users, loading, error }
}

// ---------------------------------------------------------------------
// Events for a single user (detail panel)
// ---------------------------------------------------------------------
export function useUserEvents(userId, filters) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const query = buildQuery(filters, { limit: 300 })

  const load = useCallback(() => {
    if (!userId) {
      setEvents([])
      return Promise.resolve()
    }

    setLoading(true)
    setError(null)

    const path = `/api/explore/users/${encodeURIComponent(userId)}/events${
      query ? `?${query}` : ''
    }`

    return getJson(path)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.events ?? [])
        setEvents(list)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId, query])

  useEffect(() => {
    load()
  }, [load])

  return { events, loading, error, reload: load }
}