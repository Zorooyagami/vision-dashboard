import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { getOpportunities, updateOpportunity } from '../services/opportunitiesApi'
import './RevenueOpportunityRadar.css'

const TYPES = [
  { id: 'all', label: 'All opportunities' },
  { id: 'product_interest', label: 'Product interest' },
  { id: 'checkout_leakage', label: 'Checkout leakage' },
  { id: 'low_traffic_winner', label: 'Untapped winners' },
  { id: 'customer_friction', label: 'Customer friction' },
]
const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)
const number = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n) || 0)
const percent = (n) => `${Math.round(Number(n) || 0)}%`

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    radar: <><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.5-6.5M12 12l6 6M3 12h9"/><circle cx="12" cy="12" r="2"/></>,
    trend: <><path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
    cart: <><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.7 12.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L22 8H5"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    alert: <><path d="M10.3 3.9 2.6 17.2A2 2 0 004.3 20h15.4a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4m0 3h.01"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0111.8-2L20 12M4 12l2.6 5a7 7 0 0011.8-2"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  }
  return <svg {...common}>{paths[name] || paths.spark}</svg>
}

function EmptyState({ onRefresh }) {
  return <div className="ror-empty"><div className="ror-empty-icon"><Icon name="radar" size={24}/></div><h3>No opportunities detected for these filters</h3><p>Try a longer reporting period or combined platform. Opportunities appear when the data meets minimum evidence thresholds.</p><button className="ror-btn ror-btn-secondary" onClick={onRefresh}><Icon name="refresh" size={15}/> Refresh analysis</button></div>
}

function OpportunityCard({ item, expanded, onToggle, onStatusChange, updating }) {
  const status = STATUSES.find((s) => s.value === item.status)?.label || 'New'
  const typeLabel = TYPES.find((t) => t.id === item.type)?.label || 'Opportunity'
  const low = item.potential?.low || 0, base = item.potential?.base || 0, high = item.potential?.high || 0
  return <article className={`ror-opportunity ${expanded ? 'is-expanded' : ''}`}>
    <button className="ror-opportunity-main" onClick={onToggle} aria-expanded={expanded}>
      <div className={`ror-type-icon ror-type-${item.type}`}><Icon name={item.type === 'checkout_leakage' ? 'cart' : item.type === 'low_traffic_winner' ? 'trend' : item.type === 'customer_friction' ? 'alert' : 'target'} size={19}/></div>
      <div className="ror-opportunity-copy">
        <div className="ror-tags"><span className="ror-type-label">{typeLabel}</span><span className={`ror-status ror-status-${item.status}`}>{status}</span></div>
        <h3>{item.title}</h3><p>{item.summary}</p>
        <div className="ror-mini-metrics">{(item.evidence || []).slice(0, 3).map((e) => <span key={e.label}><b>{e.value}</b> {e.label}</span>)}</div>
      </div>
      <div className="ror-opportunity-value"><span>Potential upside</span><strong>{money(low)}–{money(high)}</strong><small>Base scenario {money(base)}</small><div className="ror-priority"><span>Priority</span><b>{Math.round(item.priorityScore || 0)}<small>/100</small></b></div></div>
      <span className={`ror-chevron ${expanded ? 'open' : ''}`}><Icon name="chevron" size={17}/></span>
    </button>
    {expanded && <div className="ror-detail">
      <div className="ror-detail-grid">
        <section className="ror-detail-section"><h4>Why this surfaced</h4><div className="ror-evidence-list">{(item.evidence || []).map((e) => <div key={e.label}><span>{e.label}</span><b>{e.value}</b></div>)}</div><p className="ror-muted">Affected sessions: <b>{number(item.affectedSessions)}</b></p></section>
        <section className="ror-detail-section"><h4>Recommended next step</h4><p>{item.recommendation}</p><div className="ror-score-grid"><div><span>Confidence</span><b>{percent(item.confidence)}</b><div className="ror-meter"><i style={{ width: `${Math.max(0, Math.min(100, item.confidence || 0))}%` }}/></div></div><div><span>Implementation effort</span><b>{['', 'Very low', 'Low', 'Medium', 'High', 'Very high'][item.effort] || 'Medium'}</b><div className="ror-effort-dots">{[1,2,3,4,5].map((v) => <i key={v} className={v <= item.effort ? 'active' : ''}/>)}</div></div></div></section>
      </div>
      <section className="ror-scenario"><div><h4>Scenario range</h4><p>Gross revenue upside if the stated opportunity improves. Not a guaranteed outcome.</p></div><div className="ror-scenario-values"><div><span>Conservative</span><b>{money(low)}</b></div><div><span>Base case</span><b>{money(base)}</b></div><div><span>Optimistic</span><b>{money(high)}</b></div></div></section>
      {!!item.assumptions?.length && <section className="ror-assumptions"><h4>Assumptions & limitations</h4><ul>{item.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></section>}
      <div className="ror-card-actions"><label className="ror-status-select">Update status <select value={item.status} disabled={updating} onChange={(e) => onStatusChange(item, e.target.value)}>{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label><span className="ror-muted">Prioritized by impact, confidence and effort</span></div>
    </div>}
  </article>
}

export default function RevenueOpportunityRadar() {
  const { period, customRange, platform, selectedPersonas, device } = useFilters()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('priority')
  const [expanded, setExpanded] = useState(null)
  const [updatingKey, setUpdatingKey] = useState(null)

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true); else setLoading(true)
    setError('')
    try {
      const next = await getOpportunities({ period, customRange, platform, selectedPersonas, device })
      setData(next)
    } catch (e) { setError(e.message || 'Could not load opportunity analysis') }
    finally { setLoading(false); setRefreshing(false) }
  }, [period, customRange?.from, customRange?.to, platform, selectedPersonas.join(','), device])

  useEffect(() => { load() }, [load])

  const updateStatus = async (item, status) => {
    setUpdatingKey(item.key)
    try {
      await updateOpportunity(item.key, status, item.statusNote || '')
      await load({ quiet: true })
    } catch (e) { setError(e.message || 'Unable to update status') }
    finally { setUpdatingKey(null) }
  }

  const visible = useMemo(() => {
    const list = (data?.opportunities || []).filter((o) => type === 'all' || o.type === type)
    if (sort === 'impact') list.sort((a, b) => (b.potential?.base || 0) - (a.potential?.base || 0))
    else if (sort === 'confidence') list.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    else list.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    return list
  }, [data, type, sort])
  const summary = data?.summary || {}
  const totalPotential = summary.totalPotential || { low: 0, base: 0, high: 0 }
  const rangeLabel = period === 'custom' && customRange?.from ? `${customRange.from} – ${customRange.to}` : ({ '1d': 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '180d': 'Last 6 months' }[period] || period)

  return <div className="ror-page">
    <div className="ror-heading"><div><div className="ror-eyebrow"><span className="ror-eyebrow-dot"/> REVENUE INTELLIGENCE <span className="ror-heading-divider">/</span> OPPORTUNITY DISCOVERY</div><h1><span className="ror-heading-icon"><Icon name="radar" size={23}/></span> Revenue Opportunity Radar</h1><p>Find the highest-value improvements across your products, checkout and customer journeys.</p></div><button className="ror-btn ror-btn-secondary" onClick={() => load({ quiet: true })} disabled={loading || refreshing}><Icon name="refresh" size={15}/>{refreshing ? 'Refreshing…' : 'Refresh analysis'}</button></div>
    <div className="ror-context-row"><span className="ror-live-dot"/> <b>{rangeLabel}</b><span className="ror-context-sep">·</span>{platform === 'combined' ? 'All platforms' : platform === 'web' ? 'Web / desktop' : 'App / mobile & tablet'}<span className="ror-context-sep">·</span>{selectedPersonas.length ? `${selectedPersonas.length} persona filter${selectedPersonas.length > 1 ? 's' : ''}` : 'All personas'}<span className="ror-context-right">{data?.generatedAt ? `Updated ${new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data'}</span></div>
    {error && <div className="ror-error"><Icon name="alert" size={17}/><span>{error}</span><button onClick={() => load()}><Icon name="refresh" size={14}/> Retry</button></div>}
    <div className="ror-kpis">
      <div className="ror-kpi ror-kpi-highlight"><div className="ror-kpi-top"><span>Potential revenue upside</span><span className="ror-kpi-icon purple"><Icon name="trend"/></span></div><strong>{loading ? '—' : `${money(totalPotential.low)} – ${money(totalPotential.high)}`}</strong><div className="ror-kpi-foot"><span className="ror-kpi-pip"/> Base scenario <b>{money(totalPotential.base)}</b></div><div className="ror-kpi-gradient"/></div>
      <div className="ror-kpi"><div className="ror-kpi-top"><span>Open opportunities</span><span className="ror-kpi-icon blue"><Icon name="target"/></span></div><strong>{loading ? '—' : number(summary.opportunities)}</strong><div className="ror-kpi-foot">Across the selected reporting window</div></div>
      <div className="ror-kpi"><div className="ror-kpi-top"><span>High-priority signals</span><span className="ror-kpi-icon amber"><Icon name="alert"/></span></div><strong>{loading ? '—' : number(summary.highPriority)}</strong><div className="ror-kpi-foot">Ranked on impact, confidence & effort</div></div>
      <div className="ror-kpi"><div className="ror-kpi-top"><span>Observed revenue</span><span className="ror-kpi-icon green"><Icon name="layers"/></span></div><strong>{loading ? '—' : money(summary.revenueObserved)}</strong><div className="ror-kpi-foot">Recorded purchase-event totals</div></div>
    </div>
    <div className="ror-main-grid">
      <section className="ror-list-panel"><div className="ror-panel-header"><div><h2>Prioritized opportunities</h2><p>Evidence-backed signals, ranked by expected value and feasibility.</p></div><label className="ror-sort">Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="priority">Priority score</option><option value="impact">Potential impact</option><option value="confidence">Confidence</option></select></label></div>
        <div className="ror-type-tabs">{TYPES.map((t) => <button key={t.id} className={type === t.id ? 'active' : ''} onClick={() => setType(t.id)}>{t.label}{t.id === 'all' && !loading && <span>{(data?.opportunities || []).filter((o) => !['resolved','dismissed'].includes(o.status)).length}</span>}</button>)}</div>
        {loading ? <div className="ror-loading"><div className="ror-spinner"/><b>Scanning product and journey signals</b><p>Calculating rates, scenario ranges and confidence.</p></div> : visible.length ? <div className="ror-opportunity-list">{visible.map((item) => <OpportunityCard key={item.key} item={item} expanded={expanded === item.key} onToggle={() => setExpanded(expanded === item.key ? null : item.key)} onStatusChange={updateStatus} updating={updatingKey === item.key}/>)}</div> : <EmptyState onRefresh={() => load({ quiet: true })}/>}
        {!loading && visible.length > 0 && <div className="ror-list-foot">Showing {visible.length} signal{visible.length === 1 ? '' : 's'} · Estimates are scenarios, not guaranteed revenue.</div>}
      </section>
      <aside className="ror-side-column">
        <section className="ror-side-card ror-priority-card"><div className="ror-side-title"><span className="ror-side-icon"><Icon name="spark" size={17}/></span><div><h3>How priority works</h3><p>Explainable ranking, not a black box.</p></div></div><div className="ror-priority-formula"><div><span>Potential impact</span><b>40%</b></div><div className="ror-formula-track"><i style={{ width: '40%' }}/></div><div><span>Confidence</span><b>35%</b></div><div className="ror-formula-track blue"><i style={{ width: '35%' }}/></div><div><span>Implementation effort</span><b>25%</b></div><div className="ror-formula-track amber"><i style={{ width: '25%' }}/></div><p>Rankings combine estimated value, evidence strength and effort. Open each signal to inspect its score and assumptions.</p></div></section>
        <section className="ror-side-card"><div className="ror-side-title"><span className="ror-side-icon blue"><Icon name="layers" size={17}/></span><div><h3>Journey snapshot</h3><p>Unique sessions with each event</p></div></div><div className="ror-journey-stages">{[{label:'Product view',value:summary.productViewSessions,color:'purple'},{label:'Add to cart',value:summary.cartSessions,color:'blue'},{label:'View cart',value:summary.viewCartSessions,color:'cyan'},{label:'Checkout start',value:summary.checkoutSessions,color:'amber'},{label:'Purchase',value:summary.purchaseSessions,color:'green'}].map((stage) => <div className="ror-journey-stage" key={stage.label}><div className="ror-journey-label"><span><i className={stage.color}/>{stage.label}</span><b>{loading ? '—' : number(stage.value)}</b></div><div className="ror-journey-bar"><i className={stage.color} style={{ width: `${summary.productViewSessions ? Math.max(stage.value ? 2 : 0, Math.min(100, stage.value / summary.productViewSessions * 100)) : 0}%` }}/></div></div>)}</div><div className="ror-journey-note">Stage counts are unique sessions, not individual event counts. They may not represent strictly ordered step-to-step conversion.</div></section>
        <section className="ror-side-card ror-integrity"><div className="ror-integrity-icon"><Icon name="check" size={17}/></div><div><h3>Evidence before action</h3><p>Confirm the event trail, sample size and likely cause before prioritizing a change. Use session replay or an experiment to validate the hypothesis.</p></div></section>
      </aside>
    </div>
    {summary.dataTruncated && <div className="ror-warning"><Icon name="alert" size={16}/> This project has more than 50,000 matching events in the window. Metrics may be based on a capped sample; narrow the reporting period for a more complete view.</div>}
    <div className="ror-disclaimer">Revenue upside is an assumption-based gross scenario derived from recorded events. It is not a forecast or guarantee. Missing product identifiers, incomplete purchase tracking, repeat purchases, returns and margin are not fully represented.</div>
  </div>
}
