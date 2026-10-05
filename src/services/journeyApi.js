import { apiFetch } from './apiClient'

const API_BASE = '/api/admin'

function buildParams({ period, customRange, platform, selectedPersonas, device }) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','))
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  return params
}

export async function fetchTopPaths(filters, limit = 4) {
  const params = buildParams(filters)
  params.set('limit', String(limit))
  return apiFetch(`${API_BASE}/journeys/top-paths?${params.toString()}`)
}

export async function fetchPathDetail(filters, nodes) {
  const params = buildParams(filters)
  params.set('path', nodes.join(','))
  return apiFetch(`${API_BASE}/journeys/path-detail?${params.toString()}`)
}

export async function fetchJourneyFlow(filters) {
  const params = buildParams(filters)
  return apiFetch(`${API_BASE}/journeys/flow?${params.toString()}`)
}
