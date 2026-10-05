// ─── Shared data & pure helpers for the Tools (Heatmaps + Session Replay) pages ───

export const PAGES = [
  { id: 'home',     label: 'Homepage' },
  { id: 'pdp',      label: 'Product Detail Page' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'cart',     label: 'Cart' },
  { id: 'category', label: 'Category Listing' },
  { id: 'search',   label: 'Search Results' },
]

export const WIREFRAME_SECTIONS = [
  { label: 'Header / Nav',  h: 10, bg: '#F1F5F9' },
  { label: 'Hero Banner',   h: 18, bg: '#E2E8F0' },
  { label: 'Product Grid',  h: 30, bg: '#F8FAFC' },
  { label: 'CTA Strip',     h:  8, bg: '#EEF2FF' },
  { label: 'Related Items', h: 18, bg: '#F8FAFC' },
  { label: 'Reviews',       h: 10, bg: '#F1F5F9' },
  { label: 'Footer',        h:  6, bg: '#E2E8F0' },
]

// ─── Heatmaps ──────────────────────────────────────────────────────────────

export const BASE_HOTSPOTS = [
  { x: 50, y: 14, r: 0.95, label: 'Primary CTA button' },
  { x: 28, y: 32, r: 0.80, label: 'Product card (1)' },
  { x: 50, y: 32, r: 0.72, label: 'Product card (2)' },
  { x: 72, y: 32, r: 0.65, label: 'Product card (3)' },
  { x: 18, y:  8, r: 0.60, label: 'Nav: Categories' },
  { x: 50, y: 54, r: 0.45, label: 'Add to cart (hero)' },
  { x: 82, y:  8, r: 0.38, label: 'Search bar' },
  { x: 50, y: 74, r: 0.28, label: 'Related products' },
  { x: 30, y: 90, r: 0.12, label: 'Footer links' },
]

export const PERSONA_SHIFT = {
  collector: { 4: 0.92, 2: 0.88, 0: 0.70 },
  guest:     { 7: 0.10, 6: 0.72, 0: 0.82 },
  loyal:     { 0: 0.98, 5: 0.85, 3: 0.78 },
  firsttime: { 6: 0.65, 0: 0.88, 7: 0.55 },
  active:    { 2: 0.90, 3: 0.85, 5: 0.70 },
}

// Pages with no data for prototype purposes
export const EMPTY_COMBINATIONS = new Set(['checkout-app', 'search-app'])

export const scrollDepths = [100, 84, 67, 52, 38, 21, 9]

export function heatColor(intensity) {
  if (intensity > 0.85) return 'rgba(220,38,38,VAL)'
  if (intensity > 0.65) return 'rgba(234,88,12,VAL)'
  if (intensity > 0.45) return 'rgba(234,179,8,VAL)'
  if (intensity > 0.25) return 'rgba(34,197,94,VAL)'
  return 'rgba(59,130,246,VAL)'
}

export function getHotspots(selectedPersonas) {
  return BASE_HOTSPOTS.map((h, i) => {
    let r = h.r
    for (const pid of selectedPersonas) {
      const shift = PERSONA_SHIFT[pid]
      if (shift && shift[i] !== undefined) r = shift[i]
    }
    return { ...h, r }
  })
}

// ─── Session Replay ────────────────────────────────────────────────────────

export const FLAG_META = {
  rage_click:     { label: 'Rage click',     bg: '#FEF2F2', color: '#B91C1C' },
  cart_abandoned: { label: 'Cart abandoned', bg: '#FFFBEB', color: '#92400E' },
  error:          { label: 'Error',          bg: '#FFF1F2', color: '#9F1239' },
}

export const SESSIONS = [
  {
    id: 's1', userId: 'usr_8821a', personaId: 'collector', platform: 'app',
    duration: '8m 42s', events: 34, date: 'Today, 11:04 AM',
    flags: ['rage_click'],
    entryPage: 'Homepage', exitPage: 'Product Detail Page',
    device: 'iPhone 15 Pro', browser: 'Safari WebView',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:14', name: 'view_item_list', detail: 'Category: Ceramics' },
      { time: '0:52', name: 'select_item',    detail: 'Stoneware Vase #204' },
      { time: '1:18', name: 'view_item' },
      { time: '2:04', name: 'rage_click',     detail: 'Add to cart button — 5× in 2s' },
      { time: '2:07', name: 'add_to_cart' },
      { time: '4:31', name: 'view_cart' },
      { time: '8:42', name: 'session_end' },
    ],
  },
  {
    id: 's2', userId: 'Guest', personaId: 'guest', platform: 'web',
    duration: '1m 58s', events: 8, date: 'Today, 10:47 AM',
    flags: ['cart_abandoned'],
    entryPage: 'Homepage', exitPage: 'Cart',
    device: 'Desktop', browser: 'Chrome 124',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:08', name: 'view_item_list' },
      { time: '0:34', name: 'view_item', detail: 'Linen Tote' },
      { time: '0:51', name: 'add_to_cart' },
      { time: '1:02', name: 'view_cart' },
      { time: '1:58', name: 'session_end', detail: 'Cart abandoned at checkout prompt' },
    ],
  },
  {
    id: 's3', userId: 'usr_4412c', personaId: 'loyal', platform: 'web',
    duration: '12m 07s', events: 52, date: 'Today, 10:12 AM',
    flags: [],
    entryPage: 'Homepage', exitPage: 'Order Confirmation',
    device: 'Desktop', browser: 'Firefox 125',
    eventLog: [
      { time: '0:00',  name: 'session_start' },
      { time: '0:22',  name: 'view_item_list', detail: 'New Arrivals' },
      { time: '1:44',  name: 'add_to_wishlist' },
      { time: '3:10',  name: 'add_to_cart' },
      { time: '5:02',  name: 'begin_checkout' },
      { time: '6:14',  name: 'add_shipping_info' },
      { time: '7:30',  name: 'add_payment_info' },
      { time: '9:12',  name: 'purchase', detail: 'Order #VIS-00831, $218' },
      { time: '12:07', name: 'session_end' },
    ],
  },
  {
    id: 's4', userId: 'usr_9034b', personaId: 'firsttime', platform: 'web',
    duration: '3m 22s', events: 14, date: 'Yesterday, 4:38 PM',
    flags: ['error'],
    entryPage: 'Search Results', exitPage: 'Checkout',
    device: 'Desktop', browser: 'Chrome 124',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:11', name: 'view_item_list', detail: 'Search: "ceramic bowl"' },
      { time: '0:44', name: 'view_item' },
      { time: '1:20', name: 'add_to_cart' },
      { time: '1:55', name: 'begin_checkout' },
      { time: '2:40', name: 'error', detail: 'Payment form validation error' },
      { time: '3:22', name: 'session_end' },
    ],
  },
  {
    id: 's5', userId: 'usr_2207f', personaId: 'active', platform: 'app',
    duration: '5m 14s', events: 26, date: 'Yesterday, 2:15 PM',
    flags: ['rage_click', 'cart_abandoned'],
    entryPage: 'Homepage', exitPage: 'Product Detail Page',
    device: 'Samsung Galaxy S24', browser: 'Chrome Android',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:18', name: 'view_item_list' },
      { time: '0:52', name: 'select_item' },
      { time: '1:30', name: 'view_item' },
      { time: '2:12', name: 'rage_click', detail: 'Size selector — 4× rapid tap' },
      { time: '2:44', name: 'add_to_cart' },
      { time: '3:58', name: 'view_cart' },
      { time: '5:14', name: 'session_end', detail: 'Abandoned after cart view' },
    ],
  },
  {
    id: 's6', userId: 'Guest', personaId: 'guest', platform: 'web',
    duration: '0m 44s', events: 4, date: 'Yesterday, 11:02 AM',
    flags: [],
    entryPage: 'Homepage', exitPage: 'Homepage',
    device: 'Desktop', browser: 'Safari 17',
    eventLog: [
      { time: '0:00', name: 'session_start' },
      { time: '0:08', name: 'view_item_list' },
      { time: '0:44', name: 'session_end' },
    ],
  },
]

export const CURSOR_PATH = [
  { x: 50, y: 15 },
  { x: 30, y: 35 },
  { x: 50, y: 35 },
  { x: 50, y: 14 },
  { x: 50, y: 14 },
  { x: 50, y: 14 },
  { x: 50, y: 55 },
  { x: 30, y: 70 },
  { x: 50, y: 85 },
]

export const FLAG_COLOR = {
  rage_click: '#DC2626',
  error:      '#9F1239',
  session_end:'#64748B',
  purchase:   '#047857',
  add_to_cart:'#4338CA',
}

export function lerp(a, b, t) { return a + (b - a) * t }

// Parse "Xm Ys" → total seconds
export function parseDuration(d) {
  const [mPart, sPart] = d.split('m ')
  return parseInt(mPart) * 60 + parseInt(sPart)
}

// Format seconds → "m:ss"
export function fmtTime(totalSecs, pct) {
  const s = Math.round(pct / 100 * totalSecs)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function markerColor(name) { return FLAG_COLOR[name] ?? '#6366F1' }
