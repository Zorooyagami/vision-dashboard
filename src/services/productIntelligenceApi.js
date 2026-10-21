import { apiFetch } from './apiClient'

export async function fetchProductIntelligence({ period, customRange, platform, device, selectedPersonas }) {
  const params = new URLSearchParams()
  params.set('period', period || '30d')
  params.set('platform', platform || 'combined')
  if (device && device !== 'all') params.set('device', device)
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.map((value) => String(value).toLowerCase()).join(','))
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
  return apiFetch(`/api/analytics/products?${params.toString()}`)
}
