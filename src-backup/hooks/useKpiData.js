import { useEffect, useState } from 'react'
import { buildQueryParams, fetchKpis, mapKpiResponseToCards } from '../services/analyticsService'

export function useKpiData(platform, selectedPersonas, period, customRange) {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = buildQueryParams({
      platform,
      personas: selectedPersonas,
      period,
      from: customRange?.from,
      to: customRange?.to,
    })

    fetchKpis(params)
      .then(res => {
        if (cancelled) return
        setCards(mapKpiResponseToCards(res))
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [platform, JSON.stringify(selectedPersonas), period, customRange?.from, customRange?.to])

  return { cards, loading, error }
}
