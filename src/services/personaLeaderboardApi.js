import { apiFetch } from './apiClient'

const API_BASE = '/api/admin'

export async function fetchPersonaLeaderboard({ period, customRange, platform, device } = {}) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }

  const data = await apiFetch(`${API_BASE}/revenue/breakdown?${params.toString()}`)
  return data?.rows || []
}
