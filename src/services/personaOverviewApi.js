// src/services/personaOverviewApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const API_BASE = `${API_BASE_URL}/api/admin`

export async function fetchPersonaOverview({ period, customRange, platform, device } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  const res = await fetch(`${API_BASE}/personas/overview?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch persona overview')
  const data = await res.json()
  return data.rows
}