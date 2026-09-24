// src/services/revenueApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const API_BASE = `${API_BASE_URL}/api/admin`

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
  const res = await fetch(`${API_BASE}/revenue/breakdown?${buildParams(filters)}`)
  if (!res.ok) throw new Error('Failed to fetch revenue breakdown')
  const data = await res.json()
  return data.rows
}

export async function fetchStackedRevenue(filters) {
  const res = await fetch(`${API_BASE}/revenue/stacked?${buildParams(filters)}`)
  if (!res.ok) throw new Error('Failed to fetch stacked revenue')
  const data = await res.json()
  return data.monthly
}