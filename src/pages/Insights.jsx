import { useEffect, useState } from 'react'
import PersonaChip from '../components/PersonaChip'
import { useFilters } from '../context/FiltersContext'
import { useProject } from '../context/ProjectContext'
import { useInsights } from '../hooks/useInsights'
import { useGenerateInsights } from '../hooks/useGenerateInsights'
import { periodToWindow } from '../utils/periodToWindow'

const SENTIMENT = {
  positive: { label: 'Positive', color: '#047857', background: '#ECFDF5', symbol: '↑' },
  negative: { label: 'Negative', color: '#B91C1C', background: '#FEF2F2', symbol: '↓' },
  neutral: { label: 'Neutral', color: '#475569', background: '#F1F5F9', symbol: '•' },
}
const sentimentOf = insight => SENTIMENT[insight.sentiment] ? insight.sentiment : 'neutral'
const personasOf = insight => Array.isArray(insight.decisionPersonas) ? insight.decisionPersonas : []
const decisionFor = insight => ({
  title: insight.decisionTitle || insight.text,
  metric: insight.decisionMetric,
  personas: [...personasOf(insight)],
})
function SentimentBadge({ insight }) {
  const meta = SENTIMENT[sentimentOf(insight)]
  return <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ color: meta.color, background: meta.background }}>{meta.symbol} {meta.label}</span>
}
function InsightDetails({ insight, onClose, onCreateDecision }) {
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.6)' }}>
    <section role="dialog" aria-modal="true" aria-label="Insight details" className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">Insight details</h2><button autoFocus aria-label="Close dialog" onClick={onClose} className="rounded-lg px-3 py-2 hover:bg-slate-100">✕</button></div>
      <div className="mt-4 flex flex-wrap items-center gap-2"><SentimentBadge insight={insight} />{personasOf(insight).map(id => <PersonaChip key={id} id={id} size="sm" />)}</div>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">{insight.text}</p>
      {insight.suggestion && <div className="mt-4 rounded-xl bg-indigo-50 p-4"><h3 className="text-xs font-semibold text-indigo-700">Suggested action</h3><p className="mt-2 text-sm text-slate-700">{insight.suggestion}</p></div>}
      {insight.decisionMetric && <p className="mt-4 text-xs text-slate-500">Metric: {insight.decisionMetric}</p>}
      <div className="mt-6 flex justify-end gap-2"><button className="rounded-lg border px-4 py-2 text-sm" onClick={onClose}>Close</button><button disabled={!onCreateDecision} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" onClick={() => { onCreateDecision?.(decisionFor(insight)); onClose() }}>Create Decision</button></div>
    </section>
  </div>
}

// Remount per project/window so dismissed items and open details never leak
// into another project's insights or another reporting period.
export default function AlertsPage(props) {
  const { projectId } = useProject()
  const { period } = useFilters()
  const insightWindow = periodToWindow(period)
  return <InsightsList key={`${projectId || ''}:${insightWindow}`} {...props} insightWindow={insightWindow} />
}

function InsightsList({ onNavigateDecisions, insightWindow }) {
  const { insights, loading, error, fetchInsights } = useInsights()
  const { generate, generating, error: generateError } = useGenerateInsights()
  const [filter, setFilter] = useState('all')
  const [dismissed, setDismissed] = useState(new Set())
  const [detail, setDetail] = useState(null)
  useEffect(() => { fetchInsights(insightWindow) }, [fetchInsights, insightWindow])
  // Preserve every item and the API's ordering; only the homepage is limited.
  const list = (Array.isArray(insights?.insights) ? insights.insights : []).map((insight, index) => ({
    ...insight, key: JSON.stringify([insight.id || index, insight.text]),
  }))
  const active = list.filter(insight => !dismissed.has(insight.key))
  const visible = active.filter(insight => filter === 'all' || sentimentOf(insight) === filter)
  const hidden = list.filter(insight => dismissed.has(insight.key))
  const problem = generateError || error
  const refresh = () => { if (!generating) generate(() => fetchInsights(insightWindow)) }

  return <div className="space-y-5 p-4 sm:p-6">
    {detail && <InsightDetails insight={detail} onClose={() => setDetail(null)} onCreateDecision={onNavigateDecisions} />}
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-lg font-bold text-slate-900">Alerts & Insights</h1><p className="mt-1 text-xs text-slate-500">All AI insights for the selected project · {insightWindow} reporting window</p></div>
      <button onClick={refresh} disabled={generating || loading} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{generating ? 'Generating…' : 'Generate insights'}</button>
    </header>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{Object.entries(SENTIMENT).map(([key, meta]) => <div key={key} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-semibold" style={{ color: meta.color }}>{meta.symbol} {meta.label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : active.filter(insight => sentimentOf(insight) === key).length}</p><p className="text-xs text-slate-400">insights</p></div>)}</div>
    <div className="flex flex-wrap items-center gap-2" aria-label="Filter insights">{['all', ...Object.keys(SENTIMENT)].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{value === 'all' ? `All (${active.length})` : SENTIMENT[value].label}</button>)}</div>
    {problem && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Unable to load or generate insights. {problem}<button className="ml-3 underline" onClick={() => fetchInsights(insightWindow)}>Retry loading</button></div>}
    {loading && <p role="status" className="py-8 text-center text-sm text-slate-500">Loading insights…</p>}
    {!loading && !problem && !list.length && <div className="rounded-2xl bg-white p-10 text-center"><h2 className="font-semibold text-slate-700">No insights available</h2><p className="mt-2 text-sm text-slate-500">Generate insights for this project to get started.</p></div>}
    {!loading && list.length > 0 && <p className="text-xs text-slate-500">Showing {visible.length} of {list.length} insights{hidden.length ? ` · ${hidden.length} dismissed for this visit` : ''}</p>}
    {!loading && list.length > 0 && !visible.length && <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">No insights match this filter.</p>}
    <div className="space-y-3">{visible.map(insight => <article key={insight.key} className="rounded-2xl border-l-4 bg-white p-5 shadow-sm" style={{ borderColor: SENTIMENT[sentimentOf(insight)].color }}>
      <div className="flex flex-wrap items-center gap-2"><SentimentBadge insight={insight} />{insight.decisionMetric && <span className="text-xs font-semibold text-slate-600">{insight.decisionMetric}</span>}{personasOf(insight).map(id => <PersonaChip key={id} id={id} size="sm" />)}{insight.timestamp && <span className="ml-auto text-xs text-slate-400">{insight.timestamp}</span>}</div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{insight.text}</p>
      <div className="mt-4 flex gap-3"><button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setDetail(insight)}>View Details</button><button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800" onClick={() => setDismissed(prev => new Set([...prev, insight.key]))}>Dismiss</button></div>
    </article>)}</div>
    {hidden.length > 0 && <section className="space-y-2"><h2 className="text-xs font-semibold text-slate-500">DISMISSED ({hidden.length})</h2>{hidden.map(insight => <div key={insight.key} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3"><p className="min-w-0 flex-1 truncate text-xs text-slate-500">{insight.text}</p><button className="text-xs font-semibold text-indigo-600" onClick={() => setDismissed(prev => { const next = new Set(prev); next.delete(insight.key); return next })}>Restore</button></div>)}</section>}
  </div>
}
