import { apiFetch } from './apiClient'

function toQuery(filters = {}) {
  const params = new URLSearchParams()
  params.set('period', filters.period || '30d')
  params.set('platform', filters.platform || 'combined')
  if (filters.device) params.set('device', filters.device)
  if (filters.selectedPersonas?.length) params.set('personas', filters.selectedPersonas.map((p) => String(p).toLowerCase()).join(','))
  if (filters.period === 'custom' && filters.customRange?.from && filters.customRange?.to) {
    params.set('from', filters.customRange.from)
    params.set('to', filters.customRange.to)
  }
  return params.toString()
}

export function getOpportunities(filters) {
  return apiFetch(`/api/opportunities?${toQuery(filters)}`)
}

export function updateOpportunity(key, status, note = '') {
  return apiFetch(`/api/opportunities/${encodeURIComponent(key)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  })
}
