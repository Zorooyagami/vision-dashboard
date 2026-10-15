// src/components/live/liveShared.jsx
const EVENT_STYLES = {
  purchase: { dot: 'bg-emerald-500', label: 'Purchase' },
  add_to_cart: { dot: 'bg-indigo-500', label: 'Added to cart' },
  checkout_start: { dot: 'bg-amber-500', label: 'Started checkout' },
  remove_from_cart: { dot: 'bg-rose-400', label: 'Removed from cart' },
  product_view: { dot: 'bg-sky-500', label: 'Viewed product' },
  view_cart: { dot: 'bg-violet-500', label: 'Viewed cart' },
  search_performed: { dot: 'bg-slate-400', label: 'Searched' },
  page_view: { dot: 'bg-slate-300', label: 'Page view' },
}

export const eventMeta = (name) =>
  EVENT_STYLES[name] || { dot: 'bg-slate-300', label: String(name || 'event').replace(/_/g, ' ') }

export const who = (ev) =>
  ev.name ||
  (ev.isGuest
    ? `Guest ${ev.guestNo ?? String(ev.sessionId).slice(-4)}${ev.guestCfg ? ` (${ev.guestCfg})` : ''}`
    : ev.userId)

export const detail = (ev) => {
  const p = ev.props || {}
  return p.productName || p.name || p.query || ev.path || ''
}

export function timeAgo(ts, now) {
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`
}

const pick = (p, keys) => {
  for (const k of keys) if (p[k] != null && p[k] !== '') return p[k]
  return null
}
const human = (v) => String(v).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
const money = (v) => (v != null && Number.isFinite(Number(v)) ? `$${Number(v).toLocaleString()}` : null)

const PAGE_NAMES = { '/': 'home', '/products': 'products', '/cart': 'cart' }
const pageName = (path) => {
  if (!path) return null
  if (PAGE_NAMES[path]) return PAGE_NAMES[path]
  if (path.startsWith('/products-detail')) return 'product detail'
  return human(path.replace(/^\//, '')) || 'home'
}

// Turns an event into a readable sentence fragment: "<who> <describe(ev)>".
export function describe(ev) {
  const p = ev.props || {}
  // NOTE: no 'title' here, it is usually the page title (e.g. "ShopEasy - Ecommerce").
  const product = pick(p, [
    'productName', 'product_name', 'itemName', 'item_name',
    'item.name', 'item.productName', 'product.name', 'product.productName',
    'items.name', 'items.productName', 'products.name', 'name',
  ])
  const price = money(pick(p, ['price', 'item.price', 'product.price', 'items.price', 'value', 'total']))
  const page = pageName(ev.path)

  switch (ev.event) {
    case 'filter_applied': {
      const type = pick(p, ['filterType', 'filter_type', 'filterName', 'filter_name', 'type', 'filter', 'field', 'key', 'category'])
      const value = pick(p, ['filterValue', 'filter_value', 'value', 'selected', 'option', 'label'])
      const lo = pick(p, ['minPrice', 'min_price', 'min'])
      const hi = pick(p, ['maxPrice', 'max_price', 'max'])
      if (lo != null || hi != null) return `applied ${type ? human(type) : 'price'} ${lo ?? 0}–${hi ?? '∞'} filter`
      if (type != null && value != null) return `applied ${human(type)} = ${human(value)} filter`
      if (value != null || type != null) return `applied ${human(value ?? type)} filter`
      return 'applied a filter'
    }
    case 'sort_changed': {
      const v = pick(p, ['sortBy', 'sort_by', 'sort', 'sortOption', 'sort_option', 'value', 'order'])
      return v != null ? `sorted products by ${human(v)}` : 'changed the sort order'
    }
    case 'view_item_list': {
      const list = pick(p, ['listName', 'list_name', 'item_list_name', 'category'])
      return list ? `browsed ${human(list)}` : page ? `viewed the ${page} page` : 'browsed the product list'
    }
    case 'page_view':
      return page ? `viewed the ${page} page` : 'viewed a page'
    case 'product_view':
      return `viewed ${product || 'a product'}${price ? ` (${price})` : ''}`
    case 'select_item':
      return `clicked on ${product || 'a product'}`
    case 'search_performed': {
      const q = pick(p, ['query', 'searchTerm', 'search_term', 'term', 'q'])
      return q ? `searched for "${q}"` : 'ran a search'
    }
    case 'add_to_cart':
      return `added ${product || 'an item'} to cart${price ? ` (${price})` : ''}`
    case 'remove_from_cart':
      return `removed ${product || 'an item'} from cart`
    case 'view_cart':
      return 'viewed their cart'
    case 'checkout_start':
      return `started checkout${price ? ` (${price})` : ''}`
    case 'shipping_details':
      return 'entered shipping details'
    case 'purchase':
      return `completed a purchase${price ? ` of ${price}` : ''}`
    case 'sign_up':
      return 'signed up'
    default:
      return human(ev.event || 'did something')
  }
}

export function LiveBadge({ status }) {
  const live = status === 'live'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
      <span className="relative flex h-2 w-2">
        {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-red-500' : 'bg-slate-300'}`} />
      </span>
      <span className={live ? 'text-red-500' : 'text-slate-400'}>
        {live ? 'LIVE' : status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
      </span>
    </span>
  )
}

export function Sparkline({ data, height = 48, color = '#6366F1' }) {
  if (data.length < 2) return <div style={{ height }} className="w-full rounded bg-slate-50" />
  const w = 200
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${height - 4 - ((v - min) / range) * (height - 8)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function FeedRow({ ev, now }) {
  const meta = eventMeta(ev.event) // colour dot only
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-800">
          <span className="font-semibold">{who(ev)}</span> <span className="text-slate-500">{describe(ev)}</span>
        </p>
        <p className="truncate text-xs text-slate-400">
          {[ev.path, ev.device].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{timeAgo(ev.ts, now)}</span>
    </div>
  )
}
