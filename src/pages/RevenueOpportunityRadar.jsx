import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { getOpportunities, updateOpportunity } from '../services/opportunitiesApi'
import './RevenueOpportunityRadar.css'

const TYPES = [
  ['all', 'All signals'],
  ['product_interest', 'Product engagement'],
  ['checkout_leakage', 'Cart and checkout'],
  ['low_traffic_winner', 'Products to investigate'],
  ['customer_friction', 'Interaction errors'],
  ['product_activity', 'Product snapshots'],
  ['journey_activity', 'Journey snapshots'],
  ['data_quality', 'Tracking coverage'],
]
const STATUSES = ['new', 'investigating', 'planned', 'in_progress', 'resolved', 'dismissed']
const fmt = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0)
const money = (value, currency) => {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) }
  catch { return `${fmt(value)} ${currency}` }
}

function Signal({ item, onUpdate, updating }) {
  const [open, setOpen] = useState(false)
  return <article className="rr-signal">
    <button className="rr-signal-head" onClick={() => setOpen(!open)} aria-expanded={open}>
      <div className="rr-signal-left">
        <div className="rr-signal-meta"><span>{TYPES.find(([id]) => id === item.type)?.[1] || item.type}</span><span className="rr-status">{item.status.replaceAll('_', ' ')}</span><span>{item.evidenceLevel === 'exploratory' ? 'Exploratory · not a confirmed issue' : 'Threshold-backed signal'}</span><span>{item.strength}</span></div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        {item.productId && <p className="rr-product-id">Tracked product ID: <code>{item.productId}</code></p>}
        <div className="rr-evidence-inline">{item.evidence?.slice(0, 3).map((v) => <span key={v.label}><strong>{v.value}</strong> {v.label}</span>)}</div>
      </div>
      <span className="rr-expand">{open ? 'Hide details −' : 'Evidence & next steps +'}</span>
    </button>
    {open && <div className="rr-detail">
      <div className="rr-detail-grid">
        <section><h4>What was recorded</h4><dl>{item.evidence?.map((v) => <div key={v.label}><dt>{v.label}</dt><dd>{v.value}</dd></div>)}</dl></section>
        <section><h4>Why this signal appeared</h4><p>{item.detectionRule || "Derived from matching recorded events in the reporting window."}</p><h4 className="rr-next-steps">What to investigate</h4><p>{item.recommendation}</p><p className="rr-limitation">{item.note}</p></section>
      </div>
      <div className="rr-actions"><label>Investigation status <select disabled={updating} value={item.status} onChange={(e) => onUpdate(item, e.target.value)}>{STATUSES.map((v) => <option key={v} value={v}>{v.replaceAll('_', ' ')}</option>)}</select></label></div>
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
  const [showClosed, setShowClosed] = useState(false)
  const [updatingKey, setUpdatingKey] = useState(null)

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else { setLoading(true); setData(null) }
    setError('')
    try { setData(await getOpportunities({ period, customRange, platform, selectedPersonas, device })) }
    catch (e) { setError(e.message || 'Unable to load observations'); setData(null) }
    finally { setLoading(false); setRefreshing(false) }
  }, [period, customRange?.from, customRange?.to, platform, selectedPersonas.join(','), device])

  useEffect(() => { load() }, [load])

  const onUpdate = async (item, status) => {
    setUpdatingKey(item.key)
    try { await updateOpportunity(item.key, status, item.statusNote || ''); await load(true) }
    catch (e) { setError(e.message || 'Could not save investigation status') }
    finally { setUpdatingKey(null) }
  }

  const signals = useMemo(() => (data?.opportunities || []).filter((s) =>
    (type === 'all' || type === s.type) && (showClosed || !['resolved', 'dismissed'].includes(s.status))),
  [data, type, showClosed])
  const s = data?.summary || {}
  const q = s.quality || {}
  const values = s.trackedPurchaseValues || []
  const periodLabel = period === 'custom' ? `${customRange?.from || ''} to ${customRange?.to || ''}` : ({ '1d': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '180d': 'Last 180 days' }[period] || period)
  const dataWarnings = [
    q.missingProductIds > 0 && `${fmt(q.missingProductIds)} product events lacked a product ID and were not attributed to a product.`,
    q.duplicatePurchaseEvents > 0 && `${fmt(q.duplicatePurchaseEvents)} duplicate purchase events were ignored in tracked-order values.`,
    q.missingCurrencyOrAmount > 0 && `${fmt(q.missingCurrencyOrAmount)} purchase events lacked a valid amount or currency.`,
    q.missingOrderIds > 0 && `${fmt(q.missingOrderIds)} purchase events lacked an order ID.`,
  ].filter(Boolean)

  return <main className="rr-page">
    <header className="rr-header"><div><div className="rr-kicker">REVENUE INTELLIGENCE / OBSERVED BEHAVIOR</div><h1>Revenue Opportunity Radar</h1><p>Understand what customers actually did. Signals are investigation prompts, not predicted earnings.</p></div><button className="rr-button" disabled={loading || refreshing} onClick={() => load(true)}>{refreshing ? 'Refreshing…' : 'Refresh analysis'}</button></header>
    <div className="rr-context">{periodLabel} · {platform === 'combined' ? 'All devices' : platform} · {selectedPersonas.length ? `${selectedPersonas.length} persona filters` : 'All personas'}{data?.generatedAt && <span>Calculated {new Date(data.generatedAt).toLocaleString()}</span>}</div>
    {error && <div role="alert" className="rr-alert rr-error">{error} <button onClick={() => load()}>Retry</button></div>}
    <div className="rr-kpis">
      <div><span>Observed sessions</span><strong>{loading ? '—' : fmt(s.sessions)}</strong><small>Sessions with a relevant tracked event</small></div>
      <div><span>Product-view sessions</span><strong>{loading ? '—' : fmt(s.productViewSessions)}</strong><small>At least one product view</small></div>
      <div><span>Cart sessions</span><strong>{loading ? '—' : fmt(s.cartSessions)}</strong><small>At least one add-to-cart event</small></div>
      <div><span>Actionable / exploratory</span><strong>{loading ? '—' : `${fmt(s.actionableSignals)} / ${fmt(s.exploratoryObservations)}`}</strong><small>Threshold-backed findings / real-data snapshots</small></div>
    </div>
    <div className="rr-explainer"><strong>How to read this page</strong><p>Each card uses the selected project’s recorded events. Actionable signals meet explicit thresholds; exploratory observations show smaller real samples without claiming a defect. Names are taken from product metadata (otherwise the product ID is shown), and counts, rates and detection criteria are calculated for the selected period. Expand a card to see the rule and its evidence. The page does not calculate speculative revenue uplift, and recorded purchases do not prove payment settlement.</p></div>
    <section className="rr-panel">
      <div className="rr-panel-title"><div><h2>Observed signals and activity</h2><p>Threshold-backed findings appear first. Exploratory cards show additional real activity without claiming a problem or revenue uplift.</p></div><label className="rr-checkbox"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)}/> Show resolved / dismissed</label></div>
      <div className="rr-filters">{TYPES.map(([id, label]) => <button key={id} className={type === id ? 'rr-active' : ''} onClick={() => setType(id)}>{label}</button>)}</div>
      {loading ? <div className="rr-empty">Analyzing recorded events…</div> : signals.length ? <div className="rr-results">{signals.map((item) => <Signal key={item.key} item={item} updating={updatingKey === item.key} onUpdate={onUpdate}/>)}</div> : <div className="rr-empty">No matching observations in the recorded events for these filters. Check the selected project, date range, event coverage and closed-status filter.</div>}
    </section>
    <div className="rr-bottom-grid">
      <section className="rr-panel"><h2>Journey event snapshot</h2><p className="rr-help">Unique sessions containing each event type. These are not a strict conversion funnel: stages can occur in different visits and may not all be tracked.</p>
        <dl className="rr-journey">{[['Product view', s.productViewSessions], ['Add to cart', s.cartSessions], ['View cart', s.viewCartSessions], ['Checkout started', s.checkoutSessions], ['Purchase event', s.purchaseSessions]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{loading ? '—' : fmt(value)}</dd></div>)}</dl>
        <p className="rr-help">Recorded in sequence within a session: {fmt(s.viewToCartSessions)} product-view → add-to-cart, {fmt(s.cartToCheckoutSessions)} add-to-cart → checkout, {fmt(s.checkoutToPurchaseSessions)} checkout → purchase. These pairs can involve different products.</p>
      </section>
      <section className="rr-panel"><h2>Purchase-event quality</h2><p className="rr-help">Client-side purchase events are not a verified sales ledger. Incomplete or unidentified purchase events are excluded from tracked monetary totals; these are not verified payments.</p>
        {values.length ? <div className="rr-values">{values.map((v) => <div key={v.currency}><span>{v.currency} · deduplicated production-tagged events</span><strong>{money(v.amount, v.currency)}</strong></div>)}</div> : <p className="rr-no-revenue">No eligible production-tagged purchase amounts with order IDs and currencies. Revenue has intentionally not been estimated.</p>}
        <p className="rr-help">To report real revenue, reconcile server-verified paid orders, refunds and currency with a trusted payment/order service.</p>
      </section>
    </div>
    <section className="rr-panel rr-quality"><h2>Data coverage and limitations</h2><p>{fmt(q.eventCount)} relevant analytics events were examined. All displayed values are scoped to the selected project and time period.</p>
      {dataWarnings.length ? <ul>{dataWarnings.map((message) => <li key={message}>{message}</li>)}</ul> : <p>No missing-ID or purchase-quality warnings were detected in the examined events.</p>}
      {selectedPersonas.length > 0 && <p>Friction signals from the separate behavior stream are omitted under persona filtering because equivalent persona membership cannot be established reliably.</p>}
    </section>
  </main>
}
