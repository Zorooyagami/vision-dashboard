import { apiFetch } from './apiClient'

const ENDPOINT = '/api/admin/personas/overview'

export async function fetchPersonasOverview({
  period = '30d',
  customRange,
  platform = 'combined',
  device,
} = {}) {
  const params = new URLSearchParams()

  params.set('period', period)
  params.set('platform', platform)

  if (device) {
    params.set('device', device)
  }

  if (
    period === 'custom' &&
    customRange?.from &&
    customRange?.to
  ) {
    params.set('from', customRange.from)
    params.set('to', customRange.to)
  }

  /*
   * Do NOT manually append projectId here.
   * apiFetch() is project-scoped by default and automatically sends:
   *
   *   X-Project-Id: vis_xxx
   *
   * using the active project stored by ProjectContext/apiClient.
   */
  return apiFetch(`${ENDPOINT}?${params.toString()}`)
}
