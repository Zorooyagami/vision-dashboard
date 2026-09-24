// src/services/projectsApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000'

const BASE_URL =
  `${API_BASE_URL}/api/admin/projects`

export async function fetchProjects() {
  const response = await fetch(BASE_URL)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Failed to fetch projects'
    )
  }

  return data.projects || []
}

export async function deleteProject(projectId) {
  const response = await fetch(
    `${BASE_URL}/${projectId}`,
    {
      method: 'DELETE',
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Failed to delete project'
    )
  }

  return data
}