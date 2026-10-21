import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { fetchProductIntelligence } from '../services/productIntelligenceApi'
import './ProductIntelligence.css'

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const number = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value) || 0)
const shortNumber = (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0)

function Icon({ name, size = 18 }) {
  const paths = {
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    cart: <><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M2 3h2l2.5 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 8H5" /></>,
    rupee: <><path d="M5 4h14M5 8h14M5 4c8 0 8 8 0 8h1l9 8" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" /></>,
    alert: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
    package: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.package}</svg>
}

function Sparkline({ values = [], color = 'currentColor', width = 84, height = 28 }) {
  if (!values || values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const step = width / (values.length - 1)
  const points = values.map((v, i) => {
    const norm = max === min ? 0.5 : (v - min) / (max - min)
    return [i * step, height - 2 - norm * (height - 6)]
  })
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const gid = `pi-spark-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg className="pi-spark" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricCard({ label, value, note, icon, tone, series }) {
  return (
    <article className={`pi-metric pi-tone-${tone}`}>
      <div className="pi-metric-top">
        <span className="pi-metric-label">{label}</span>
        <span className="pi-metric-icon"><Icon name={icon} size={16} /></span>
      </div>
      <div className="pi-metric-body">
        <strong>{value}</strong>
        {series && series.length > 1 && <Sparkline values={series} />}
      </div>
      <p>{note}</p>
      <span className="pi-metric-glow" />
    </article>
  )
}

function ProductRow({ product, rank, metric, format }) {
  const max = Math.max(1, metric.max || product[metric.key] || 1)
  const value = Number(product[metric.key]) || 0
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const initial = (product.brand || product.name || 'P').trim().slice(0, 1).toUpperCase()
  const podium = rank <= 3 ? ` pi-podium-${rank}` : ''
  return (
    <div className={`pi-product-row${podium}`}>
      <div className={`pi-rank pi-rank-${rank}`}>{String(rank).padStart(2, '0')}</div>
      <div className="pi-product-art"><span>{initial}</span><i /></div>
      <div className="pi-product-info">
        <div className="pi-product-name">
          <strong>{product.name}</strong>
          {rank === 1 && <em className="pi-badge-hot">Top</em>}
        </div>
        <span>{[product.brand, product.category || product.subCategory].filter(Boolean).join(' · ') || `Product ID ${product.productId ?? 'unknown'}`}</span>
        <div className="pi-bar-track"><i style={{ width: `${Math.max(value > 0 ? 4 : 0, pct)}%` }} /></div>
      </div>
      <div className="pi-product-value">
        <strong>{format(value)}</strong>
        <span>{metric.caption(product)}</span>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, icon, children, className = '' }) {
  return (
    <section className={`pi-panel ${className}`}>
      <header className="pi-panel-head">
        <span className="pi-panel-icon"><Icon name={icon} /></span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </header>
      {children}
    </section>
  )
}

function opportunityTone(item) {
  const views = Number(item.views) || 0
  const carts = Number(item.cartAdds) || 0
  if (views < 5) return { label: 'Low signal', tone: 'neutral' }
  const ratio = carts / Math.max(1, views)
  if (views >= 50 && ratio < 0.02) return { label: 'High priority', tone: 'hot' }
  if (views >= 20 && ratio < 0.05) return { label: 'Worth a look', tone: 'warm' }
  return { label: 'Watch', tone: 'cool' }
}

export default function ProductIntelligence() {
  const { period, customRange, platform, intelligenceDevice, selectedPersonas } = useFilters()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('bestSellers')
  const [query, setQuery] = useState('')

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true)
    setError('')
    try {
      const result = await fetchProductIntelligence({ period, customRange, platform, device: intelligenceDevice, selectedPersonas })
      setData(result)
    } catch (err) {
      setError(err.message || 'Could not load product analytics.')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [period, customRange?.from, customRange?.to, platform, intelligenceDevice, JSON.stringify(selectedPersonas)])

  useEffect(() => { load() }, [load])

  const products = useMemo(() => {
    if (!data) return []
    const list = tab === 'bestSellers' ? data.bestSellers : tab === 'mostViewed' ? data.mostViewed : data.revenueLeaders
    return (list || []).filter((item) => `${item.name} ${item.brand} ${item.category} ${item.subCategory}`.toLowerCase().includes(query.toLowerCase()))
  }, [data, tab, query])

  // Real per-metric series derived from your own payload — used only for the sparklines.
  const metricSeries = useMemo(() => {
    if (!data) return {}
    return {
      units: (data.bestSellers || []).slice(0, 7).map((p) => Number(p.unitsSold) || 0),
      revenue: (data.revenueLeaders || []).slice(0, 7).map((p) => Number(p.revenue) || 0),
      views: (data.mostViewed || []).slice(0, 7).map((p) => Number(p.views) || 0),
      searches: (data.searchTerms || []).slice(0, 7).map((s) => Number(s.searches) || 0),
    }
  }, [data])

  const periodLabel = period === 'custom' && customRange?.from && customRange?.to ? `${customRange.from} – ${customRange.to}` : ({ '1d': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '180d': 'Last 180 days' }[period] || 'Selected period')
  const metrics = data?.metrics || {}
  const noData = !loading && data && !data.coverage?.eventsScanned

  return (
    <div className="pi-page">
      <div className="pi-hero">
        <div className="pi-hero-orb pi-orb-one" />
        <div className="pi-hero-orb pi-orb-two" />
        <div className="pi-hero-content">
          <div className="pi-eyebrow"><span /> COMMERCE INTELLIGENCE <span className="pi-eyebrow-line" /></div>
          <h1>Product <em>Intelligence</em></h1>
          <p>See what shoppers want, what they buy, and where product demand is leaking away.</p>
          <div className="pi-hero-stats">
            <div className="pi-hero-stat"><strong>{loading ? '—' : number(metrics.unitsSold)}</strong><span>Units sold</span></div>
            <div className="pi-hero-stat"><strong>{loading ? '—' : money(metrics.productRevenue)}</strong><span>Revenue</span></div>
            <div className="pi-hero-stat"><strong>{loading ? '—' : shortNumber(metrics.productViews)}</strong><span>Views</span></div>
          </div>
          <div className="pi-hero-meta">
            <span><i /> Project-scoped analytics</span>
            <b>·</b>
            <span>{periodLabel}</span>
            <b>·</b>
            <span>{platform === 'combined' ? 'All platforms' : platform === 'web' ? 'Desktop web' : 'Mobile & tablet'}</span>
          </div>
        </div>
        <div className="pi-hero-visual">
          <div className="pi-orbit pi-orbit-outer" />
          <div className="pi-orbit pi-orbit-inner" />
          <div className="pi-hero-glyph"><Icon name="package" size={35} /></div>
          <span className="pi-float pi-float-a"><Icon name="eye" size={13} /> Interest</span>
          <span className="pi-float pi-float-b"><Icon name="cart" size={13} /> Sales</span>
          <span className="pi-float pi-float-c"><Icon name="spark" size={13} /> Insights</span>
        </div>
      </div>

      {error && <div className="pi-error"><Icon name="alert" /><span>{error}</span><button onClick={() => load()}>Retry</button></div>}

      <div className="pi-toolbar">
        <div>
          <span className="pi-toolbar-dot" />
          <strong>Product performance</strong>
          <span className="pi-toolbar-muted">Signals from real tracked events</span>
        </div>
        <button className="pi-refresh" onClick={() => load(true)} disabled={loading || refreshing}>
          <Icon name="refresh" size={15} />
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>

      <div className="pi-metrics-grid">
        <MetricCard label="Units sold" value={loading ? '—' : number(metrics.unitsSold)} note={`${number(metrics.orders)} orders with product line items`} icon="cart" tone="purple" series={metricSeries.units} />
        <MetricCard label="Product revenue" value={loading ? '—' : money(metrics.productRevenue)} note="Calculated from purchase line items" icon="rupee" tone="green" series={metricSeries.revenue} />
        <MetricCard label="Product views" value={loading ? '—' : number(metrics.productViews)} note={`${number(metrics.uniqueViewers)} unique viewers`} icon="eye" tone="blue" series={metricSeries.views} />
        <MetricCard label="Search activity" value={loading ? '—' : number(metrics.searches)} note={`${number(metrics.uniqueSearchers)} unique searchers`} icon="search" tone="amber" series={metricSeries.searches} />
      </div>

      <div className="pi-content-grid">
        <div className="pi-main-column">
          <Panel title="Product leaderboard" subtitle="Compare the products that attract attention and drive sales." icon="package" className="pi-leaderboard">
            <div className="pi-tabs">
              <button className={tab === 'bestSellers' ? 'active' : ''} onClick={() => setTab('bestSellers')}>Best sellers</button>
              <button className={tab === 'mostViewed' ? 'active' : ''} onClick={() => setTab('mostViewed')}>Most viewed</button>
              <button className={tab === 'revenueLeaders' ? 'active' : ''} onClick={() => setTab('revenueLeaders')}>Revenue leaders</button>
            </div>
            <div className="pi-list-toolbar">
              <span>{tab === 'bestSellers' ? 'Ranked by units sold' : tab === 'mostViewed' ? 'Ranked by product views' : 'Ranked by product revenue'}</span>
              <label><Icon name="search" size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a product" aria-label="Find a product" /></label>
            </div>
            {loading ? (
              <div className="pi-state"><span className="pi-spinner" /><strong>Gathering product signals…</strong><p>Aggregating views, carts and purchase line items.</p></div>
            ) : products.length ? (
              <div className="pi-product-list">
                {products.map((product, index) => {
                  const key = tab === 'bestSellers' ? 'unitsSold' : tab === 'mostViewed' ? 'views' : 'revenue'
                  const max = Math.max(...products.map((p) => Number(p[key]) || 0), 1)
                  return <ProductRow key={`${product.productId}-${tab}`} product={product} rank={index + 1} metric={{ key, max, caption: (p) => tab === 'bestSellers' ? `${number(p.orders)} orders` : tab === 'mostViewed' ? `${number(p.uniqueViewers)} unique viewers` : `${number(p.unitsSold)} units sold`, }} format={tab === 'revenueLeaders' ? money : number} />
                })}
              </div>
            ) : (
              <div className="pi-empty"><span><Icon name="package" size={22} /></span><strong>{query ? 'No matching products' : 'No product data for this period'}</strong><p>{query ? 'Try another product name, brand or category.' : 'Once product views, add-to-cart events and purchase line items are recorded, rankings will appear here.'}</p></div>
            )}
            <div className="pi-panel-foot">Product sales are based on purchase line items, not purchase-event count. Product names are enriched from event properties and the bundled catalogue where possible.</div>
          </Panel>

          <Panel title="Search demand" subtitle="What shoppers are actively looking for." icon="search" className="pi-search-panel">
            {loading ? (
              <div className="pi-skeleton-lines"><i /><i /><i /><i /></div>
            ) : data?.searchTerms?.length ? (
              <div className="pi-search-list">
                {data.searchTerms.slice(0, 8).map((item, index) => {
                  const max = Math.max(1, data.searchTerms[0].searches)
                  return (
                    <div className="pi-search-row" key={item.query}>
                      <span className="pi-search-rank">{String(index + 1).padStart(2, '0')}</span>
                      <div className="pi-search-copy">
                        <div className="pi-search-title">
                          <strong>{item.query}</strong>
                          {index === 0 && <em className="pi-badge-hot">Top query</em>}
                        </div>
                        <span>{number(item.uniqueSearchers)} unique searchers{item.averageResults != null ? ` · ${item.averageResults} avg. results` : ''}</span>
                        <div className="pi-bar-track"><i style={{ width: `${Math.max(4, (item.searches / max) * 100)}%` }} /></div>
                      </div>
                      <div className="pi-search-count"><strong>{number(item.searches)}</strong><span>searches</span></div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="pi-empty pi-empty-compact"><span><Icon name="search" size={20} /></span><strong>No search terms recorded</strong><p>Track <code>search_performed</code> with <code>properties.searchQuery</code> to unlock this view.</p></div>
            )}
            <div className="pi-note"><Icon name="alert" size={14} /><span>Search terms show query demand; they are not attributed to specific products unless search-result click events are tracked.</span></div>
          </Panel>
        </div>

        <aside className="pi-side-column">
          <Panel title="Growth opportunities" subtitle="Products that may deserve a closer look." icon="spark" className="pi-opportunities">
            {loading ? (
              <div className="pi-skeleton-lines"><i /><i /><i /></div>
            ) : data?.opportunities?.length ? (
              <div className="pi-opportunity-list">
                {data.opportunities.map((item) => {
                  const sev = opportunityTone(item)
                  const views = Number(item.views) || 0
                  const carts = Number(item.cartAdds) || 0
                  const leak = views > 0 ? Math.round((1 - carts / views) * 100) : 0
                  return (
                    <article className="pi-opportunity" key={item.productId}>
                      <span className={`pi-opportunity-icon pi-sev-${sev.tone}`}><Icon name="arrow" size={15} /></span>
                      <div>
                        <div className="pi-opportunity-top">
                          <strong>{item.name}</strong>
                          <em className={`pi-tag pi-tag-${sev.tone}`}>{sev.label}</em>
                        </div>
                        <p>{item.reason}</p>
                        <div className="pi-opportunity-stats">
                          <span>{number(views)} views</span>
                          <span>{number(carts)} cart adds</span>
                          {views > 0 && <span className="pi-stat-leak">{leak}% didn’t add</span>}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="pi-opportunity-empty"><span><Icon name="spark" size={22} /></span><strong>No obvious product leakage found</strong><p>This is not proof every product is healthy. The current period may have too little activity to surface a signal.</p></div>
            )}
            <div className="pi-panel-foot">Signals are prioritization hints, not causal conclusions. Check inventory, pricing, traffic quality and purchase attribution before acting.</div>
          </Panel>

          <Panel title="How to read this" subtitle="Definitions behind the rankings." icon="alert" className="pi-integrity">
            <div className="pi-definition"><b>Best sellers</b><p>Sorted by units in purchase line items. Quantities fall back to one when missing.</p></div>
            <div className="pi-definition"><b>Revenue leaders</b><p>Sum of line-item price × quantity. Order totals are not duplicated across products.</p></div>
            <div className="pi-definition"><b>Most searched</b><p>Ranked by query frequency. A query is not treated as a product ID.</p></div>
            <div className="pi-definition"><b>Data coverage</b><p>{data?.coverage?.capped ? 'The 50,000-event safety cap was reached; totals may be incomplete.' : `${number(data?.coverage?.eventsScanned || 0)} matching events scanned for this period.`}</p></div>
          </Panel>
        </aside>
      </div>

      {noData && <div className="pi-footnote">No matching tracked events were found in the selected period. Try a wider date range or verify the selected project.</div>}

      <footer className="pi-footer"><span><i /> Metrics update from the selected project and date range.</span><span>Product Intelligence <b>·</b> Evidence first, assumptions visible.</span></footer>
    </div>
  )
}