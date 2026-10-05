import { apiFetch } from './apiClient'

const API_BASE = '/api/record'

function addCommonParams(params, { period, customRange, personas } = {}) {
  params.set('period', period || '30d')
  if (personas?.length) params.set('personas', personas.join(','))
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }
}

export async function fetchRecordedUsers({ period, customRange, personas, search } = {}) {
  const params = new URLSearchParams()
  addCommonParams(params, { period, customRange, personas })
  if (search) params.set('search', search)

  const data = await apiFetch(`${API_BASE}/recorded-users?${params.toString()}`)
  return data?.users || []
}

export async function fetchSessions({ period, customRange, personas, userId, search } = {}) {
  const params = new URLSearchParams()
  addCommonParams(params, { period, customRange, personas })
  if (userId) params.set('userId', userId)
  if (search) params.set('search', search)

  const data = await apiFetch(`${API_BASE}/sessions?${params.toString()}`)
  return data?.sessions || []
}
