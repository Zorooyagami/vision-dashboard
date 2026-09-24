// src/services/sessionReplayApi.js — add fetchRecordedUsers, extend fetchSessions
const API_BASE_URL =  'http://localhost:4000'
const API_BASE = `${API_BASE_URL}/api/record`

export async function fetchRecordedUsers({ period, customRange, search } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  if (search) params.set('search', search)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  const res = await fetch(`${API_BASE}/recorded-users?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch users')
  const data = await res.json()
  return data.users
}

export async function fetchSessions({ period, customRange, userId, search } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  if (userId) params.set('userId', userId)
  if (search) params.set('search', search)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  const res = await fetch(`${API_BASE}/sessions?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch sessions')
  const data = await res.json()
  return data.sessions
}