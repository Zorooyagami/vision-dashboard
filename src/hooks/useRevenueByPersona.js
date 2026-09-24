// src/hooks/useRevenueByPersona.js
import { useAsync } from './useAsync'
import { fetchRevenueBreakdown, fetchStackedRevenue } from '../services/revenueApi'

export function useRevenueBreakdown(filters) {
  const { data, loading, error } = useAsync(
    () => fetchRevenueBreakdown(filters),
    [filters.period, filters.customRange, filters.platform, filters.device]
  )
  return { rows: data || [], loading, error }
}

export function useStackedRevenue(filters) {
  const { data, loading, error } = useAsync(
    () => fetchStackedRevenue(filters),
    [filters.period, filters.customRange, filters.platform, filters.device]
  )
  return { monthly: data || {}, loading, error }
}