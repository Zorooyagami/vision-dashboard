const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000'

export async function apiFetch(
  endpoint,
  options = {}
) {
  const projectId =
    localStorage.getItem(
      'vision_project_id'
    )

  const headers = {
    ...(options.body
      ? {
          'Content-Type':
            'application/json',
        }
      : {}),

    ...options.headers,
  }

  if (projectId) {
    headers['X-Project-Id'] =
      projectId
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  let data

  try {
    data =
      await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Request failed (${response.status})`
    )
  }

  return data
}