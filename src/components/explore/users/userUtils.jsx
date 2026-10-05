// src/components/explore/users/userUtils.jsx

// ⚠️ Set to whatever currency your demo store uses.
const CURRENCY = 'INR'
const LOCALE = 'en-IN'

export function fmtMoney(value) {
  const n = Number(value) || 0
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(n)
}

// Colours for the six personas. Unknown personas fall back to a hashed colour
// so a new persona never renders unstyled.
const PERSONA_COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']

function colorFor(persona = '') {
  let hash = 0
  for (let i = 0; i < persona.length; i++) hash = (hash * 31 + persona.charCodeAt(i)) >>> 0
  return PERSONA_COLORS[hash % PERSONA_COLORS.length]
}

export function PersonaBadge({ persona }) {
  if (!persona) {
    return <span className="text-[11px] text-slate-400">Anonymous</span>
  }
  const color = colorFor(persona)
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{ background: `${color}1A`, color }}
    >
      {String(persona).replace(/[_-]/g, ' ')}
    </span>
  )
}

// Group a flat, time-sorted event list into sessions (newest session first)
export function groupBySession(events) {
  const map = new Map()
  events.forEach((e) => {
    const key = e.sessionId || 'unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  })
  return Array.from(map.entries())
    .map(([sessionId, items]) => ({
      sessionId,
      items: items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    }))
    .sort((a, b) => new Date(b.items[0].timestamp) - new Date(a.items[0].timestamp))
}
