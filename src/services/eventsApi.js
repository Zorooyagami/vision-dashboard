//src/services/eventsApi.js
import { apiFetch } from './apiClient'

const API_BASE = '/api/admin'

export async function fetchEvents({ period, customRange, platform, selectedPersonas, device } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','))
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }

  const data = await apiFetch(`${API_BASE}/events?${params.toString()}`)
  return data?.events || []
}

export async function toggleEventStatus(name) {
  return apiFetch(`${API_BASE}/events/${encodeURIComponent(name)}/status`, {
    method: 'PATCH',
  })
}

export async function createEvent({ name, description, category, trigger }) {
  const data = await apiFetch(`${API_BASE}/events`, {
    method: 'POST',
    body: JSON.stringify({ name, description, category, ...(trigger ? { trigger } : {}) }),
  })
  return data?.event
}

// patch: any of { description, category, trigger }. trigger:null removes element tagging.
export async function updateEvent(name, patch) {
  const data = await apiFetch(`${API_BASE}/events/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return data?.event
}

export async function fetchEventDetail(name, { period, customRange, platform, device } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }

  return apiFetch(`${API_BASE}/events/${encodeURIComponent(name)}/detail?${params.toString()}`)
}
