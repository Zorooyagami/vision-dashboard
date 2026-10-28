import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useFilters } from '../context/FiltersContext'
import { apiFetch } from '../services/apiClient'
import './AudienceIntelligence.css'

const fmt = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value) || 0)
const compact = (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0)
const PERIOD_LABELS = { '1d': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '180d': 'Last 180 days' }

function Glyph({ name, size = 18 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const shapes = {
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1.2A4.8 4.8 0 0 1 7.8 14h2.4a4.8 4.8 0 0 1 4.8 4.8V20"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a4.8 4.8 0 0 1 3 4.5V20"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>,
    browser: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 17 6l3 6M4 12l3 6a7 7 0 0 0 11.5-2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    zoomIn: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M10.5 7.5v6m-3-3h6"/></>,
    zoomOut: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5m-13.5-10h6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" {...common} aria-hidden="true">{shapes[name] || shapes.globe}</svg>
}

function Metric({ label, value, note, icon, tone }) {
  return <article className={`ai-metric ai-${tone}`}><div className="ai-metric-head"><span>{label}</span><i><Glyph name={icon} size={17}/></i></div><strong>{value}</strong><p>{note}</p><span className="ai-metric-shine"/></article>
}

function ChartPanel({ title, subtitle, icon, data = [], emptyText = 'No data available yet.' }) {
  const rows = data.slice(0, 7).map((item) => ({ name: item.name, sessions: item.sessions }))
  return <section className="ai-panel"><header className="ai-panel-head"><span className="ai-panel-icon"><Glyph name={icon}/></span><div><h2>{title}</h2><p>{subtitle}</p></div></header>{rows.length ? <div className="ai-chart-wrap"><ResponsiveContainer width="100%" height={230}><BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 4 }} barCategoryGap={10}><CartesianGrid stroke="#edf0f6" horizontal={false}/><XAxis type="number" tick={{ fontSize: 10, fill: '#8792a6' }} axisLine={false} tickLine={false} tickFormatter={compact}/><YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 10, fill: '#59667b' }} axisLine={false} tickLine={false}/><Tooltip cursor={{ fill: '#f5f6ff' }} formatter={(value) => [fmt(value), 'Sessions']} contentStyle={{ border: '1px solid #e9ebf5', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px #17213b12' }}/><Bar dataKey="sessions" fill="url(#audienceBar)" radius={[0, 6, 6, 0]} maxBarSize={20}/><defs><linearGradient id="audienceBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7367f0"/><stop offset="100%" stopColor="#55b9e9"/></linearGradient></defs></BarChart></ResponsiveContainer></div> : <div className="ai-chart-empty">{emptyText}</div>}</section>
}

function WorldMap({ locations }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(null)
  const latestLocationsRef = useRef(locations)
  const [mapError, setMapError] = useState('')
  const validLocations = useMemo(() => locations.filter((p) => {
    const lat = Number(p.latitude)
    const lng = Number(p.longitude)
    return p.latitude !== null && p.latitude !== '' && p.longitude !== null && p.longitude !== '' &&
      Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }), [locations])

  // Keep the latest data available to the asynchronous Leaflet loader. The map
  // itself is initialized once, so a data refresh cannot cancel its onload hook.
  latestLocationsRef.current = validLocations

  const drawCityCircles = useCallback((L, map, points) => {
    const layer = markersRef.current
    if (!layer) return
    layer.clearLayers()
    points.forEach((point) => {
      const lat = Number(point.latitude)
      const lng = Number(point.longitude)
      const sessions = Math.max(1, Number(point.sessions) || 1)
      const radius = Math.max(8, Math.min(24, 7 + Math.sqrt(sessions) * 1.7))
      // A translucent outer ring makes every active city easy to spot, while
      // the inner circle scales with session volume and remains clickable.
      L.circleMarker([lat, lng], {
        radius: radius + 5,
        color: '#7567ee', weight: 1, opacity: 0.24,
        fillColor: '#7567ee', fillOpacity: 0.13,
        interactive: false,
      }).addTo(layer)
      const circle = L.circleMarker([lat, lng], {
        radius,
        color: '#ffffff', weight: 2.5, opacity: 1,
        fillColor: '#6557e8', fillOpacity: 0.9,
      })
      circle.bindTooltip(`${escapeHtml(point.city || 'Unknown city')} · ${fmt(sessions)} sessions`, {
        direction: 'top', offset: [0, -radius / 2], opacity: 0.96,
      })
      circle.bindPopup(`<div class="ai-leaflet-popup"><strong>${escapeHtml(point.city || 'Unknown city')}${point.region ? `, ${escapeHtml(point.region)}` : ''}</strong><span>${escapeHtml(point.country || 'Unknown country')}</span><b>${fmt(sessions)} sessions</b></div>`)
      circle.addTo(layer)
    })

    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [Number(p.latitude), Number(p.longitude)]))
      map.fitBounds(bounds.pad(0.45), { maxZoom: 5, animate: false })
    } else if (points.length === 1) {
      map.setView([Number(points[0].latitude), Number(points[0].longitude)], 5, { animate: false })
    } else {
      map.setView([22, 12], 2, { animate: false })
    }
    map.invalidateSize()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return undefined
    let cancelled = false
    let onLoadHandler
    const init = () => {
      if (cancelled || !containerRef.current || !window.L) return
      const L = window.L
      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: false, worldCopyJump: true, minZoom: 2, maxZoom: 12, scrollWheelZoom: true,
        }).setView([22, 12], 2)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19, crossOrigin: true,
        }).addTo(map)
        L.control.zoom({ position: 'topright' }).addTo(map)
        mapRef.current = map
        markersRef.current = L.layerGroup().addTo(map)
      }
      drawCityCircles(L, mapRef.current, latestLocationsRef.current)
      setMapError('')
    }

    if (window.L) init()
    else {
      let script = document.querySelector('script[data-leaflet-script]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.dataset.leafletScript = 'true'
        document.head.appendChild(script)
      }
      onLoadHandler = init
      script.addEventListener('load', onLoadHandler, { once: true })
      script.addEventListener('error', () => setMapError('The map library could not be loaded. Check the network connection and refresh.'), { once: true })
      // If another component loaded Leaflet while this effect was attaching listeners.
      if (window.L) init()
    }
    return () => {
      cancelled = true
      if (onLoadHandler) document.querySelector('script[data-leaflet-script]')?.removeEventListener('load', onLoadHandler)
    }
  }, [drawCityCircles])

  useEffect(() => {
    if (window.L && mapRef.current) drawCityCircles(window.L, mapRef.current, validLocations)
  }, [validLocations, drawCityCircles])

  useEffect(() => () => {
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
      markersRef.current = null
    }
  }, [])

  return <section className="ai-panel ai-map-panel"><header className="ai-panel-head ai-map-head"><span className="ai-panel-icon"><Glyph name="globe"/></span><div><h2>Audience around the world</h2><p>Active cities are circled using captured latitude and longitude; larger circles indicate more sessions.</p></div><span className="ai-map-source"><i/> OpenStreetMap</span></header>
    <div className="ai-map-canvas"><div ref={containerRef} className="ai-leaflet-map" role="application" aria-label="Interactive world map with circled active cities"/>
      {!validLocations.length && <div className="ai-map-empty"><Glyph name="pin" size={24}/><strong>No geolocated sessions yet</strong><span>Once events include deviceInfo.geo latitude and longitude, locations will appear here.</span></div>}
      {mapError && <div className="ai-map-error">{mapError}</div>}
      <div className="ai-map-legend"><span><i/> Active cities · circle size = sessions</span><span>{fmt(validLocations.length)} plotted locations</span></div>
    </div>
    <div className="ai-map-foot">Markers represent approximate IP-geolocated city locations, not exact addresses. Map imagery and labels are provided by OpenStreetMap.</div>
  </section>
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

export default function AudienceIntelligence() {
  const { period, customRange } = useFilters()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ period: period || '30d' })
      if (period === 'custom' && customRange?.from && customRange?.to) { params.set('from', customRange.from); params.set('to', customRange.to) }
      setData(await apiFetch(`/api/analytics/audience?${params.toString()}`))
    } catch (err) { setError(err.message || 'Could not load audience analytics.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [period, customRange?.from, customRange?.to])
  useEffect(() => { load() }, [load])
  const metrics = data?.metrics || {}
  const periodLabel = period === 'custom' && customRange?.from && customRange?.to ? `${customRange.from} – ${customRange.to}` : PERIOD_LABELS[period] || 'Selected period'
  const topCountries = data?.countries || []
  const topCities = data?.cities || []
  return <div className="ai-page">
    <section className="ai-hero"><div className="ai-hero-orb ai-hero-orb-one"/><div className="ai-hero-orb ai-hero-orb-two"/><div className="ai-hero-copy"><div className="ai-eyebrow"><span/> AUDIENCE INTELLIGENCE <i/></div><h1>Know your <em>audience.</em></h1><p>Understand the devices customers use and where your audience connects from — all in one view.</p><div className="ai-hero-meta"><span><i/> Project-scoped data</span><b>·</b><span>{periodLabel}</span><b>·</b><span>Session-level counts</span></div></div><div className="ai-hero-art"><div className="ai-hero-ring ai-ring-one"/><div className="ai-hero-ring ai-ring-two"/><div className="ai-hero-core"><Glyph name="globe" size={36}/></div><span className="ai-orbit-chip ai-chip-one">OS signals</span><span className="ai-orbit-chip ai-chip-two">Geo insights</span><span className="ai-orbit-chip ai-chip-three">Browsers</span></div></section>
    {error && <div className="ai-error">{error}<button onClick={() => load()}>Retry</button></div>}
    <div className="ai-toolbar"><div><span className="ai-live-dot"/><strong>Audience snapshot</strong><span>Unique sessions in selected period</span></div><button onClick={() => load(true)} disabled={loading || refreshing}><Glyph name="refresh" size={15}/>{refreshing ? 'Refreshing…' : 'Refresh data'}</button></div>
    <div className="ai-metrics-grid"><Metric label="Tracked sessions" value={loading ? '—' : fmt(metrics.sessions)} note="Unique sessions, not raw events" icon="users" tone="violet"/><Metric label="Geolocated sessions" value={loading ? '—' : fmt(metrics.locatedSessions)} note={`${fmt(metrics.locationCoverage)}% with location signals`} icon="pin" tone="blue"/><Metric label="Countries reached" value={loading ? '—' : fmt(metrics.countries)} note="Countries with known location data" icon="globe" tone="green"/><Metric label="Cities identified" value={loading ? '—' : fmt(metrics.cities)} note="City-level locations available" icon="browser" tone="amber"/></div>
    <WorldMap locations={data?.locations || []}/>
    <div className="ai-charts-grid"><ChartPanel title="Operating systems" subtitle="Which OS customers use most." icon="monitor" data={data?.operatingSystems || []} emptyText="OS details will appear when events include deviceInfo.os."/><ChartPanel title="Device types" subtitle="Desktop, mobile, and tablet usage." icon="monitor" data={data?.devices || []} emptyText="Device type data is not available for this period."/><ChartPanel title="Browser share" subtitle="Browsers used across tracked sessions." icon="browser" data={data?.browsers || []} emptyText="Browser details will appear when events include deviceInfo.browser."/><ChartPanel title="Top countries" subtitle="Audience distribution by country." icon="globe" data={topCountries} emptyText="Country-level geolocation has not been captured yet."/></div>
    <div className="ai-locations-grid"><section className="ai-panel"><header className="ai-panel-head"><span className="ai-panel-icon"><Glyph name="globe"/></span><div><h2>Leading countries</h2><p>Ranked by unique sessions.</p></div></header><LocationTable rows={topCountries.slice(0, 8)} type="country" loading={loading}/></section><section className="ai-panel"><header className="ai-panel-head"><span className="ai-panel-icon"><Glyph name="pin"/></span><div><h2>Top cities</h2><p>Where visitors are concentrated.</p></div></header><LocationTable rows={topCities.slice(0, 8)} type="city" loading={loading}/></section></div>
    <footer className="ai-footer"><span>Audience Intelligence <b>·</b> Aggregated by unique session.</span><span>{data?.coverage?.capped ? 'Event safety cap reached; coverage may be incomplete.' : `${fmt(data?.coverage?.eventsScanned || 0)} events scanned`}</span></footer>
  </div>
}

function LocationTable({ rows, type, loading }) {
  if (loading) return <div className="ai-table-empty">Loading audience locations…</div>
  if (!rows.length) return <div className="ai-table-empty">No location data for this period.</div>
  const max = Math.max(...rows.map((row) => row.sessions), 1)
  return <div className="ai-location-list">{rows.map((row, index) => <div className="ai-location-row" key={row.name}><span className="ai-location-rank">{String(index + 1).padStart(2, '0')}</span><div className="ai-location-copy"><strong>{row.name}</strong><span className="ai-location-bar"><i style={{ width: `${Math.max(3, row.sessions / max * 100)}%` }}/></span></div><strong className="ai-location-count">{fmt(row.sessions)}</strong></div>)}</div>
}
