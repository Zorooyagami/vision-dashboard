import { useEffect, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { useProject } from '../context/ProjectContext'
import { apiFetch } from '../services/apiClient'
import { intelligenceParams } from '../services/intelligenceApi'

export function useHomeSummary() {
  const filters = useFilters()
  const { projectId } = useProject()
  const query = intelligenceParams({ ...filters, device: filters.intelligenceDevice })
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: '', loading: true, data: null, error: null })
  const key = `${projectId || ''}:${query}:${attempt}`
  useEffect(() => {
    if (!projectId) { setState({ key, loading: false, data: null, error: 'Select a project to view activity.' }); return }
    const abort = new AbortController()
    setState({ key, loading: true, data: null, error: null })
    apiFetch(`/api/intelligence/home-summary?${query}`, { signal: abort.signal })
      .then(data => { if (!abort.signal.aborted) setState({ key, loading: false, data, error: null }) })
      .catch(error => { if (!abort.signal.aborted) setState({ key, loading: false, data: null, error: error.message }) })
    return () => abort.abort()
  }, [key, projectId, query])
  return { ...(state.key === key ? state : { loading: true, data: null, error: null }), retry: () => setAttempt(a=>a+1), personaFiltered: Boolean(filters.selectedPersonas?.length) }
}
