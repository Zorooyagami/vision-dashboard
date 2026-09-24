import { KPI_LABELS, KPI_DEFS } from '../components/home/homeConstants'

export function buildQueryParams(input) {
  return {
    period: input.period,
    persona: input.personas.length === 0 ? 'all' : input.personas.join(','),
    deviceType:
      input.platform === 'web' ? 'desktop' :
      input.platform === 'app' ? 'mobile' : 'all',
    ...(input.period === 'custom' && input.from && input.to
      ? { from: input.from, to: input.to }
      : {}),
  }
}

export async function fetchKpis(params) {
    console.log('fetchKpis called with params:', params) // Debug log
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null),
  )
  const res = await fetch(`/api/analytics/kpis?${qs}`)
  if (!res.ok) throw new Error(`KPIs fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchRevenueTrend(input, signal) {
  const params = buildQueryParams(input)
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null),
  )
  const res = await fetch(`/api/analytics/revenue?${qs}`, { signal })
  if (!res.ok) throw new Error(`Revenue trend fetch failed: ${res.status}`)
  return res.json()
}

function formatCurrencyCompact(value) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${Math.round(value).toLocaleString()}`
}

function formatChange(change, { pointsSuffix = false } = {}) {
  if (change == null || Number.isNaN(change)) return '—'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}${pointsSuffix ? 'pp' : '%'}`
}

// Maps the real /api/analytics/kpis response, e.g.:
// { kpis: { revenue: {value, change}, activeUsers: {...}, conversionRate: {...}, avgOrderValue: {...} } }
// into the { label, def, value, change, pos, spark } shape KpiRow renders.
export function mapKpiResponseToCards(response) {
  const k = response?.kpis ?? {}
  const order = [
    { key: 'revenue', format: formatCurrencyCompact },
    { key: 'activeUsers', format: v => Math.round(v).toLocaleString() },
    { key: 'conversionRate', format: v => `${v.toFixed(1)}%` },
    { key: 'avgOrderValue', format: formatCurrencyCompact },
  ]

  return order.map((entry, i) => {
    const metric = k[entry.key]
    if (!metric) {
      return { label: KPI_LABELS[i], def: KPI_DEFS[i], value: '—', change: '—', pos: true, spark: [] }
    }
    return {
      label: KPI_LABELS[i],
      def: KPI_DEFS[i],
      value: entry.format(metric.value),
      change: formatChange(metric.change),
      pos: metric.change >= 0,
      spark: [], // API doesn't return a history series yet
    }
  })
}


// Assumed endpoint — adjust the path/params once the real one is confirmed.
// Expected to return an array of insight objects shaped like AI_INSIGHTS
// in homeConstants.js: { id, sentiment, text, timestamp, screen,
// decisionTitle, decisionMetric, decisionPersonas }.
export async function fetchInsights(params, signal) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v != null),
  )
  const res = await fetch(`/api/analytics/insights?${qs}`, { signal })
  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`)
  return res.json()
}

// Normalizes the insights response — tolerates either a bare array or
// a { insights: [...] } wrapper, and fills in safe defaults per item so
// a missing field never breaks the InsightCard render.
export function mapInsightsResponse(response) {
  const list = Array.isArray(response) ? response : response?.insights ?? []
  return list.map((item, i) => ({
    id: item.id ?? i,
    sentiment: item.sentiment ?? 'neutral',
    text: item.text ?? '',
    timestamp: item.timestamp ?? '',
    screen: item.screen ?? 'alerts',
    decisionTitle: item.decisionTitle ?? item.text ?? '',
    decisionMetric: item.decisionMetric ?? '',
    decisionPersonas: item.decisionPersonas ?? [],
  }))
}