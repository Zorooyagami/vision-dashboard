// src/services/funnelsService.js
// Uses apiFetch like the other services: it adds API_BASE_URL and the X-Project-Id
// header (active project from localStorage), and throws an Error with the server's
// message on non-2xx responses.
import { apiFetch } from './apiClient'

const BASE = '/api/explore/funnels'

// Same filter -> query-string mapping as useUsers / eventsApi.
function toQuery(filters = {}) {
  const { period, customRange, platform, device, selectedPersonas } = filters
  const p = new URLSearchParams()

  if (period) p.set('period', period)
  if (period === 'custom' && customRange?.from && customRange?.to) {
    p.set('from', customRange.from)
    p.set('to', customRange.to)
  }
  if (platform && platform !== 'all') p.set('platform', platform)
  if (device && device !== 'all') p.set('device', String(device).toLowerCase())
  if (selectedPersonas?.length) p.set('personas', selectedPersonas.join(','))

  const s = p.toString()
  return s ? `?${s}` : ''
}

const request = (path, { method = 'GET', body, filters, signal } = {}) =>
  apiFetch(`${BASE}${path}${toQuery(filters)}`, {
    method,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

export const listFunnels = (filters, signal) => request('', { filters, signal })

export const listTrackedEvents = (signal) => request('/events', { signal })

export const createFunnel = (payload, filters) =>
  request('', { method: 'POST', body: payload, filters })

export const updateFunnel = (id, payload, filters) =>
  request(`/${encodeURIComponent(id)}`, { method: 'PUT', body: payload, filters })

export const deleteFunnel = (id) =>
  request(`/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const duplicateFunnel = (id, filters) =>
  request(`/${encodeURIComponent(id)}/duplicate`, { method: 'POST', filters })

export const previewFunnel = (payload, filters, signal) =>
  request('/preview', { method: 'POST', body: payload, filters, signal })
