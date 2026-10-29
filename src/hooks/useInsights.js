import { useState, useCallback, useRef, useEffect } from 'react'
import { apiRequest } from '../services/apiClient'
import { useProject } from '../context/ProjectContext'

export function useInsights() {
  const { projectId } = useProject()
  const [state, setState] = useState({ projectId: null, insights: null, loading: false, error: null })
  const requestRef = useRef(0)
  const controllerRef = useRef(null)

  useEffect(() => () => {
    requestRef.current += 1
    controllerRef.current?.abort()
  }, [projectId])

  const fetchInsights = useCallback(async (insightWindow) => {
    const request = ++requestRef.current
    controllerRef.current?.abort()
    if (!projectId) {
      setState({ projectId, insights: null, loading: false, error: null })
      return
    }
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ projectId, insights: null, loading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (insightWindow) params.set('window', insightWindow)
      const response = await apiRequest(`/api/admin/insights${params.size ? `?${params}` : ''}`, { signal: controller.signal })
      let data
      if (response.status === 404) data = { generatedAt: null, insights: [] }
      else {
        if (!response.ok) throw new Error('Failed to fetch insights')
        data = await response.json()
      }
      if (request === requestRef.current && !controller.signal.aborted) {
        setState({ projectId, insights: data, loading: false, error: null })
      }
      return data
    } catch (err) {
      if (request === requestRef.current && !controller.signal.aborted) {
        setState({ projectId, insights: null, loading: false, error: err.message })
      }
    }
  }, [projectId])

  const current = state.projectId === projectId ? state : { insights: null, loading: Boolean(projectId), error: null }
  return { insights: current.insights, loading: current.loading, error: current.error, fetchInsights }
}
