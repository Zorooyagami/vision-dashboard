// src/services/funnelsService.js
// Every call sends the projectId. The server's requireProject middleware turns it
// into req.projectId, and that value (never the request body) is what gets stored.
//
// Adjust `request()` to match however useUsers authenticates and sends the project
// (header name, auth token, base URL). Everything else is independent of that.
import { apiFetch } from './apiClient'

const BASE = 'https://vision-backend-production-e072.up.railway.app/api/explore/funnels'

function toQuery(filters = {}) {
  const p = new URLSearchParams()
  if (filters.period) p.set('period', filters.period)
  if (filters.period === 'custom' && filters.customRange) {
    p.set('from', filters.customRange.from)
    p.set('to', filters.customRange.to)
  }
  if (filters.platform) p.set('platform', filters.platform)
  if (filters.device && filters.device !== 'all') {
    p.set('device', String(filters.device).toLowerCase())
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request(projectId, path, { method = 'GET', body, filters, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (projectId) headers['X-Project-Id'] = String(projectId)
  // + auth header here if your other services add one, e.g.
  // headers.Authorization = `Bearer ${getToken()}`

  const res = await fetch(`${BASE}${path}${toQuery(filters)}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const listFunnels = (projectId, filters, signal) =>
  request(projectId, '', { filters, signal })

export const listTrackedEvents = (projectId, signal) =>
  request(projectId, '/events', { signal })

export const createFunnel = (projectId, payload, filters) =>
  request(projectId, '', { method: 'POST', body: payload, filters })

export const updateFunnel = (projectId, id, payload, filters) =>
  request(projectId, `/${encodeURIComponent(id)}`, { method: 'PUT', body: payload, filters })

export const deleteFunnel = (projectId, id) =>
  request(projectId, `/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const duplicateFunnel = (projectId, id, filters) =>
  request(projectId, `/${encodeURIComponent(id)}/duplicate`, { method: 'POST', filters })

export const previewFunnel = (projectId, payload, filters, signal) =>
  request(projectId, '/preview', { method: 'POST', body: payload, filters, signal })
