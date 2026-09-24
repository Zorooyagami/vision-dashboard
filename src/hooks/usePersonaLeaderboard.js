// src/hooks/usePersonaLeaderboard.js

import { useMemo } from 'react'
import { useAsync } from './useAsync'
import { fetchPersonaLeaderboard } from '../services/personaLeaderboardApi'

export function usePersonaLeaderboard(filters) {
  const {
    data,
    loadingPersonaLeaderboard,
    error,
  } = useAsync(
    () => fetchPersonaLeaderboard(filters),
    [
      filters.period,
      filters.customRange,
      filters.platform,
      filters.device,
    ]
  )

  const formatRevenue = (value = 0) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    }

    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }

    return `$${Math.round(value)}`
  }

  const rows = useMemo(() => {
    if (!data) return []

    return data.map((item) => ({
      id: item.id,
      revenue: formatRevenue(item.revenue),

      // Using pct for now
      conv: `${Number(item.pct || 0).toFixed(1)}%`,

      // Temporary until backend sends trend/comparison data
      dir: item.revenue > 0 ? 'up' : 'flat',
    }))
  }, [data])

  console.log('rows hooks', rows)

  return {
    rows,
    loadingPersonaLeaderboard,
    error,
  }
}