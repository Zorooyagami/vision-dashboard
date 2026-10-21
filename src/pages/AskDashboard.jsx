import { useEffect, useRef, useState } from 'react'
import { useFilters } from '../context/FiltersContext'
import { useProject } from '../context/ProjectContext'
import { askIntelligence, intelligenceParams } from '../services/intelligenceApi'
import { Page } from '../components/intelligence/shared'
import AnswerCard from '../components/ask/AnswerCard'
import '../components/ask/ask.css'
const examples = [
  ['Find the change', 'Why did checkout conversion drop for mobile users this week?'],
  ['Explore revenue', 'Show revenue and orders by persona for the last 30 days'],
  ['See a trend', 'Show daily sessions and conversion for the last 14 days'],
  ['Compare devices', 'Compare mobile and desktop checkout conversion this month'],
  ['Follow the journey', 'Show the funnel from product view to purchase this week'],
  ['Explore activity', 'Show the top 10 pages by page views as a table'],
]
export default function AskDashboard() {
  const filters = useFilters(), { projectId } = useProject()
  const query = intelligenceParams({ ...filters, device: filters.intelligenceDevice }), scopeKey = `${projectId}:${query}`
  const [question, setQuestion] = useState(''), [conversation, setConversation] = useState({ key: scopeKey, turns: [] })
  const [request, setRequest] = useState({ key: scopeKey, busy: false, error: null })
  const [useContext, setUseContext] = useState(true)
  const controller = useRef(null), sequence = useRef(0), textarea = useRef(null), lastRequest = useRef(null), latest = useRef(null)
  const turns = conversation.key === scopeKey ? conversation.turns : []
  const state = request.key === scopeKey ? request : { busy: false, error: null }
  useEffect(() => {
    sequence.current++; controller.current?.abort(); lastRequest.current = null
    setConversation({ key: scopeKey, turns: [] }); setRequest({ key: scopeKey, busy: false, error: null })
    return () => { sequence.current++; controller.current?.abort() }
  }, [scopeKey])
  // Bring a new answer into view so the person lands on its headline, not the end of a long page.
  useEffect(() => {
    if (!turns.length) return
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    latest.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
  }, [turns.at(-1)?.id])
  function cancel() { sequence.current++; controller.current?.abort(); setRequest({ key: scopeKey, busy: false, error: null }) }
  function reset() { cancel(); setConversation({ key: scopeKey, turns: [] }); lastRequest.current = null; setQuestion(''); textarea.current?.focus() }
  async function ask(text = question, contextOverride) {
    text = text.trim(); if (text.length < 3 || text.length > 1000 || !projectId) return
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort; const id = ++sequence.current
    const context = contextOverride !== undefined ? contextOverride : useContext ? turns.at(-1)?.answer.context : null
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    lastRequest.current = { text, context }; setQuestion(text); setRequest({ key: scopeKey, busy: true, error: null })
    let timedOut = false; const timer = setTimeout(() => { timedOut = true; abort.abort() }, 45000)
    try {
      const answer = await askIntelligence(query, text, abort.signal, { context, timezone })
      if (sequence.current !== id) return
      if (answer.version !== 2) throw new Error('Update the backend Ask module to match this frontend version.')
      setConversation(current => ({ key: scopeKey, turns: [...(current.key === scopeKey ? current.turns : []), { id, question: text, answer }].slice(-8) }))
      setRequest({ key: scopeKey, busy: false, error: null }); setQuestion('')
    } catch (error) {
      if (sequence.current === id) setRequest({ key: scopeKey, busy: false, error: timedOut ? 'This analysis took too long. Try a narrower date range or retry.' : error.name === 'AbortError' ? null : error.message })
    } finally { clearTimeout(timer) }
  }
  return <Page title="Ask the dashboard" subtitle="Ask a question about your data in plain language.">
    <div className="ask-workspace">{!turns.length && <div className="ask-intro"><h2>What would you like to know?</h2><p>Ask about revenue, conversion, journeys or customer groups. Mention dates or devices to narrow the answer.</p><div className="ask-examples">{examples.map(([label, text]) => <button key={label} type="button" disabled={state.busy} onClick={() => ask(text, null)}><strong>{label}</strong><span>{text}</span><b aria-hidden="true">↗</b></button>)}</div></div>}
      {turns.length > 0 && <div className="ask-historyhead"><span>{turns.length} {turns.length === 1 ? 'answer' : 'answers'} in this conversation</span><button type="button" onClick={reset}>New conversation</button></div>}
      <div className="ask-conversation" aria-label="Question history">{turns.map(turn => <section key={turn.id} className="ask-turn" ref={turn === turns.at(-1) ? latest : null}><div className="ask-question"><span>You asked</span><p>{turn.question}</p></div><AnswerCard answer={turn.answer} busy={state.busy} onAsk={ask} /></section>)}</div>
      <div className="ask-composer"><form onSubmit={e => { e.preventDefault(); ask() }}><label htmlFor="dashboard-question">{turns.length ? 'Ask a follow-up or something new' : 'Your question'}</label><textarea id="dashboard-question" ref={textarea} rows={3} value={question} maxLength={1000} onChange={e => setQuestion(e.target.value)} placeholder="Why did checkout conversion change for mobile this week?" onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (!state.busy) ask() } }} /><div className="ask-composeactions"><span>{question.length}/1000 · Ctrl/⌘ + Enter</span>{state.busy ? <button type="button" onClick={cancel}>Cancel</button> : <button className="ask-submit" type="submit" disabled={question.trim().length < 3 || !projectId}>Analyse question →</button>}</div></form><label className="ask-context"><input type="checkbox" checked={useContext} onChange={e => setUseContext(e.target.checked)} /> Treat short follow-ups like “What about desktop?” as part of the previous answer</label><p className="ask-footnote">Changing the project or dashboard filters starts a new conversation. Only your question text is sent to Gemini (when configured), never customer-level events.</p></div>
      {state.busy && <div className="ask-progress" role="status"><span className="ask-spinner" /> Working on it…</div>}
      {state.error && <div className="ask-error" role="alert"><p>{state.error}</p><button type="button" onClick={() => lastRequest.current && ask(lastRequest.current.text, lastRequest.current.context)}>Try again</button></div>}
      <div className="ask-announcement" aria-live="polite" aria-atomic="true">{!state.busy && turns.length ? `Answer ready: ${turns.at(-1).answer.headline}` : ''}</div>
    </div>
  </Page>
}
