import { apiFetch } from './apiClient'

const API_BASE = '/api/admin'

function buildParams({ period, customRange, platform, device }) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (device) params.set('device', device)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  return params
}

export async function fetchRevenueBreakdown(filters) {
  const data = await apiFetch(`${API_BASE}/revenue/breakdown?${buildParams(filters)}`)
  return data?.rows || []
}

export async function fetchStackedRevenue(filters) {
  const data = await apiFetch(`${API_BASE}/revenue/stacked?${buildParams(filters)}`)
  return data?.monthly || {}
}
