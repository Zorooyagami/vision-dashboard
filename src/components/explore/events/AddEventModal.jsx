import { useEffect, useRef, useState } from 'react'
import { useProject } from '../../../context/ProjectContext'
import { apiFetch } from '../../../services/apiClient'

const field = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white'
const button = 'rounded-xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-40'
export default function AddEventModal({ onClose, onAdd, initialEvent }) {
  const { projectId } = useProject()
  const [name, setName] = useState(initialEvent?.name || '')
  const [description, setDescription] = useState(initialEvent?.description || '')
  const [category, setCategory] = useState(initialEvent?.category || 'browsing')
  const [mode, setMode] = useState('visual')
  const [pageUrl, setPageUrl] = useState(initialEvent?.tracking?.pageUrl || '')
  const [selector, setSelector] = useState(initialEvent?.tracking?.selector || '')
  const [match, setMatch] = useState(initialEvent?.tracking?.match || 'exact')
  const [uniqueSelector, setUniqueSelector] = useState('')
  const [availability, setAvailability] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const mounted = useRef(true)
  const picker = useRef(null)
  const ticket = useRef(null)
  const timeout = useRef(null)
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '_')
  useEffect(() => {
    if (initialEvent || !normalizedName) { setAvailability(''); return }
    let active = true
    setAvailability('Checking…')
    const timer = setTimeout(() => {
      apiFetch('/api/tracking/name-availability?name=' + encodeURIComponent(normalizedName))
        .then(() => { if (active) setAvailability('Available') })
        .catch(e => { if (active) setAvailability(e.message) })
    }, 350)
    return () => { active = false; clearTimeout(timer) }
  }, [normalizedName, projectId, initialEvent])
  useEffect(() => {
    mounted.current = true
    const listener = event => {
      const t = ticket.current, data = event.data
      if (!t || event.source !== picker.current || event.origin !== t.targetOrigin || data?.nonce !== t.nonce || data.projectId !== projectId) return
      if (data.type === 'vision:ready') { clearTimeout(timeout.current); setReady(true); setNotice('Picker connected. Select an element in the website tab.'); }
      if (data.type === 'vision:selected') {
        setSelector(data.selector); setUniqueSelector(data.uniqueSelector); setPageUrl(data.pageUrl)
        setNotice(`${data.matches} matching element(s). Use all matches, or choose only the selected element.`)
      }
      if (['vision:preview-result', 'vision:test-result'].includes(data.type)) setNotice(data.message)
      if (data.type === 'vision:closed') { setReady(false); setNotice('Picker closed. Your selection is preserved.'); }
    }
    window.addEventListener('message', listener)
    const poll = setInterval(() => {
      if (picker.current?.closed) { setReady(false); picker.current = null; setNotice('Website tab closed. Reopen it to preview or test.'); }
    }, 1000)
    return () => {
      mounted.current = false
      if (!ticket.current && picker.current && !picker.current.closed) picker.current.close()
      window.removeEventListener('message', listener); clearInterval(poll); clearTimeout(timeout.current)
      const t = ticket.current
      if (t && picker.current && !picker.current.closed) picker.current.postMessage({ type: 'vision:close', nonce: t.nonce, projectId }, t.targetOrigin)
    }
  }, [projectId])
  function tracking() {
    const url = new URL(pageUrl)
    // Validate the CSS syntax locally; matching is performed on the target website.
    document.querySelector(selector)
    if (!selector.trim()) throw new Error('Select an element or enter a CSS selector.')
    return { selector, pageUrl: url.origin + url.pathname, origin: url.origin, path: url.pathname, match }
  }
  async function openPicker() {
    setError(''); setNotice(''); setReady(false)
    let url
    try { url = new URL(pageUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
    catch { return setError('Enter a full website URL, including https:// or http://.') }
    // Open synchronously to avoid popup blocking while the API request runs.
    if (picker.current && !picker.current.closed) picker.current.close()
    const tab = window.open('about:blank', 'vision-picker-' + projectId)
    if (!tab) return setError('Allow popups for the dashboard, then try again.')
    picker.current = tab
    ticket.current = null
    try {
      const session = await apiFetch('/api/tracking/picker/session', { method: 'POST', body: JSON.stringify({ pageUrl }) })
      if (!mounted.current || picker.current !== tab) { tab.close(); return }
      ticket.current = session
      url.hash = new URLSearchParams({ __vision_picker: session.token }).toString()
      tab.location.href = url.href
      clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setNotice('No SDK connection yet. Check the SDK version, project ID, API URL, allowed origin, and browser opener policy.'), 15000)
      setNotice('Opening the website. Waiting for its Vision SDK…')
    } catch (e) { tab.close(); if (mounted.current && picker.current === tab) setError(e.message) }
  }
  function send(type) {
    setError('')
    try {
      if (!ready || !picker.current || picker.current.closed) throw new Error('Open the website picker first.')
      const t = ticket.current
      picker.current.postMessage({ type, nonce: t.nonce, projectId, rule: { ...tracking(), eventName: normalizedName || 'preview_event' } }, t.targetOrigin)
      if (type === 'vision:test') { picker.current.focus(); setNotice('Click the selected element in the website tab to test the rule.') }
    } catch (e) { setError(e.message) }
  }
  async function save(status) {
    setError(''); setBusy(true)
    try {
      await onAdd({ name: normalizedName, description, category, tracking: tracking(), status })
      onClose()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.55)' }}>
    <section role="dialog" aria-modal="true" aria-labelledby="event-modal-title" className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-xl">
      <header className="px-6 py-5 border-b border-slate-100 flex justify-between items-start shrink-0">
        <div><p className="text-xs font-bold text-indigo-500 tracking-widest">VISION · CLICK EVENTS</p><h2 id="event-modal-title" className="text-xl font-bold text-slate-900 mt-1">{initialEvent ? 'Edit click event' : 'Turn a click into an insight'}</h2><p className="text-sm text-slate-500 mt-1">Pick an element visually or use a CSS selector.</p></div>
        <button aria-label="Close" className={button} disabled={busy} onClick={onClose}>✕</button>
      </header>
      <div className="p-6 space-y-4 overflow-y-auto min-h-0">
        <label className="block text-xs font-semibold text-slate-600">Event name<input className={field + ' mt-1 font-mono'} placeholder="basket_button_clicked" value={name} disabled={Boolean(initialEvent)} onChange={e => setName(e.target.value)} /></label>
        <p aria-live="polite" className={'text-xs ' + (availability === 'Available' ? 'text-emerald-600' : 'text-slate-500')}>{initialEvent ? 'Event names stay fixed to preserve historical analytics.' : availability || 'Existing frontend and SDK event names cannot be reused.'}</p>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-600">Description<input className={field + ' mt-1'} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} /></label><label className="text-xs font-semibold text-slate-600">Category<select className={field + ' mt-1'} disabled={Boolean(initialEvent)} value={category} onChange={e => setCategory(e.target.value)}>{['browsing', 'cart', 'checkout', 'other'].map(c => <option key={c}>{c}</option>)}</select></label></div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">{[['visual', '↗ Pick visually'], ['manual', '</> Manual selector']].map(([value, title]) => <button key={value} className={button + ' flex-1 ' + (mode === value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')} onClick={() => setMode(value)}>{title}</button>)}</div>
        <label className="block text-xs font-semibold text-slate-600">Website page URL<input className={field + ' mt-1'} placeholder="http://localhost:5173/products" value={pageUrl} onChange={e => setPageUrl(e.target.value)} /></label>
        <div className="flex items-center gap-3"><button type="button" onClick={openPicker} className={button + ' text-indigo-600'}>{ready ? 'Reopen website' : mode === 'visual' ? 'Open website & select element' : 'Open website for preview'}</button><span className="text-xs text-slate-500">{ready ? '● Connected' : 'Opens a new tab'}</span></div>
        <label className="block text-xs font-semibold text-slate-600">CSS selector<input className={field + ' mt-1 font-mono'} placeholder='[data-vision-id="add-to-basket"]' value={selector} onChange={e => setSelector(e.target.value)} /></label>
        {uniqueSelector && uniqueSelector !== selector && <button className="text-xs text-indigo-600 font-semibold" onClick={() => setSelector(uniqueSelector)}>Target only the selected element</button>}
        <label className="block text-xs font-semibold text-slate-600">Page scope<select className={field + ' mt-1'} value={match} onChange={e => setMatch(e.target.value)}><option value="exact">This exact path (query parameters ignored)</option><option value="prefix">This path and its subpaths</option></select></label>
        <div className="flex gap-2"><button className={button} disabled={!ready || !selector} onClick={() => send('vision:preview')}>Preview matches</button><button className={button} disabled={!ready || !selector} onClick={() => send('vision:test')}>Test click</button></div>
        {notice && <p role="status" className="rounded-xl bg-indigo-50 text-indigo-700 p-3 text-sm">{notice}</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
        <p className="text-xs text-slate-500">Test clicks do not trigger the website action or enter analytics. Published changes reach open pages within about 30 seconds.</p>
      </div>
      <footer className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-2 shrink-0"><button className={button} disabled={busy} onClick={onClose}>Cancel</button><button className={button} disabled={busy || !name || !selector} onClick={() => save('Inactive')}>{busy ? 'Saving…' : 'Save inactive'}</button><button className={button + ' bg-indigo-600 text-white hover:bg-indigo-700'} disabled={busy || !name || !selector} onClick={() => save('Active')}>{busy ? 'Saving…' : 'Publish event'}</button></footer>
    </section>
  </div>
}
