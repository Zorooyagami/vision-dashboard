import { apiFetch } from './apiClient'

const BASE_URL = '/api/admin/projects'

export async function createProject(payload) {
  const data = await apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    projectScoped: false,
  })

  return data?.project
}

export async function fetchProjects() {
  const data = await apiFetch(BASE_URL, {
    projectScoped: false,
  })

  return data?.projects || []
}

export async function fetchProject(projectId) {
  const data = await apiFetch(
    `${BASE_URL}/${encodeURIComponent(projectId)}`,
    { projectScoped: false },
  )

  return data?.project
}

export async function updateProject(projectId, updates) {
  const data = await apiFetch(
    `${BASE_URL}/${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
      projectScoped: false,
    },
  )

  return data?.project
}

export async function deleteProject(projectId) {
  return apiFetch(
    `${BASE_URL}/${encodeURIComponent(projectId)}`,
    {
      method: 'DELETE',
      projectScoped: false,
    },
  )
}
