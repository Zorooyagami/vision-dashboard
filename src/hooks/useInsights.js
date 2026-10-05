import { useState, useCallback } from 'react'
import { apiRequest } from '../services/apiClient'

const API_BASE = '/api/admin'

export function useInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInsights = useCallback(async (insightWindow) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (insightWindow) params.set('window', insightWindow)

      const endpoint = `${API_BASE}/insights${params.size ? `?${params.toString()}` : ''}`
      const response = await apiRequest(endpoint)

      if (response.status === 404) {
        setInsights({ generatedAt: null, insights: [] })
        return
      }

      if (!response.ok) throw new Error('Failed to fetch insights')

      setInsights(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { insights, loading, error, fetchInsights }
}
