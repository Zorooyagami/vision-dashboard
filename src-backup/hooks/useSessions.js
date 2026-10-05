// src/hooks/useSessions.js
import { useState, useEffect } from 'react'
import { fetchSessions } from '../services/sessionReplayApi'

export function useSessions(filters) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSessions(filters)
      .then((res) => { if (!cancelled) setSessions(res) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filters.period, filters.customRange, JSON.stringify(filters.selectedPersonas), filters.search])

  return { sessions, loading, error }
}