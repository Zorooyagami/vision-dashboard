import { apiFetch } from './apiClient'

const API_BASE = '/api/admin'

export async function fetchFunnel({ period, customRange, platform, selectedPersonas, device }) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','))
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }

  return apiFetch(`${API_BASE}/funnel?${params.toString()}`)
}
