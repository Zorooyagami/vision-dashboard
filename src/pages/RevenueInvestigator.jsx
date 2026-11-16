import { useEffect, useMemo, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { apiFetch } from '../services/apiClient'
import { useProject } from '../context/ProjectContext'
import SessionPlayer from '../components/tools/replay/SessionPlayer'
import './RevenueInvestigator.css'

const labels = {purchase_recorded:'Purchase event after cart',cart_emptied:'Cart emptied',checkout_no_purchase:'Checkout without purchase',cart_no_checkout:'Cart without checkout'}
const eventLabels = {cart_updated:'Cart changed',add_to_cart:'Added to cart',checkout_started:'Checkout started',checkout_start:'Checkout started',purchase_completed:'Purchase event',purchase:'Purchase event',validation_failure:'Validation failure',repeated_click:'Repeated click',javascript_error:'JavaScript error',action_failure:'Action failure',page_view:'Page view',product_view:'Product view'}
const fmt = value => value ? new Date(value).toLocaleString() : '—'
const options = [['all','All cart journeys'],['cart_no_checkout','No checkout recorded'],['checkout_no_purchase','No purchase recorded'],['cart_emptied','Cart emptied'],['purchase_recorded','Purchase after cart']]
const dayOptions = { '1d':1,'7d':7,'30d':30,'90d':90,'180d':180,'365d':365 }
const pageSize = 8

export default function RevenueInvestigator() {
  const {period, customRange} = useFilters()
  const {projectId} = useProject()
  const days = useMemo(() => {
    if (period === 'custom' && customRange?.from && customRange?.to) {
      const ms = new Date(customRange.to) - new Date(customRange.from)
      return Math.min(365,Math.max(1,Math.ceil(ms/86400000)+1))
    }
    return dayOptions[period] || 30
  },[period,customRange])
  const customQuery = period === 'custom' && customRange?.from && customRange?.to ? {from:customRange.from,to:customRange.to} : null
  const [status,setStatus] = useState('all')
  const [page,setPage] = useState(1)
  const [selected,setSelected] = useState(null)
  const [replay,setReplay] = useState(null)
  const [result,setResult] = useState(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [refresh,setRefresh] = useState(0)
  useEffect(()=>{setPage(1);setSelected(null)},[days,projectId,status])
  useEffect(()=>{
    let active=true
    setLoading(true);setError('')
    const query = new URLSearchParams({days:String(days),page:String(page),pageSize:String(pageSize),status,...(customQuery||{})})
    apiFetch(`/api/behavior/investigate/cart?${query}`)
      .then(data=>{if(active){setResult(data);setSelected(null)}})
      .catch(err=>{if(active)setError(err.message)})
      .finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[projectId,days,status,page,refresh,customQuery?.from,customQuery?.to])
  const cases=result?.cases||[]
  const active=cases.find(c=>c.sessionId===selected)||cases[0]||null
  const counts=result?.counts||{}
  const totalPages=Math.max(1,Math.ceil((result?.filteredCases||0)/pageSize))
  if(replay)return <SessionPlayer session={replay} onClose={()=>setReplay(null)}/>
  return <div className="ci-page">
    <div className="ci-heading"><div><span className="ci-eyebrow">VISION / REVENUE INVESTIGATOR</span><h1>Cart Journey Investigation</h1><p>Inspect real cart activity, checkout steps and purchase-event evidence.</p></div><div className="ci-heading-actions"><details className="ci-info"><summary aria-label="About tracking coverage and purchase counts" title="About tracking coverage and purchase counts">ⓘ <span>About the data</span></summary><div className="ci-info-popover" role="note">
      <strong>Understanding the counts</strong>
      <p>Purchase events are occurrences, while purchase sessions are unique session IDs. One session can record multiple purchases. These are not verified orders.</p>
      {result&&<><p><b>Purchase coverage:</b> {result.diagnostics?.analyticsPurchaseEvents??0} standard analytics purchase events and {result.diagnostics?.behaviorPurchaseEvents??0} behavior purchase events; {counts.allTrackedPurchaseSessions??0} unique purchase sessions; {counts.purchaseRecorded??0} cart journeys followed by a purchase event; {counts.purchaseWithoutMatchedCart??0} purchase sessions without matched cart history.</p>
      <p><b>Tracking coverage:</b> {counts.behaviorSessions??0} identified-cart sessions, {counts.analyticsOnlySessions??0} historical session-level journeys, {result.diagnostics?.analyticsCartEvents??0} add-to-cart events and {result.scannedEvents??0} total events scanned. {result.caveat}</p>
      <p>There are {result.totalCases??0} eligible cart sessions. Results are paginated; all eligible sessions can be browsed.</p></>}
      <p>Missing a purchase event does not establish abandonment. Historical events without a cart ID are matched by session and event time only.</p>
    </div></details><button className="ci-button" onClick={()=>setRefresh(v=>v+1)}>Refresh</button></div></div>
    {loading&&<div className="ci-message" role="status">Loading observed sessions…</div>}
    {error&&<div className="ci-message ci-error" role="alert">{error} <button onClick={()=>setRefresh(v=>v+1)}>Retry</button></div>}
    {result&&<>
      <div className="ci-counts">{[
        ['Cart sessions',counts.cartSessions,'Sessions with cart activity'],
        ['Reached checkout',counts.checkoutObserved,'After a tracked cart action'],
        ['Purchases after cart',counts.purchaseRecorded,'Matched cart journeys'],
        ['Purchase sessions',counts.allTrackedPurchaseSessions,'All sessions with purchase events'],
        ['Purchase events',counts.purchaseEventOccurrences,'Raw occurrences, not orders'],
        ['Friction observed',counts.frictionSessions,'Explicit error or repeated-click signals']
      ].map(([name,value,detail])=><div className="ci-metric" key={name} title={detail}><span>{name}</span><strong>{(value??0).toLocaleString()}</strong></div>)}</div>
      <div className="ci-workspace">
        <section className="ci-panel"><div className="ci-panel-heading"><h2>Sessions to investigate</h2><span>{(result.filteredCases||0).toLocaleString()} matching</span></div>
          <label className="ci-filter-label">Outcome<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}>{options.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
          <div className="ci-cases">{cases.map(c=><button type="button" key={c.sessionId} onClick={()=>setSelected(c.sessionId)} className={`ci-case ${active?.sessionId===c.sessionId?'ci-selected':''}`}><strong>{labels[c.status]||c.status}</strong><small>{fmt(c.firstCartAt)} · {c.device} · {c.source==='analytics'?'Analytics-only':'Identified cart'}</small><span>{c.hasReplay?'Replay available':'Timeline only'}{c.frictionCount?` · ${c.frictionCount} friction events`:''}</span><code title={c.sessionId}>{c.sessionId}</code></button>)}{!cases.length&&<p className="ci-muted ci-pad">No sessions match this outcome in the selected period.</p>}</div>
          <div className="ci-pagination"><span>{result.filteredCases ? `${(page-1)*pageSize+1}–${(page-1)*pageSize+cases.length} of ${result.filteredCases}`:'0 sessions'}</span><div><button disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>Previous</button><span>{page} / {totalPages}</span><button disabled={page>=totalPages||loading} onClick={()=>setPage(p=>p+1)}>Next</button></div></div>
        </section>
        <section className="ci-panel ci-detail">{active?<><div className="ci-panel-heading"><div><h2>{labels[active.status]||active.status}</h2><p className="ci-muted">Session {active.sessionId}</p></div>{active.hasReplay&&<button className="ci-button" onClick={()=>setReplay({sessionId:active.sessionId,userId:active.recordingUserId||active.userId||'unknown',name:'Cart investigation'})}>Play replay</button>}</div>
          <div className="ci-evidence"><span>Cart ID <strong>{active.cartId||'Not recorded'}</strong></span><span>Device <strong>{active.device}</strong></span><span>Checkout <strong>{active.checkoutObserved?'Observed':'Not recorded'}</strong></span><span>Purchase <strong>{active.purchaseObserved?'Observed':'Not recorded'}</strong></span></div>
          <p className="ci-muted">{active.evidence}</p><h3>Recorded event timeline</h3><div className="ci-timeline">{active.timeline.map((e,i)=><div className="ci-event" key={`${e.eventId}-${i}`}><time>{fmt(e.time)}</time><div><strong>{eventLabels[e.kind]||e.label}</strong><p>{e.path}{e.element?` · Element: ${e.element}`:''}{e.code?` · Code: ${e.code}`:''}</p></div></div>)}</div>
          {!active.hasReplay&&<p className="ci-muted">No session recording available. The recorded event timeline remains accessible.</p>}
        </>:<div className="ci-message">No matching session in this page. Select another outcome or period.</div>}</section>
      </div>
      <details className="ci-method"><summary>Calculation and event definitions</summary><ul>{Object.entries(result.definitions||{}).map(([key,value])=><li key={key}><strong>{key.replace(/([A-Z])/g,' $1')}:</strong> {value}</li>)}</ul></details>
    </>}
  </div>
}
