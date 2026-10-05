// src/hooks/useFunnelPreview.js
import { useEffect, useState } from 'react'
import { previewFunnel } from '../services/funnelsService'

// Real counts for an unsaved funnel, debounced while the user edits steps.
export function useFunnelPreview(projectId, filters, steps, conversionWindowDays) {
  const [state, setState] = useState({ counts: null, loading: false, error: '' })

  const filterKey = JSON.stringify(filters ?? {})
  const stepsKey = JSON.stringify(steps)

  useEffect(() => {
    const currentSteps = JSON.parse(stepsKey)

    if (!projectId || currentSteps.length < 2) {
      setState({ counts: null, loading: false, error: '' })
      return undefined
    }

    const controller = new AbortController()
    setState((s) => ({ ...s, loading: true, error: '' }))

    const timer = setTimeout(async () => {
      try {
        const { counts } = await previewFunnel(
          projectId,
          { steps: currentSteps, conversionWindowDays: Number(conversionWindowDays) },
          JSON.parse(filterKey),
          controller.signal,
        )
        setState({ counts, loading: false, error: '' })
      } catch (e) {
        if (e.name !== 'AbortError') {
          setState({ counts: null, loading: false, error: e.message })
        }
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [projectId, filterKey, stepsKey, conversionWindowDays])

  return state
}
