import { useId, useState } from 'react'
import { amount, number } from '../intelligence/shared'

const metricLabel = { sessions: 'Sessions', users: 'Identified users', events: 'Events', orders: 'Purchase events', revenue: 'Revenue', aov: 'Average order value', conversion: 'Session conversion', checkout_conversion: 'Checkout completion', cart_conversion: 'Cart conversion', product_conversion: 'Product conversion', add_to_cart_rate: 'Add-to-cart rate', checkout_abandonment: 'Checkout non-completion', page_views: 'Page views', checkout_sessions: 'Checkout sessions', purchasing_sessions: 'Purchasing sessions' }
const statusLabel = { clarify: 'Needs a little more detail', unsupported: 'Not available in your data', empty: 'No matching sessions' }
const isMoney = key => ['revenue', 'aov'].includes(key)
const isPercent = key => /conversion|rate|abandonment/.test(key)
const value = (v, key, currency) => v == null ? 'Unavailable' : isMoney(key) ? amount(v, currency) : `${number(v)}${isPercent(key) ? '%' : ''}`
const points = (v, key) => v == null ? '—' : `${v > 0 ? '+' : ''}${number(v)}${isPercent(key) ? ' pts' : ''}`

// "11 Oct – 16 Oct" (adds the year only when the range crosses years). Ends are exclusive, so show the last full day.
function dayRange(start, end, zone) {
  const last = new Date(new Date(end).getTime() - 1), sameYear = new Date(start).getFullYear() === last.getFullYear()
  const fmt = (d, year) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}) }).format(d)
  return `${fmt(new Date(start), !sameYear)} – ${fmt(last, !sameYear)}`
}
const dateTime = (v, zone) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v))

function download(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
// Neutralise spreadsheet formulas in text cells, but leave formatted numbers such as "-3.2" or "12%" alone.
const looksNumeric = s => /^[-+−]?[^\d\s]?[\d,.]+\s?(%|pp|pts)?$/.test(s)
function csvCell(v) {
  let s = v == null ? '' : String(v)
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s) && !looksNumeric(s)) s = "'" + s
  return '"' + s.replaceAll('"', '""') + '"'
}
const slug = text => (text || 'dashboard-answer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dashboard-answer'

function DataTable({ columns, rows, caption }) {
  return <div className="ask-data">
    <div className="ask-tabletools"><span>{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span><button type="button" onClick={() => download([columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'), `${slug(caption)}.csv`, 'text/csv;charset=utf-8')}>Download CSV</button></div>
    <div className="ask-tablewrap" tabIndex={0} role="region" aria-label={caption}><table><caption className="ask-sr">{caption}</caption><thead><tr>{columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell ?? '—'}</td>)}</tr>)}</tbody></table></div>
  </div>
}

function Bars({ rows, metric, currency }) {
  const max = Math.max(1, ...rows.flatMap(r => [Math.abs(r.values[metric].current || 0), Math.abs(r.values[metric].previous || 0)]))
  return <div className="ask-bars" role="img" aria-label={`${metricLabel[metric]} by group. Exact values are in the data table.`}>
    {rows.map(r => {
      const v = r.values[metric]
      return <div key={r.key} className="ask-bar-row"><strong>{r.label}</strong><div className="ask-bar-pair">
        <div className="ask-bar-line"><div className="ask-bar-track"><i style={{ width: `${Math.abs(v.current || 0) / max * 100}%` }} /></div><span>{value(v.current, metric, currency)}</span></div>
        {v.previous != null && <div className="ask-bar-line previous"><div className="ask-bar-track"><i style={{ width: `${Math.abs(v.previous) / max * 100}%` }} /></div><span>{value(v.previous, metric, currency)}</span></div>}
      </div></div>
    })}
  </div>
}

function Line({ rows, metric, currency }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...rows.map(r => r.values[metric].current || 0)), width = 760, height = 220, pad = 36
  const point = (r, i) => ({ x: pad + i / Math.max(1, rows.length - 1) * (width - pad * 2), y: height - pad - (r.values[metric].current || 0) / max * (height - pad * 2) })
  const gaps = rows.some(r => r.values[metric].current == null)
  // Null means unavailable: break the line instead of plotting a misleading zero.
  let drawing = '', pen = false
  rows.forEach((r, i) => { if (r.values[metric].current == null) { pen = false; return } const p = point(r, i); drawing += `${pen ? ' L' : ' M'}${p.x},${p.y}`; pen = true })
  const tip = i => `${rows[i].label}: ${value(rows[i].values[metric].current, metric, currency)}`
  return <div className="ask-line"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${metricLabel[metric]} over time. Use the data table for every value.`}>
    {[0, .5, 1].map(f => <g key={f}><line x1={pad} y1={height - pad - f * (height - pad * 2)} x2={width - pad} y2={height - pad - f * (height - pad * 2)} className="ask-gridline" /><text x={pad} y={height - pad - f * (height - pad * 2) - 7} className="ask-axis" fontSize="10">{number(max * f)}{isPercent(metric) ? '%' : ''}</text></g>)}
    <path d={drawing} fill="none" className="ask-linepath" strokeWidth="3" />
    {rows.map((r, i) => r.values[metric].current == null ? null : <circle key={r.key} cx={point(r, i).x} cy={point(r, i).y} r="5" className="ask-dot" tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}><title>{tip(i)}</title></circle>)}
    {rows.length > 0 && <><text x={pad} y={height - 8} className="ask-axis" fontSize="11">{rows[0].label}</text><text x={width - pad} y={height - 8} textAnchor="end" className="ask-axis" fontSize="11">{rows.at(-1).label}</text></>}
  </svg><div className="ask-chartvalue" aria-live="polite">{hover !== null && rows[hover] ? tip(hover) : gaps ? 'Gaps mean the value could not be calculated' : 'Hover over a point for its value'}</div></div>
}

function Breakdown({ block, currency }) {
  const selectId = useId()
  const [metric, setMetric] = useState(block.metrics[0]), [table, setTable] = useState(block.type === 'table')
  const contribution = block.rows.some(r => r.contribution != null)
  const columns = [block.dimension, ...block.metrics.flatMap(m => [`${metricLabel[m]} · now`, `${metricLabel[m]} · before`, `${metricLabel[m]} · change`]), 'Sessions now', ...(contribution ? ['Impact (pts)', 'Own rate (pts)', 'Traffic mix (pts)'] : [])]
  const rows = block.rows.map(r => [r.label, ...block.metrics.flatMap(m => [value(r.values[m].current, m, currency), value(r.values[m].previous, m, currency), points(r.values[m].absolute, m)]), number(r.sessions), ...(contribution ? [number(r.contribution), number(r.withinContribution), number(r.mixContribution)] : [])])
  const compared = block.rows.some(r => r.values[metric].previous != null)
  return <section className="ask-block">
    <div className="ask-blockhead"><h3>{block.title}</h3><div>
      {block.metrics.length > 1 && <><label className="ask-sr" htmlFor={selectId}>Chart metric</label><select id={selectId} value={metric} onChange={e => setMetric(e.target.value)}>{block.metrics.map(m => <option key={m} value={m}>{metricLabel[m]}</option>)}</select></>}
      {block.rows.length > 0 && block.type !== 'table' && <button type="button" aria-pressed={table} onClick={() => setTable(!table)}>{table ? 'Show chart' : 'Show table'}</button>}
    </div></div>
    {!block.rows.length ? <p className="ask-empty">No groups match this selection.</p> : table ? <DataTable columns={columns} rows={rows} caption={block.title} /> : <>
      {compared && <div className="ask-legend"><span className="now">Now</span><span className="before">Previous period</span></div>}
      {block.type === 'groupCards' ? <div className="ask-metrics">{block.rows.map(r => <div className="ask-metric" key={r.key}><span>{r.label}</span><strong>{value(r.values[metric].current, metric, currency)}</strong><small>{number(r.sessions)} sessions</small></div>)}</div>
        : block.type === 'line' ? <Line rows={block.rows} metric={metric} currency={currency} /> : <Bars rows={block.rows} metric={metric} currency={currency} />}
    </>}
    {block.truncated && <p className="ask-footnote">Showing the top {block.rows.length} of {block.totalGroups}, ranked by {metricLabel[block.metrics[0]]}.</p>}
  </section>
}

function Funnel({ block }) {
  const compared = block.rows.some(r => r.previousReach != null)
  return <section className="ask-block"><h3>{block.title}</h3>
    {compared && <div className="ask-legend"><span className="now">Now</span><span className="before">Previous period</span></div>}
    {block.rows.map(row => <div className="ask-funnel-row" key={row.key}><strong>{row.label}</strong>
      <div><div className="ask-bar-track"><i style={{ width: `${row.reach || 0}%` }} /></div>{row.previousReach != null && <div className="ask-bar-track previous"><i style={{ width: `${row.previousReach}%` }} /></div>}</div>
      <span>{row.reach == null ? '—' : `${number(row.reach)}%`}<small>{number(row.current)} sessions</small></span></div>)}
    <details><summary>Stage-by-stage numbers</summary><DataTable caption={block.title} columns={['Stage', 'Sessions now', 'Sessions before', 'Reach now %', 'Reach before %', 'Step completion now %', 'Step completion before %', 'Lost at this step']} rows={block.rows.map(r => [r.label, number(r.current), r.previous == null ? '—' : number(r.previous), r.reach == null ? '—' : number(r.reach), r.previousReach == null ? '—' : number(r.previousReach), r.stepRate == null ? '—' : number(r.stepRate), r.previousStepRate == null ? '—' : number(r.previousStepRate), number(r.lost)])} /></details>
  </section>
}

function Drivers({ block, currency }) {
  const max = Math.max(1, ...block.rows.map(r => Math.abs(r.value)))
  return <section className="ask-block"><h3>{block.title}</h3>{block.rows.map(r => <div className="ask-driver" key={r.label}><div><span>{r.label}</span><b>{r.value > 0 ? '+' : ''}{amount(r.value, currency)}</b></div><div className="ask-bar-track"><i className={r.value < 0 ? 'negative' : ''} style={{ width: `${Math.abs(r.value) / max * 100}%` }} /></div></div>)}</section>
}

function CardsTable({ rows, currency, comparison = false }) {
  if (comparison) return <div className="ask-block">{rows.map(r => <div key={r.key}><h3>{r.label}</h3><Bars metric={r.key} currency={currency} rows={[{ key: r.key, label: r.label, values: { [r.key]: r } }]} /></div>)}</div>
  return <DataTable caption="Metric comparison" columns={['Metric', 'Now', 'Before', 'Change', 'Change %']} rows={rows.map(r => [r.label, value(r.current, r.key, currency), value(r.previous, r.key, currency), r.absolute == null ? '—' : points(r.absolute, r.key), r.relative == null ? '—' : `${number(r.relative)}%`])} />
}

function Scope({ scope, plan }) {
  const parts = [scope.devices.length ? scope.devices.join(' + ') : null, scope.personas.length ? scope.personas.join(' + ') : null, scope.platform !== 'combined' ? (scope.platform === 'web' ? 'Web' : 'App') : null].filter(Boolean)
  const compared = plan.compare !== 'none'
  return <p className="ask-scopeline">
    <span>{parts.length ? parts.join(' · ') : 'All traffic'}</span>
    <span>{dayRange(scope.start, scope.end, scope.timezone)}</span>
    {compared && <span className="muted">vs {dayRange(scope.previousStart, scope.previousEnd, scope.timezone)}</span>}
  </p>
}

export default function AnswerCard({ answer, onAsk, busy }) {
  const [copied, setCopied] = useState(false), [copyError, setCopyError] = useState(false)
  const { scope } = answer, problem = answer.status in statusLabel
  const notes = answer.notes || [], definitions = answer.definitions || [], warnings = answer.warnings || [], observations = answer.observations || []
  const hasDetails = scope || notes.length || definitions.length
  async function copy() {
    try { await navigator.clipboard.writeText([answer.headline, ...observations, ...warnings].join('\n\n')); setCopied(true); setCopyError(false); setTimeout(() => setCopied(false), 2000) } catch { setCopyError(true) }
  }
  return <article className="ask-answer" aria-label="Dashboard answer">
    <div className="ask-answer-top">
      {problem ? <span className="ask-status muted">{statusLabel[answer.status]}</span> : <span />}
      <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy answer'}</button>
    </div>
    {copyError && <p role="status" className="ask-footnote">Clipboard is unavailable. Select the text to copy it.</p>}
    <h2>{answer.headline}</h2>
    {scope && !problem && <Scope scope={scope} plan={answer.plan} />}
    {observations.length > 0 && <div className="ask-observations">{observations.map((text, i) => <p key={i}>{text}</p>)}</div>}
    {answer.cards.length > 1 && <div className="ask-metrics">{answer.cards.map(card => <div className="ask-metric" key={card.key}><span>{card.label}</span><strong>{value(card.current, card.key, answer.currency)}</strong>{card.absolute != null && <small className={card.absolute > 0 ? 'up' : card.absolute < 0 ? 'down' : ''}>{points(card.absolute, card.key)} vs previous</small>}{card.denominator != null && <small>{number(card.numerator)} of {number(card.denominator)} {card.basis || 'sessions'}</small>}</div>)}</div>}
    {answer.blocks.map((block, i) => ['line', 'bar', 'table', 'groupCards'].includes(block.type) ? <Breakdown key={i} block={block} currency={answer.currency} /> : block.type === 'funnel' ? <Funnel key={i} block={block} /> : block.type === 'drivers' ? <Drivers key={i} block={block} currency={answer.currency} /> : <CardsTable key={i} rows={block.rows} currency={answer.currency} comparison={block.type === 'comparison'} />)}
    {warnings.length > 0 && <div className="ask-cautions" role="note"><ul>{warnings.map(w => <li key={w}>{w}</li>)}</ul></div>}
    {answer.notice && <p className="ask-footnote">{answer.notice}</p>}
    {hasDetails && <details className="ask-method"><summary>Scope, definitions and export</summary>
      {scope && <div className="ask-scopefull">
        <p><b>Current period:</b> {dateTime(scope.start, scope.timezone)} → {dateTime(scope.end, scope.timezone)} ({scope.timezone})</p>
        {answer.plan.compare !== 'none' && <p><b>Compared with:</b> {dateTime(scope.previousStart, scope.timezone)} → {dateTime(scope.previousEnd, scope.timezone)}. {scope.comparisonLabel}.</p>}
        <p>These filters apply to this answer only; the dashboard filters stay unchanged. Interpreted by {answer.mode === 'gemini' ? 'Gemini' : 'the built-in parser'}; every figure is calculated on the server.</p>
      </div>}
      {definitions.length > 0 && <ul>{definitions.map(d => <li key={d}>{d}</li>)}</ul>}
      {notes.length > 0 && <ul>{notes.map(n => <li key={n}>{n}</li>)}</ul>}
      {scope && <p className="ask-detailfoot">{answer.generatedAt ? `Calculated ${dateTime(answer.generatedAt, scope.timezone)}. ` : ''}No significance test is run and no cause is claimed. <button type="button" className="ask-linkbtn" onClick={() => download(JSON.stringify(answer, null, 2), 'dashboard-answer.json', 'application/json')}>Download data (JSON)</button></p>}
    </details>}
    {answer.followUps.length > 0 && <div className="ask-followups">{answer.followUps.map(q => <button key={q} type="button" disabled={busy} onClick={() => onAsk(q, answer.context)}>{q} →</button>)}</div>}
  </article>
}
