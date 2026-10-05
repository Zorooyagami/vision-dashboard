import { useAsync } from './useAsync'
import { useProject } from '../context/ProjectContext'
import { fetchPersonasOverview } from '../services/personasApi'

export function usePersonasOverview(filters = {}) {
  const { projectId } = useProject()

  const period = filters.period || '30d'
  const platform = filters.platform || 'combined'
  const device = filters.device || null
  const from = filters.customRange?.from || ''
  const to = filters.customRange?.to || ''

  const {
    data,
    loading,
    error,
  } = useAsync(
    () =>
      fetchPersonasOverview({
        period,
        platform,
        device,
        customRange:
          period === 'custom' && from && to
            ? { from, to }
            : null,
      }),
    [
      projectId,
      period,
      platform,
      device,
      from,
      to,
    ]
  )

  return {
    personas: data?.personas || [],
    months: data?.months || [],
    summary: data?.summary || {
      totalSessions: 0,
      personaCount: 0,
    },
    range: data?.range || null,
    loadingPersonas: loading,
    error,
  }
}
