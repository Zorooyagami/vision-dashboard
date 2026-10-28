//components/explore/query/QueryBuilderTab.jsx
import { Fragment, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../../services/apiClient'
import { EVENTS } from '../exploreData'

const API = '/api/explore/query-builder'
const PALETTE = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316']

// Static field definitions. The *values* for text fields come from the database
// (GET /options) and are merged in at render time.
const FIELD_OPTIONS = [
  { value: 'platform', label: 'Platform', type: 'text' },
  { value: 'deviceType', label: 'Device type', type: 'text' },
  { value: 'browser', label: 'Browser', type: 'text' },
  { value: 'country', label: 'Country', type: 'text' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'event', label: 'Event name', type: 'text' },
  { value: 'path', label: 'Page path', type: 'text' },
  { value: 'productCategory', label: 'Product category', type: 'text' },
  { value: 'revenue', label: 'Revenue', type: 'number' },
  { value: 'userId', label: 'User ID', type: 'text' },
]
const OPERATORS = [
  { value: 'is', label: 'is' }, { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' }, { value: 'not_contains', label: 'does not contain' },
  { value: 'gt', label: 'greater than' }, { value: 'gte', label: 'at least' },
  { value: 'lt', label: 'less than' }, { value: 'lte', label: 'at most' },
  { value: 'set', label: 'is set' }, { value: 'not_set', label: 'is not set' },
]
const GROUP_OPTIONS = ['Persona', 'Platform', 'Device type', 'Browser', 'Country', 'City', 'Event', 'Page path', 'Day', 'Week', 'Month']
const TIME_GROUPS = new Set(['Day', 'Week', 'Month'])
const RANGE_OPTIONS = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days']
const numericOperators = new Set(['gt', 'gte', 'lt', 'lte'])
const unaryOperators = new Set(['set', 'not_set'])
const METRICS = [
  { key: 'count', label: 'Events' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'uniqueSessions', label: 'Sessions' },
]
const QUICK_STARTS = [
  { label: 'Mobile purchases by day', event: 'purchase', groupBy: 'Day', condition: { field: 'deviceType', operator: 'is', value: 'Mobile' } },
  { label: 'Cart activity by platform', event: 'add_to_cart', groupBy: 'Platform' },
]

let seq = 0
const uid = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`
const newCondition = (patch = {}) => ({ id: uid(), field: 'platform', operator: 'is', value: '', ...patch })
const newGroup = () => ({ id: uid(), logic: 'OR', conditions: [newCondition(), newCondition()] })
const operatorAllowed = (field, op) => field.type === 'number'
  ? numericOperators.has(op) || ['is', 'is_not', 'set', 'not_set'].includes(op)
  : !numericOperators.has(op)
const eventLabel = id => EVENTS.find(e => e.id === id)?.name || id
const fmtNum = v => Number(v || 0).toLocaleString()
const fmtMetric = (metric, v) => metric === 'revenue'
  ? Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
  : fmtNum(v)
const shortLabel = (name, groupBy) => groupBy === 'Day' && /^\d{4}-\d{2}-\d{2}$/.test(name)
  ? new Date(`${name}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  : name

// Day series should show days with zero activity as zeros, not skip them.
function fillDays(rows, range) {
  if (!range) return rows
  const byName = new Map(rows.map(r => [r.name, r]))
  const out = []
  const d = new Date(range.from); d.setUTCHours(0, 0, 0, 0)
  const end = new Date(range.to)
  for (; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const name = d.toISOString().slice(0, 10)
    out.push(byName.get(name) || { id: `gap-${name}`, name, count: 0, revenue: 0, uniqueSessions: 0, uniqueUsers: 0, percent: 0 })
  }
  return out
}
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const m = v / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}

/* ------------------------------ filter UI ------------------------------ */

function LogicChip({ value, onToggle }) {
  return <button type="button" className="qb-logic-chip" title="Click to switch between AND / OR" onClick={() => onToggle(value === 'AND' ? 'OR' : 'AND')}>{value}</button>
}

function ConditionPill({ condition, getOptions, onChange, onRemove }) {
  const field = FIELD_OPTIONS.find(f => f.value === condition.field) || FIELD_OPTIONS[0]
  const list = getOptions(field.value)
  const unary = unaryOperators.has(condition.operator)
  const update = patch => onChange({ ...condition, ...patch })
  const useSelect = !unary && field.type === 'text' && ['is', 'is_not'].includes(condition.operator) && list.length > 0 && list.length <= 25
  const known = list.some(o => o.value === condition.value)
  return <div className="qb-pill">
    <select aria-label="Filter field" className="qb-pill-field" value={condition.field} onChange={e => {
      const next = FIELD_OPTIONS.find(f => f.value === e.target.value)
      update({ field: e.target.value, operator: next?.type === 'number' ? 'gt' : 'is', value: '' })
    }}>{FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
    <select aria-label="Filter operator" className="qb-pill-op" value={condition.operator} onChange={e => update({ operator: e.target.value })}>
      {OPERATORS.filter(o => operatorAllowed(field, o.value)).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {unary ? null : useSelect
      ? <select aria-label="Filter value" className="qb-pill-value" value={condition.value} onChange={e => update({ value: e.target.value })}>
        <option value="">Choose…</option>
        {condition.value && !known && <option value={condition.value}>{condition.value}</option>}
        {list.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      : <input aria-label="Filter value" className="qb-pill-value" type={field.type === 'number' ? 'number' : 'text'}
        list={field.type === 'text' && list.length ? `qb-dl-${field.value}` : undefined}
        placeholder={field.type === 'number' ? 'Amount' : 'Value'} value={condition.value}
        style={{ width: Math.max(80, Math.min(220, (String(condition.value).length + 3) * 8)) }}
        onChange={e => update({ value: e.target.value })} />}
    <button type="button" className="qb-pill-x" aria-label="Remove condition" title="Remove" onClick={onRemove}>×</button>
  </div>
}

function FilterGroup({ group, getOptions, onChange, onRemove }) {
  const patch = (id, next) => onChange({ ...group, conditions: group.conditions.map(c => c.id === id ? next : c) })
  const remove = id => {
    const rest = group.conditions.filter(c => c.id !== id)
    rest.length ? onChange({ ...group, conditions: rest }) : onRemove()
  }
  return <div className="qb-group">
    <span className="qb-paren">(</span>
    {group.conditions.map((c, i) => <Fragment key={c.id}>
      {i > 0 && <LogicChip value={group.logic} onToggle={logic => onChange({ ...group, logic })} />}
      <ConditionPill condition={c} getOptions={getOptions} onChange={next => patch(c.id, next)} onRemove={() => remove(c.id)} />
    </Fragment>)}
    <button type="button" className="qb-mini-add" title="Add condition to group" onClick={() => onChange({ ...group, conditions: [...group.conditions, newCondition()] })}>+</button>
    <span className="qb-paren">)</span>
    <button type="button" className="qb-group-x" title="Remove group" aria-label="Remove group" onClick={onRemove}>×</button>
  </div>
}

/* ------------------------------- charts -------------------------------- */

function TrendChart({ rows, metric, groupBy }) {
  const [hover, setHover] = useState(null)
  if (!rows.length) return null
  const W = 800, H = 300, L = 56, R = 20, T = 20, B = 36
  const values = rows.map(r => Number(r[metric]) || 0)
  const max = niceMax(Math.max(...values, 4))
  const n = rows.length
  const x = i => n === 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (n - 1)
  const y = v => T + (H - T - B) * (1 - v / max)
  const pts = values.map((v, i) => [x(i), y(v)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = n > 1 ? `${line} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : ''
  const step = Math.max(1, Math.ceil(n / 8))
  const band = (W - L - R) / Math.max(n - 1, 1)
  return <div className="qb-trend">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${METRICS.find(m => m.key === metric)?.label} by ${groupBy.toLowerCase()}`}>
      <defs>
        <linearGradient id="qb-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366F1" stopOpacity=".35" /><stop offset="1" stopColor="#6366F1" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map(t => {
        const v = (max * t) / 4
        return <g key={t}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#E2E8F0" strokeDasharray={t ? '3 4' : ''} />
          <text x={L - 10} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{metric === 'revenue' ? fmtMetric(metric, v) : Math.round(v).toLocaleString()}</text></g>
      })}
      {area && <path d={area} fill="url(#qb-area)" />}
      {n > 1 && <path d={line} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {rows.map((r, i) => i % step === 0 && <text key={r.id || r.name} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#64748B">{shortLabel(r.name, groupBy)}</text>)}
      {hover !== null && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={T} y2={H - B} stroke="#A5B4FC" strokeDasharray="4 4" />}
      {pts.map((p, i) => (n <= 40 || i === hover) && <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 5.5 : 3.5} fill="#fff" stroke="#6366F1" strokeWidth="2.5" />)}
      {pts.map((p, i) => <rect key={i} x={p[0] - band / 2} y={T} width={Math.max(band, 14)} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)}
    </svg>
    {hover !== null && <div className="qb-tip" style={{ left: `${(pts[hover][0] / W) * 100}%`, top: `${(pts[hover][1] / H) * 100}%` }}>
      <span>{shortLabel(rows[hover].name, groupBy)}</span><strong>{fmtMetric(metric, values[hover])}</strong>
    </div>}
  </div>
}

function BarChart({ rows, metric }) {
  const shown = rows.slice(0, 12)
  const sum = rows.reduce((s, r) => s + (Number(r[metric]) || 0), 0)
  const max = Math.max(...shown.map(r => Number(r[metric]) || 0), 1)
  return <div className="qb-bars">
    {shown.map((r, i) => {
      const v = Number(r[metric]) || 0
      const c = PALETTE[i % PALETTE.length]
      return <div className="qb-bar-row" key={r.id}>
        <div className="qb-bar-label" title={r.name}>{r.name}</div>
        <div className="qb-bar-track"><div className="qb-bar-fill" style={{ width: `${Math.max(2, (v / max) * 100)}%`, background: `linear-gradient(90deg, ${c}, ${c}bb)`, animationDelay: `${i * 40}ms` }} /></div>
        <div className="qb-bar-value"><strong>{fmtMetric(metric, v)}</strong><span>{sum ? ((v / sum) * 100).toFixed(1) : '0.0'}%</span></div>
      </div>
    })}
    {rows.length > shown.length && <p className="qb-bars-more">+ {rows.length - shown.length} more in the table view</p>}
  </div>
}

function DonutChart({ rows, metric }) {
  const sum = rows.reduce((s, r) => s + (Number(r[metric]) || 0), 0)
  const top = rows.slice(0, 6).map(r => ({ name: r.name, value: Number(r[metric]) || 0 }))
  const rest = rows.slice(6).reduce((s, r) => s + (Number(r[metric]) || 0), 0)
  const slices = rest > 0 ? [...top, { name: 'Other', value: rest }] : top
  const Rad = 70, C = 2 * Math.PI * Rad
  let offset = 0
  return <div className="qb-donut">
    <svg viewBox="0 0 200 200" role="img" aria-label="Share breakdown">
      <circle cx="100" cy="100" r={Rad} fill="none" stroke="#EEF2FF" strokeWidth="26" />
      {slices.map((s, i) => {
        const len = sum ? (s.value / sum) * C : 0
        const el = <circle key={s.name} cx="100" cy="100" r={Rad} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="26"
          strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)" />
        offset += len
        return el
      })}
      <text x="100" y="98" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0F172A">{fmtMetric(metric, sum)}</text>
      <text x="100" y="116" textAnchor="middle" fontSize="10" fill="#94A3B8">{METRICS.find(m => m.key === metric)?.label}</text>
    </svg>
    <ul className="qb-legend">
      {slices.map((s, i) => <li key={s.name}><i style={{ background: PALETTE[i % PALETTE.length] }} /><span title={s.name}>{s.name}</span><strong>{sum ? ((s.value / sum) * 100).toFixed(1) : '0.0'}%</strong></li>)}
    </ul>
  </div>
}

function exportCsv(rows, groupBy) {
  const csv = [[groupBy, 'Events', 'Share %', 'Revenue', 'Sessions', 'Users'],
    ...rows.map(r => [r.name, r.count, r.percent, r.revenue, r.uniqueSessions, r.uniqueUsers])]
    .map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'query-results.csv'; link.click(); URL.revokeObjectURL(url)
}

/* ------------------------------- main tab ------------------------------- */

function QueryBuilderTab() {
  const [selectedEvent, setSelectedEvent] = useState('purchase')
  const [groupBy, setGroupBy] = useState('Persona')
  const [timeRange, setTimeRange] = useState('Last 30 days')
  const [conditions, setConditions] = useState([])
  const [logic, setLogic] = useState('AND')
  const [groups, setGroups] = useState([])
  const [options, setOptions] = useState({})
  const [optionsLoaded, setOptionsLoaded] = useState(false)
  const [viewMode, setViewMode] = useState('bars')
  const [metric, setMetric] = useState('count')
  const [savedQueries, setSavedQueries] = useState([])
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [runState, setRunState] = useState('idle')
  const [validationMessage, setValidationMessage] = useState('')
  const [resultRows, setResultRows] = useState([])
  const [queryTotal, setQueryTotal] = useState(0)
  const [totals, setTotals] = useState(null)
  const [ran, setRan] = useState(null)
  const [truncated, setTruncated] = useState(false)
  const [queryDiagnostics, setQueryDiagnostics] = useState(null)

  // Dropdown values straight from the database.
  useEffect(() => {
    let cancelled = false
    apiFetch(`${API}/options`).then(data => {
      if (cancelled) return
      setOptions(data.options || {})
      const events = (data.options?.event || []).map(o => o.value)
      if (events.length) setSelectedEvent(cur => cur === '*' || events.includes(cur) ? cur : '*')
      setOptionsLoaded(true)
    }).catch(() => { if (!cancelled) setOptionsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    apiFetch(`${API}/saved`).then(data => {
      if (!cancelled) setSavedQueries(data.items || [])
    }).catch(error => {
      if (!cancelled && error.code !== 'PROJECT_REQUIRED') setValidationMessage(error.message || 'Could not load saved queries.')
    })
    return () => { cancelled = true }
  }, [])

  const getOptions = field => (options[field] || []).map(o => ({ value: o.value, count: o.count, label: field === 'event' ? eventLabel(o.value) : o.value }))
  const eventChoices = options.event?.length ? getOptions('event') : EVENTS.map(e => ({ value: e.id, label: e.name }))
  const queryDefinition = { event: selectedEvent, groupBy, timeRange, logic, conditions, groups }
  const filterCount = conditions.length + groups.reduce((n, g) => n + g.conditions.length, 0)

  const resetResults = () => { setRunState('idle'); setResultRows([]); setQueryTotal(0); setTotals(null); setRan(null); setQueryDiagnostics(null); setValidationMessage('') }

  const runQuery = async () => {
    const all = [...conditions, ...groups.flatMap(g => g.conditions)]
    const missing = all.find(c => !unaryOperators.has(c.operator) && !String(c.value ?? '').trim())
    if (missing) {
      setValidationMessage(`Add a value for ${FIELD_OPTIONS.find(f => f.value === missing.field)?.label || missing.field}, or remove that condition.`)
      setRunState('invalid')
      return
    }
    setValidationMessage('')
    setRunState('loading')
    try {
      const data = await apiFetch(`${API}/execute`, { method: 'POST', body: JSON.stringify({ definition: queryDefinition }) })
      const isTime = TIME_GROUPS.has(groupBy)
      setResultRows(data.rows || [])
      setQueryTotal(data.total || 0)
      setTotals(data.totals || null)
      setTruncated(!!data.truncated)
      setQueryDiagnostics(data.diagnostics || null)
      setRan({ groupBy, event: selectedEvent, timeRange, range: data.range, isTime })
      setViewMode(isTime ? 'trend' : 'bars')
      setMetric('count')
      setRunState('success')
    } catch (error) {
      setValidationMessage(error.message || 'Could not run this query.')
      setRunState('error')
    }
  }

  const saveQuery = async () => {
    if (!saveName.trim()) { setValidationMessage('Enter a name before saving this query.'); return }
    try {
      const saved = await apiFetch(`${API}/saved`, { method: 'POST', body: JSON.stringify({ name: saveName.trim(), definition: queryDefinition }) })
      setSavedQueries(qs => [saved, ...qs])
      setSaveName(''); setShowSave(false); setValidationMessage('')
    } catch (error) { setValidationMessage(error.message || 'Could not save this query.') }
  }

  const applyDefinition = def => {
    setSelectedEvent(def.event || '*'); setGroupBy(def.groupBy || 'Persona'); setTimeRange(def.timeRange || 'Last 30 days')
    setConditions(def.conditions || []); setLogic(def.logic || 'AND'); setGroups(def.groups || [])
    resetResults()
  }
  const loadQuery = q => applyDefinition(q.definition || { event: q.event, groupBy: q.groupBy })
  const loadQuick = q => applyDefinition({ event: q.event, groupBy: q.groupBy, conditions: q.condition ? [newCondition(q.condition)] : [] })

  /* ----- derived result data ----- */
  const chartRows = useMemo(() => {
    if (!ran) return []
    if (ran.isTime) {
      const rows = resultRows.filter(r => r.name !== 'Unknown')
      return ran.groupBy === 'Day' ? fillDays(rows, ran.range) : rows
    }
    return [...resultRows].sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0))
  }, [ran, resultRows, metric])
  const top = useMemo(() => [...resultRows].sort((a, b) => b.count - a.count)[0], [resultRows])
  const hasRevenue = (totals?.revenue || 0) > 0
  const views = ['table', 'bars', ran?.isTime ? 'trend' : 'donut']
  const viewLabel = { table: 'Table', bars: 'Bars', trend: 'Trend', donut: 'Share' }

  const subtitle = ran
    ? `${ran.event === '*' ? 'All events' : eventLabel(ran.event)} · by ${ran.groupBy.toLowerCase()} · ${ran.timeRange.toLowerCase()}`
    : 'Run a query to see your numbers here.'

  let body
  if (runState === 'idle') {
    body = <div className="qb-empty"><div className="qb-empty-art" aria-hidden="true"><i /><i /><i /><i /></div><strong>Nothing to show yet</strong><span>Choose an event and a breakdown, add filters if you need them, then select Run query.</span></div>
  } else if (runState === 'loading') {
    body = <div className="qb-empty"><div className="qb-spinner" aria-hidden="true" /><strong>Running query…</strong><span>Reading live event data for this project.</span></div>
  } else if (runState === 'error' || runState === 'invalid') {
    body = <div role="alert" className="qb-empty qb-empty-error"><strong>This query could not run</strong><span>{validationMessage || 'Fix the query and try again.'}</span></div>
  } else if (resultRows.length === 0) {
    body = <div className="qb-empty"><strong>No events matched this query</strong><span>Try removing a filter or choosing a wider date range.</span>
      {queryDiagnostics && <div className="qb-diag">
        <div><span>Events in this project</span><b>{fmtNum(queryDiagnostics.projectEvents)}</b></div>
        <div><span>In the selected date range</span><b>{fmtNum(queryDiagnostics.eventsInRange)}</b></div>
        <div><span>Matching the selected event</span><b>{fmtNum(queryDiagnostics.selectedEventInRange)}</b></div>
        <div><span>After all filters</span><b>{fmtNum(queryDiagnostics.eventsAfterFilters)}</b></div>
        {ran?.event === 'add_to_cart' && conditions.some(c => c.field === 'revenue') && <p>add_to_cart events often carry no revenue. Try the purchase event for revenue filters, or drop the revenue filter.</p>}
      </div>}
    </div>
  } else if (viewMode === 'table') {
    body = <div className="qb-table-wrap"><table className="qb-table"><thead><tr><th>{ran.groupBy}</th><th>Events</th><th>Share</th><th>Revenue</th><th>Sessions</th><th>Users</th></tr></thead>
      <tbody>{resultRows.map((r, i) => <tr key={r.id}>
        <td><i className="qb-dot" style={{ background: PALETTE[i % PALETTE.length] }} />{shortLabel(r.name, ran.groupBy)}</td>
        <td><b>{fmtNum(r.count)}</b></td>
        <td><div className="qb-share"><div><span style={{ width: `${Math.min(100, r.percent)}%` }} /></div>{Number(r.percent || 0).toFixed(1)}%</div></td>
        <td>{fmtMetric('revenue', r.revenue)}</td><td>{fmtNum(r.uniqueSessions)}</td><td>{fmtNum(r.uniqueUsers)}</td>
      </tr>)}</tbody></table></div>
  } else {
    body = <div className="qb-chart-area">
      <div className="qb-metric-bar"><span>Measure</span>
        <div className="qb-metric">{METRICS.map(m => <button key={m.key} type="button" className={metric === m.key ? 'active' : ''} disabled={m.key === 'revenue' && !hasRevenue} title={m.key === 'revenue' && !hasRevenue ? 'No revenue in these results' : ''} onClick={() => setMetric(m.key)}>{m.label}</button>)}</div></div>
      {viewMode === 'trend' ? <TrendChart rows={chartRows} metric={metric} groupBy={ran.groupBy} />
        : viewMode === 'donut' ? <DonutChart rows={chartRows} metric={metric} />
          : <BarChart rows={chartRows} metric={metric} />}
    </div>
  }

  const success = runState === 'success' && resultRows.length > 0

  return <div className="qb-root">
    <style>{`
      .qb-root{--ink:#0F172A;--muted:#64748B;--line:#E2E8F0;--accent:#6366F1;--accent-dark:#4F46E5;flex:1;min-height:0;overflow:auto;background:#F4F6FB;color:var(--ink);font-size:13px}
      .qb-main{max-width:1180px;margin:0 auto;padding:22px 24px 40px}
      .qb-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}.qb-title{font-size:20px;font-weight:800;letter-spacing:-.02em;margin:0}.qb-sub{font-size:12px;color:var(--muted);margin:4px 0 0}
      .qb-strip{display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:2px;margin-bottom:14px}.qb-strip-label{font-size:11px;font-weight:700;color:#94A3B8;margin-right:4px;white-space:nowrap}
      .qb-chip{border:1px solid var(--line);background:#fff;color:#334155;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:650;cursor:pointer;white-space:nowrap}.qb-chip:hover{border-color:#A5B4FC;color:var(--accent-dark)}.qb-chip.quick{border-style:dashed}
      .qb-bar{background:#fff;border:1px solid #E8EDF5;border-radius:16px;padding:14px 16px;margin-bottom:20px;box-shadow:0 1px 3px rgba(15,23,42,.04)}
      .qb-query-line{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.qb-word{font-size:12px;font-weight:600;color:var(--muted)}
      .qb-select{height:34px;border:1px solid #DCE3EE;border-radius:9px;background:#fff;color:#334155;padding:0 10px;font-size:12px;outline:none;min-width:0;max-width:240px}.qb-select:focus,.qb-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.12)}.qb-event-select{background:#EEF2FF;border-color:#C7D2FE;color:#4338CA;font-weight:700}
      .qb-run{margin-left:auto;border:0;background:linear-gradient(135deg,#6366F1,#4F46E5);color:#fff;border-radius:10px;height:36px;padding:0 18px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(79,70,229,.3)}.qb-run:hover{filter:brightness(1.08)}.qb-run:disabled{opacity:.7;cursor:wait}
      .qb-filters{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}.qb-where{font-size:12px;font-weight:700;color:var(--muted);line-height:32px;white-space:nowrap}
      .qb-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex:1;min-width:0}
      .qb-pill{display:inline-flex;align-items:center;height:32px;border:1px solid #DCE3EE;border-radius:999px;background:#fff;padding:0 4px 0 6px;transition:border-color .15s,box-shadow .15s}.qb-pill:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
      .qb-pill select,.qb-pill input{border:0;background:transparent;height:28px;font-size:12px;color:#334155;outline:none;padding:0 4px;max-width:170px;min-width:0}.qb-pill-field{font-weight:700;color:#4338CA!important}.qb-pill-op{color:var(--muted)!important}
      .qb-pill-x{width:22px;height:22px;border:0;border-radius:50%;background:transparent;color:#94A3B8;font-size:16px;line-height:1;cursor:pointer}.qb-pill-x:hover{background:#FEE2E2;color:#DC2626}
      .qb-logic-chip{height:22px;border:0;border-radius:6px;background:#EEF2FF;color:var(--accent-dark);font-size:10px;font-weight:800;padding:0 8px;cursor:pointer}.qb-logic-chip:hover{background:#E0E7FF}
      .qb-group{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px;border:1.5px dashed #A5B4FC;border-radius:18px;background:#F8F9FF}.qb-paren{font-size:20px;font-weight:300;color:#818CF8;line-height:1}
      .qb-mini-add{width:24px;height:24px;border-radius:50%;border:1px dashed #A5B4FC;background:#fff;color:var(--accent-dark);font-size:15px;line-height:1;cursor:pointer}.qb-group-x{border:0;background:transparent;color:#94A3B8;font-size:16px;cursor:pointer}.qb-group-x:hover{color:#DC2626}
      .qb-add{height:32px;border:1px dashed #C7D2FE;border-radius:999px;background:transparent;color:var(--accent-dark);font-size:12px;font-weight:700;padding:0 12px;cursor:pointer}.qb-add:hover{background:#EEF2FF}
      .qb-validation{margin-top:10px;border-radius:8px;padding:8px 11px;font-size:11px;color:#B91C1C;background:#FEF2F2;border:1px solid #FECACA}
      .qb-results{background:#fff;border-radius:20px;overflow:hidden;border:1px solid #DDE3FF;box-shadow:0 18px 40px -12px rgba(67,56,202,.28)}
      .qb-results-head{background:linear-gradient(125deg,#1E1B4B 0%,#3730A3 55%,#6366F1 100%);color:#fff;padding:20px 24px}
      .qb-results-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}.qb-results-top h3{margin:0;font-size:18px;font-weight:800;letter-spacing:-.01em}.qb-results-top p{margin:5px 0 0;font-size:12px;color:#C7D2FE}
      .qb-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.qb-seg{display:inline-flex;background:rgba(255,255,255,.14);border-radius:10px;padding:3px}.qb-seg button{border:0;background:transparent;color:#E0E7FF;font-size:11px;font-weight:700;padding:6px 12px;border-radius:7px;cursor:pointer}.qb-seg button.active{background:#fff;color:#3730A3}
      .qb-ghost{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;border-radius:9px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer}.qb-ghost:hover:not(:disabled){background:rgba(255,255,255,.2)}.qb-ghost:disabled{opacity:.45;cursor:not-allowed}
      .qb-save-inline{display:flex;gap:6px;align-items:center}.qb-input{height:32px;border:1px solid #DCE3EE;border-radius:8px;padding:0 10px;font-size:12px;width:140px;outline:none;color:#0F172A}.qb-solid{border:0;background:#fff;color:#3730A3;border-radius:9px;padding:7px 12px;font-size:11px;font-weight:800;cursor:pointer}
      .qb-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:20px}.qb-kpi{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px 16px;min-width:0}.qb-kpi span{display:block;font-size:11px;color:#C7D2FE;font-weight:600}.qb-kpi strong{display:block;font-size:28px;font-weight:800;letter-spacing:-.02em;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qb-kpi em{display:block;font-style:normal;font-size:11px;color:#A5B4FC;margin-top:2px}
      .qb-results-body{padding:22px 24px;min-height:260px}.qb-foot{padding:10px 24px;border-top:1px solid #EEF2FF;color:#94A3B8;font-size:11px;background:#FAFAFF}
      .qb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;min-height:220px;color:var(--muted)}.qb-empty strong{color:#334155;font-size:14px}.qb-empty span{max-width:420px;line-height:1.5}.qb-empty-error strong{color:#B91C1C}
      .qb-empty-art{display:flex;align-items:flex-end;gap:6px;height:44px;margin-bottom:6px}.qb-empty-art i{width:12px;border-radius:4px 4px 0 0;background:linear-gradient(#A5B4FC,#C7D2FE)}.qb-empty-art i:nth-child(1){height:18px}.qb-empty-art i:nth-child(2){height:34px}.qb-empty-art i:nth-child(3){height:26px}.qb-empty-art i:nth-child(4){height:44px}
      .qb-spinner{width:28px;height:28px;border-radius:50%;border:3px solid #E0E7FF;border-top-color:var(--accent);animation:qb-spin .8s linear infinite}@keyframes qb-spin{to{transform:rotate(360deg)}}
      .qb-diag{margin-top:12px;border:1px solid var(--line);border-radius:12px;background:#F8FAFC;padding:6px 14px;width:100%;max-width:420px;text-align:left}.qb-diag div{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #EEF2F7}.qb-diag div:last-of-type{border:0}.qb-diag p{margin:6px 0;color:#92400E;font-size:11px}
      .qb-metric-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:14px;font-size:11px;color:#94A3B8;font-weight:600}.qb-metric{display:inline-flex;background:#F1F5F9;border-radius:9px;padding:3px}.qb-metric button{border:0;background:transparent;color:var(--muted);font-size:11px;font-weight:700;padding:5px 11px;border-radius:7px;cursor:pointer}.qb-metric button.active{background:#fff;color:var(--accent-dark);box-shadow:0 1px 2px rgba(15,23,42,.1)}.qb-metric button:disabled{opacity:.4;cursor:not-allowed}
      .qb-bars{display:flex;flex-direction:column;gap:12px}.qb-bar-row{display:grid;grid-template-columns:minmax(90px,170px) 1fr 110px;align-items:center;gap:14px}.qb-bar-label{font-size:12px;font-weight:700;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qb-bar-track{height:28px;background:#F1F5F9;border-radius:9px;overflow:hidden}.qb-bar-fill{height:100%;border-radius:9px;transform-origin:left;animation:qb-grow .6s cubic-bezier(.2,.8,.2,1) both}@keyframes qb-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      .qb-bar-value{display:flex;align-items:baseline;justify-content:flex-end;gap:8px}.qb-bar-value strong{font-size:13px}.qb-bar-value span{font-size:11px;color:#94A3B8;min-width:42px;text-align:right}.qb-bars-more{margin:2px 0 0;font-size:11px;color:#94A3B8}
      .qb-trend{position:relative}.qb-trend svg{width:100%;height:auto;display:block}.qb-tip{position:absolute;transform:translate(-50%,-130%);background:#0F172A;color:#fff;border-radius:8px;padding:6px 10px;font-size:11px;pointer-events:none;white-space:nowrap;display:flex;flex-direction:column;align-items:center;gap:1px}.qb-tip span{color:#A5B4FC}.qb-tip strong{font-size:13px}
      .qb-donut{display:flex;align-items:center;justify-content:center;gap:36px;flex-wrap:wrap}.qb-donut svg{width:230px;height:230px}.qb-legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;min-width:220px}.qb-legend li{display:grid;grid-template-columns:12px 1fr auto;align-items:center;gap:10px;font-size:12px}.qb-legend i{width:12px;height:12px;border-radius:4px}.qb-legend span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#334155;font-weight:600}
      .qb-table-wrap{overflow-x:auto;margin:-6px -8px}.qb-table{width:100%;border-collapse:collapse}.qb-table th{text-align:right;padding:10px 14px;color:#94A3B8;font-size:11px;font-weight:700;border-bottom:1px solid #EEF2FF}.qb-table td{text-align:right;padding:12px 14px;border-bottom:1px solid #F1F5F9;font-size:12px;color:#475569}.qb-table th:first-child,.qb-table td:first-child{text-align:left}.qb-table td:first-child{color:#0F172A;font-weight:700}.qb-table tbody tr:hover{background:#FAFAFF}.qb-table b{color:#0F172A}.qb-dot{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:9px}
      .qb-share{display:flex;align-items:center;justify-content:flex-end;gap:8px}.qb-share div{width:70px;height:6px;border-radius:4px;background:#EEF2FF;overflow:hidden}.qb-share span{display:block;height:100%;background:var(--accent);border-radius:4px}
      @media(max-width:700px){.qb-main{padding:14px 12px 30px}.qb-filters{flex-direction:column;gap:6px}.qb-run{margin-left:0;width:100%}.qb-bar-row{grid-template-columns:1fr 90px}.qb-bar-track{grid-column:1/-1;grid-row:2}.qb-results-head,.qb-results-body{padding:16px}}
      @media(prefers-reduced-motion:reduce){.qb-bar-fill,.qb-spinner{animation:none}}
    `}</style>

    {FIELD_OPTIONS.filter(f => f.type === 'text').map(f => <datalist key={f.value} id={`qb-dl-${f.value}`}>
      {getOptions(f.value).map(o => <option key={o.value} value={o.value} label={o.label} />)}
    </datalist>)}

    <main className="qb-main">
      <div className="qb-head"><div><h2 className="qb-title">Query Builder</h2><p className="qb-sub">Pick an event, break it down, and filter with AND / OR logic. Dropdown values come from your project’s data.</p></div></div>

      <div className="qb-strip" aria-label="Saved queries and quick starts">
        {savedQueries.length > 0 && <span className="qb-strip-label">Saved</span>}
        {savedQueries.map(q => <button key={q.id} type="button" className="qb-chip" onClick={() => loadQuery(q)}>{q.label}</button>)}
        <span className="qb-strip-label" style={{ marginLeft: savedQueries.length ? 10 : 0 }}>Quick start</span>
        {QUICK_STARTS.map(q => <button key={q.label} type="button" className="qb-chip quick" onClick={() => loadQuick(q)}>{q.label}</button>)}
      </div>

      <section className="qb-bar">
        <div className="qb-query-line">
          <span className="qb-word">Show me</span>
          <select aria-label="Event to analyse" className="qb-select qb-event-select" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            <option value="*">All events</option>
            {selectedEvent !== '*' && !eventChoices.some(o => o.value === selectedEvent) && <option value={selectedEvent}>{eventLabel(selectedEvent)}</option>}
            {eventChoices.map(o => <option key={o.value} value={o.value}>{o.label}{o.count ? ` (${fmtNum(o.count)})` : ''}</option>)}
          </select>
          <span className="qb-word">grouped by</span>
          <select aria-label="Group results by" className="qb-select" value={groupBy} onChange={e => setGroupBy(e.target.value)}>{GROUP_OPTIONS.map(g => <option key={g}>{g}</option>)}</select>
          <span className="qb-word">over</span>
          <select aria-label="Date range" className="qb-select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>{RANGE_OPTIONS.map(r => <option key={r}>{r}</option>)}</select>
          <button type="button" className="qb-run" onClick={runQuery} disabled={runState === 'loading'}>{runState === 'loading' ? 'Running…' : 'Run query'}</button>
        </div>

        <div className="qb-filters">
          <span className="qb-where">Where</span>
          <div className="qb-chips">
            {filterCount === 0 && <span className="qb-word" style={{ fontWeight: 500 }}>no filters, using every matching event</span>}
            {conditions.map((c, i) => <Fragment key={c.id}>
              {i > 0 && <LogicChip value={logic} onToggle={setLogic} />}
              <ConditionPill condition={c} getOptions={getOptions} onChange={next => setConditions(cs => cs.map(x => x.id === c.id ? next : x))} onRemove={() => setConditions(cs => cs.filter(x => x.id !== c.id))} />
            </Fragment>)}
            {groups.map((g, gi) => <Fragment key={g.id}>
              {(conditions.length > 0 || gi > 0) && <LogicChip value={logic} onToggle={setLogic} />}
              <FilterGroup group={g} getOptions={getOptions} onChange={next => setGroups(gs => gs.map(x => x.id === g.id ? next : x))} onRemove={() => setGroups(gs => gs.filter(x => x.id !== g.id))} />
            </Fragment>)}
            <button type="button" className="qb-add" onClick={() => setConditions(cs => [...cs, newCondition()])}>+ Filter</button>
            <button type="button" className="qb-add" onClick={() => setGroups(gs => [...gs, newGroup()])}>+ Group</button>
          </div>
        </div>
        {validationMessage && runState !== 'error' && <div role="alert" className="qb-validation">{validationMessage}</div>}
        {!optionsLoaded && <div className="qb-word" style={{ marginTop: 8, fontSize: 11, fontWeight: 500 }}>Loading values from your data…</div>}
      </section>

      <section className="qb-results" aria-live="polite">
        <div className="qb-results-head">
          <div className="qb-results-top">
            <div><h3>Results</h3><p>{subtitle}</p></div>
            <div className="qb-actions">
              {success && <div className="qb-seg" role="tablist" aria-label="Result view">{views.map(v => <button key={v} type="button" role="tab" aria-selected={viewMode === v} className={viewMode === v ? 'active' : ''} onClick={() => setViewMode(v)}>{viewLabel[v]}</button>)}</div>}
              {showSave
                ? <div className="qb-save-inline"><input className="qb-input" aria-label="Saved query name" autoFocus placeholder="Query name" value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveQuery() }} /><button type="button" className="qb-solid" onClick={saveQuery}>Save</button><button type="button" className="qb-ghost" onClick={() => { setShowSave(false); setSaveName('') }}>Cancel</button></div>
                : <button type="button" className="qb-ghost" onClick={() => { setShowSave(true); setValidationMessage('') }}>Save query</button>}
              <button type="button" className="qb-ghost" disabled={!success} onClick={() => exportCsv(resultRows, ran.groupBy)}>Export CSV</button>
            </div>
          </div>
          {success && <div className="qb-kpis">
            <div className="qb-kpi"><span>Total events</span><strong>{fmtNum(queryTotal)}</strong><em>{resultRows.length} {ran.groupBy.toLowerCase()} group{resultRows.length === 1 ? '' : 's'}</em></div>
            {hasRevenue && <div className="qb-kpi"><span>Revenue</span><strong>{fmtMetric('revenue', totals.revenue)}</strong><em>across matching events</em></div>}
            <div className="qb-kpi"><span>Sessions</span><strong>{fmtNum(totals?.uniqueSessions)}</strong><em>unique</em></div>
            <div className="qb-kpi"><span>Users</span><strong>{fmtNum(totals?.uniqueUsers)}</strong><em>identified, unique</em></div>
            {top && <div className="qb-kpi"><span>{ran.isTime ? `Peak ${ran.groupBy.toLowerCase()}` : `Top ${ran.groupBy.toLowerCase()}`}</span><strong title={top.name}>{shortLabel(top.name, ran.groupBy)}</strong><em>{ran.isTime ? `${fmtNum(top.count)} events` : `${Number(top.percent || 0).toFixed(1)}% of events`}</em></div>}
          </div>}
        </div>
        <div className="qb-results-body">{body}</div>
        <div className="qb-foot">Live results for this project and date range{truncated ? ' · showing the top 100 groups' : ''}</div>
      </section>
    </main>
  </div>
}

export default QueryBuilderTab
