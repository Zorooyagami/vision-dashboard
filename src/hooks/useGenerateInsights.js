import { useState, useCallback, useRef, useEffect } from 'react'
import { apiRequest } from '../services/apiClient'

const API_BASE = '/api/admin'

export function useGenerateInsights() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => stopPolling, [stopPolling])

  const generate = useCallback(
    async (onComplete, window = '30d') => {
      setError(null)
      setGenerating(true)
      stopPolling()

      try {
        const startResponse = await apiRequest(`${API_BASE}/insights/generate`, {
          method: 'POST',
          body: JSON.stringify({ window }),
        })

        // 409 means generation is already running; polling should continue.
        if (!startResponse.ok && startResponse.status !== 409) {
          throw new Error('Failed to start insight generation')
        }
      } catch (err) {
        setError(err.message)
        setGenerating(false)
        return
      }

      pollRef.current = setInterval(async () => {
        try {
          const response = await apiRequest(`${API_BASE}/insights/status?window=${encodeURIComponent(window)}`)
          if (!response.ok) throw new Error('Unable to check generation status')

          const { inProgress, error: jobError } = await response.json()
          if (jobError) throw new Error(jobError)

          if (!inProgress) {
            stopPolling()
            setGenerating(false)
            onComplete?.()
          }
        } catch (err) {
          stopPolling()
          setGenerating(false)
          setError(err.message || 'Lost connection while checking status')
        }
      }, 3000)
    },
    [stopPolling],
  )

  return { generate, generating, error }
}
