// src/components/explore/events/ElementTagger.jsx
//
// "Tag an element" half of the Add/Edit Event modal. The admin can either pick the
// element visually on their own site, or type a CSS selector by hand. Both end up
// in the same `trigger` form state.
import { useEffect, useState } from 'react'
import { useSiteEditor, normaliseSiteUrl } from '../../../hooks/useSiteEditor'
import { useProject } from '../../../context/ProjectContext'
import { fetchProject } from '../../../services/projectsApi'

export const URL_MODES = [
  { value: 'any', label: 'Every page' },
  { value: 'equals', label: 'Only this exact path' },
  { value: 'starts_with', label: 'Paths starting with' },
  { value: 'contains', label: 'Paths containing' },
]

export const PROPERTY_SOURCES = [
  { value: 'text', label: 'Element text' },
  { value: 'attr', label: 'Attribute' },
  { value: 'value', label: 'Input value' },
  { value: 'static', label: 'Fixed value' },
]

export function emptyTrigger() {
  return { selector: '', urlMode: 'any', urlValue: '', properties: [] }
}

export function triggerFromEvent(trigger) {
  if (!trigger) return emptyTrigger()
  return {
    selector: trigger.selector || '',
    urlMode: trigger.urlMatch?.mode || 'any',
    urlValue: trigger.urlMatch?.value || '',
    properties: (trigger.properties || []).map((p) => ({ key: p.key, from: p.from, source: p.source || '' })),
  }
}

export function triggerToPayload(form) {
  return {
    kind: 'click',
    selector: form.selector.trim(),
    urlMatch: { mode: form.urlMode, value: form.urlMode === 'any' ? '' : form.urlValue.trim() },
    properties: form.properties
      .filter((p) => p.key.trim())
      .map((p) => ({ key: p.key.trim(), from: p.from, source: p.from === 'attr' || p.from === 'static' ? p.source.trim() : '' })),
  }
}

export function validateTrigger(form) {
  if (!form.selector.trim()) return 'Pick an element or enter a CSS selector.'
  if (form.urlMode !== 'any' && !form.urlValue.trim()) return 'Enter the page path for the "Runs on" rule.'
  const attrMissing = form.properties.find((p) => p.key.trim() && p.from === 'attr' && !p.source.trim())
  if (attrMissing) return `Choose which attribute to capture for "${attrMissing.key}".`
  return null
}

const inputCls = 'w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2'
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5'
const border = { borderColor: '#E2E8F0' }

const STATUS_COPY = {
  idle: null,
  opening: 'Waiting for your site to connect… the Vision SDK must be installed on that page, and the URL must match an allowed origin exactly (http/https, www).',
  connected: 'Connected to your site. Browse to the right page there, then use "Select element" in the toolbar at the bottom of that tab.',
  blocked: 'Your browser blocked the new tab. Allow pop-ups for this dashboard and try again.',
  closed: 'The site tab was closed.',
}

function ElementTagger({ value, onChange, onPicked, siteUrl, onSiteUrlChange }) {
  const { projectId } = useProject()
  const [picked, setPicked] = useState(null)
  const [testing, setTesting] = useState(false)

  const editor = useSiteEditor({
    onPicked: (info) => {
      setPicked(info)
      onChange({ ...value, selector: info.selector })
      onPicked?.(info)
    },
  })

  // Default the site URL to the project's website once.
  useEffect(() => {
    if (siteUrl || !projectId) return undefined
    let cancelled = false
    fetchProject(projectId)
      .then((p) => { if (!cancelled && p?.websiteUrl) onSiteUrlChange(p.websiteUrl) })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const siteOk = !!normaliseSiteUrl(siteUrl)
  const set = (patch) => onChange({ ...value, ...patch })
  const setProp = (i, patch) => set({ properties: value.properties.map((p, j) => (j === i ? { ...p, ...patch } : p)) })

  const handleTest = () => {
    setTesting(true)
    editor.testSelector(siteUrl, value.selector.trim())
  }

  const result = editor.testResult
  const resultIsCurrent = result && result.selector === value.selector.trim()
  const attributeNames = (picked?.attributes || []).map((a) => a.name)

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Your site</label>
        <input
          className={`${inputCls} font-mono`}
          style={border}
          placeholder="https://www.example.com"
          value={siteUrl}
          onChange={(e) => onSiteUrlChange(e.target.value)}
        />
        <p className="text-[11px] text-slate-400 mt-1">Open the page where the element lives (a product page, say) so picking starts from the right place.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!siteOk}
          onClick={() => editor.startPick(siteUrl)}
          className="px-4 py-2 text-sm font-bold rounded-xl text-white hover:opacity-90 disabled:opacity-40"
          style={{ background: '#6366F1' }}
        >Pick on site</button>
        <button
          type="button"
          disabled={!siteOk || !value.selector.trim()}
          onClick={handleTest}
          className="px-4 py-2 text-sm font-semibold rounded-xl border hover:bg-slate-50 disabled:opacity-40"
          style={{ borderColor: '#E2E8F0', color: '#475569' }}
        >Test selector on site</button>
      </div>

      {STATUS_COPY[editor.status] && (
        <p
          className="text-[11px] rounded-lg px-3 py-2"
          style={{
            background: editor.status === 'blocked' ? '#FEF2F2' : editor.status === 'connected' ? '#ECFDF5' : '#F8FAFC',
            color: editor.status === 'blocked' ? '#B91C1C' : editor.status === 'connected' ? '#047857' : '#64748B',
          }}
        >{STATUS_COPY[editor.status]}</p>
      )}

      <div>
        <label className={labelCls}>CSS selector *</label>
        <input
          className={`${inputCls} font-mono`}
          style={border}
          placeholder='e.g. button.wishlist-btn  or  [data-testid="add-wishlist"]'
          value={value.selector}
          onChange={(e) => set({ selector: e.target.value })}
        />
        {picked && picked.selector === value.selector && (
          <p className="text-[11px] mt-1" style={{ color: picked.matchCount === 1 ? '#047857' : '#B45309' }}>
            Picked &lt;{picked.tag}&gt;{picked.text ? ` “${picked.text}”` : ''} — {picked.matchCount === 1 ? 'matches exactly 1 element on that page.' : `matches ${picked.matchCount} elements on that page; every match will fire the event.`}
          </p>
        )}
        {testing && resultIsCurrent && (
          <p className="text-[11px] mt-1" style={{ color: result.error ? '#B91C1C' : result.matchCount ? '#047857' : '#B45309' }}>
            {result.error
              ? result.error
              : `${result.matchCount} element${result.matchCount === 1 ? '' : 's'} match on ${result.pathname} (highlighted in amber on your site).`}
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>Runs on</label>
        <div className="flex gap-2">
          <select
            className="border rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
            style={border}
            value={value.urlMode}
            onChange={(e) => set({ urlMode: e.target.value })}
          >
            {URL_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {value.urlMode !== 'any' && (
            <input
              className={`${inputCls} font-mono`}
              style={border}
              placeholder="/products"
              value={value.urlValue}
              onChange={(e) => set({ urlValue: e.target.value })}
            />
          )}
        </div>
        {picked?.pathname && value.urlMode === 'any' && (
          <button
            type="button"
            className="text-[11px] font-semibold mt-1.5"
            style={{ color: '#6366F1' }}
            onClick={() => set({ urlMode: 'equals', urlValue: picked.pathname })}
          >Limit to {picked.pathname}</button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-500">Capture data with each click</label>
          <button
            type="button"
            onClick={() => set({ properties: [...value.properties, { key: '', from: 'text', source: '' }] })}
            className="text-xs font-semibold"
            style={{ color: '#6366F1' }}
          >+ Add data</button>
        </div>
        {value.properties.length === 0 && (
          <p className="text-[11px] text-slate-400">The element’s tag, text and selector are always recorded. Add more if you need, for example a product id from a data attribute.</p>
        )}
        <datalist id="vision-attr-names">
          {attributeNames.map((n) => <option key={n} value={n} />)}
        </datalist>
        <div className="space-y-2">
          {value.properties.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="w-36 border rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                style={border}
                placeholder="property_name"
                value={p.key}
                onChange={(e) => setProp(i, { key: e.target.value })}
              />
              <select
                className="border rounded-lg px-2 py-2 text-xs text-slate-700 focus:outline-none"
                style={border}
                value={p.from}
                onChange={(e) => setProp(i, { from: e.target.value })}
              >
                {PROPERTY_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {(p.from === 'attr' || p.from === 'static') && (
                <input
                  className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  style={border}
                  list={p.from === 'attr' ? 'vision-attr-names' : undefined}
                  placeholder={p.from === 'attr' ? 'data-product-id' : 'value'}
                  value={p.source}
                  onChange={(e) => setProp(i, { source: e.target.value })}
                />
              )}
              <button
                type="button"
                onClick={() => set({ properties: value.properties.filter((_, j) => j !== i) })}
                className="text-slate-400 hover:text-red-500 px-1"
                aria-label="Remove"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ElementTagger
