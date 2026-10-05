const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '')

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '')

export const ACTIVE_PROJECT_ID_KEY = 'vision_project_id'
export const ACTIVE_PROJECT_NAME_KEY = 'vision_project_name'

export function getActiveProjectId() {
  return localStorage.getItem(ACTIVE_PROJECT_ID_KEY) || null
}

export function setActiveProject(project) {
  const projectId =
    typeof project === 'string'
      ? project
      : project?.projectId

  if (!projectId) {
    clearActiveProject()
    return
  }

  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, projectId)

  if (typeof project === 'object' && project?.name) {
    localStorage.setItem(ACTIVE_PROJECT_NAME_KEY, project.name)
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_NAME_KEY)
  }
}

export function clearActiveProject() {
  localStorage.removeItem(ACTIVE_PROJECT_ID_KEY)
  localStorage.removeItem(ACTIVE_PROJECT_NAME_KEY)
}

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

function shouldSetJsonContentType(body) {
  if (body == null) return false
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false
  return true
}

/**
 * Low-level request helper. It automatically injects the active project ID
 * for project-scoped requests and returns the raw Response object.
 *
 * Set projectScoped:false for project-management endpoints such as
 * /api/admin/projects, because those routes must work before a project is
 * selected.
 */
export async function apiRequest(
  endpoint,
  {
    projectScoped = true,
    headers: providedHeaders,
    ...fetchOptions
  } = {},
) {
  const headers = new Headers(providedHeaders || {})
  const projectId = getActiveProjectId()

  if (projectScoped) {
    if (!projectId) {
      const error = new Error('Select a project before loading analytics data.')
      error.code = 'PROJECT_REQUIRED'
      throw error
    }

    headers.set('X-Project-Id', projectId)
  }

  if (
    shouldSetJsonContentType(fetchOptions.body) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(buildUrl(endpoint), {
    ...fetchOptions,
    headers,
  })
}

async function parseResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text || null
}

/**
 * JSON-friendly API helper used by the dashboard services.
 * Throws a useful Error for non-2xx responses and returns parsed data.
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await apiRequest(endpoint, options)
  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && !data.trim().startsWith('<') ? data : null) ||
      `Request failed (${response.status})`

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
