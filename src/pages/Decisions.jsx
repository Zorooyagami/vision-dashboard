import { useState } from 'react'
import PersonaChip from '../components/PersonaChip'
import BarChart from '../components/BarChart'
import { VisionMark } from '../components/VisionLogo'


const OUTCOME_STYLES = {
  success: { bg: '#ECFDF5', color: '#047857', label: 'Success', icon: '✓' },
  neutral: { bg: '#F8FAFC', color: '#475569', label: 'Neutral', icon: '→' },
  failed: { bg: '#FEF2F2', color: '#B91C1C', label: 'Failed', icon: '✕' },
  pending: { bg: '#EEF2FF', color: '#4338CA', label: 'Pending', icon: '…' },
}

const PERSONA_IDS = ['loyal', 'collector', 'firsttime', 'active', 'guest']

function NewDecisionModal({ onClose, onSave, prefill }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: prefill?.title ?? '',
    date: '2026-08-18',
    owner: 'Andy Phillips',
    ownerInitials: 'AP',
    hypothesis: '',
    metric: prefill?.metric ?? 'Conversion Rate',
    personas: prefill?.personas ?? [],
    outcome: 'pending',
  })

  const togglePersona = (id) => {
    setForm(f => ({
      ...f,
      personas: f.personas.includes(id) ? f.personas.filter(p => p !== id) : [...f.personas, id],
    }))
  }

  const handleSave = () => {
    const month = new Date(form.date).toLocaleString('en-US', { month: 'short' })
    const dateFormatted = new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const newDecision = {
      id: Date.now(),
      title: form.title || 'New Decision',
      date: dateFormatted,
      month,
      owner: form.owner,
      ownerInitials: form.ownerInitials,
      hypothesis: form.hypothesis || 'Hypothesis not specified.',
      metric: form.metric,
      personas: form.personas.length > 0 ? form.personas : ['loyal'],
      outcome: 'pending',
      before: [0, 0, 0, 0, 0, 0],
      after: [0, 0, 0, 0, 0, 0],
      unit: form.metric === 'Avg Order Value' ? '$' : form.metric === 'Conversion Rate' ? '%' : '',
    }
    onSave(newDecision)
    onClose()
  }

  const valid1 = form.title.trim().length > 0
  const valid2 = form.hypothesis.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,17,23,0.6)', backdropFilter: 'blur(4px)' }}>
      <div role="dialog" aria-modal="true" aria-label="Log New Decision" className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Log New Decision</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track the business impact of your decisions</p>
            </div>
            <button onClick={onClose} aria-label="Close dialog" className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors touch-target">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {['Details', 'Hypothesis', 'Tracking'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                    style={{ background: step >= i + 1 ? '#6366F1' : '#E2E8F0', color: step >= i + 1 ? '#fff' : '#94A3B8' }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span className="text-xs font-medium transition-colors" style={{ color: step === i + 1 ? '#6366F1' : '#94A3B8' }}>{label}</span>
                </div>
                {i < 2 && <div className="w-6 h-px transition-colors" style={{ background: step > i + 1 ? '#6366F1' : '#E2E8F0' }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Decision Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Free shipping for First Time Users"
                  className="w-full text-sm border rounded-lg px-3 py-2.5 outline-none transition-colors"
                  style={{ borderColor: form.title ? '#6366F1' : '#E2E8F0' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full text-sm border rounded-lg px-3 py-2.5 outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Owner</label>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full text-sm border rounded-lg px-3 py-2.5 outline-none"
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Hypothesis <span className="text-red-400">*</span></label>
                <textarea
                  rows={4}
                  value={form.hypothesis}
                  onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))}
                  placeholder="If we [action], then [expected outcome] because [rationale]."
                  className="w-full text-sm border rounded-lg px-3 py-2.5 outline-none resize-none transition-colors"
                  style={{ borderColor: form.hypothesis ? '#6366F1' : '#E2E8F0' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Target Persona(s)</label>
                <div className="flex flex-wrap gap-2">
                  {PERSONA_IDS.map(id => (
                    <button
                      key={id}
                      onClick={() => togglePersona(id)}
                      className="transition-all"
                      style={{ opacity: form.personas.length > 0 && !form.personas.includes(id) ? 0.5 : 1 }}
                    >
                      <PersonaChip id={id} size="md" />
                    </button>
                  ))}
                </div>
                {form.personas.length === 0 && <p className="text-[10px] text-slate-400 mt-1.5">Click to select (defaults to all)</p>}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Metric to Track</label>
                <select
                  value={form.metric}
                  onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}
                  className="w-full text-sm border rounded-lg px-3 py-2.5 outline-none"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  <option>Conversion Rate</option>
                  <option>Avg Order Value</option>
                  <option>Revenue</option>
                  <option>Retention Rate</option>
                  <option>Sessions</option>
                  <option>Orders per User</option>
                </select>
              </div>
              <div className="rounded-xl p-4 border" style={{ background: '#FAFBFF', borderColor: '#E2E8F0' }}>
                <p className="text-xs font-semibold text-slate-700 mb-1">Auto-tracking begins on {new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</p>
                <p className="text-xs text-slate-400">Vision captures a 14-day baseline before and measures impact for 30 days after. You'll see the before/after comparison chart once data accumulates.</p>
              </div>
              {/* Summary preview */}
              <div className="rounded-xl p-3 border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-[10px] font-semibold text-slate-400 tracking-widest mb-2">PREVIEW</p>
                <p className="text-sm font-bold text-slate-900">{form.title || 'Untitled decision'}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {(form.personas.length > 0 ? form.personas : PERSONA_IDS).map(id => (
                    <PersonaChip key={id} id={id} size="sm" />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-between items-center">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm font-semibold border rounded-lg transition-colors hover:bg-slate-50" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>Back</button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !valid1}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-opacity"
                style={{ background: '#6366F1', opacity: (step === 1 && !valid1) ? 0.4 : 1 }}
              >
                Continue
              </button>
            ) : (
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white rounded-lg" style={{ background: '#6366F1' }}>
                Log Decision
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DecisionsPage({ decisions, onAddDecision, prefill }) {
  const [expanded, setExpanded] = useState(decisions[0]?.id ?? null)
  const [showModal, setShowModal] = useState(!!prefill)

  const counts = {
    total: decisions.length,
    success: decisions.filter(d => d.outcome === 'success').length,
    neutral: decisions.filter(d => d.outcome === 'neutral').length,
    failed: decisions.filter(d => d.outcome === 'failed').length,
    pending: decisions.filter(d => d.outcome === 'pending').length,
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {showModal && <NewDecisionModal onClose={() => setShowModal(false)} onSave={onAddDecision} prefill={prefill} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Decision Tracking</h2>
          <p className="text-xs text-slate-400 mt-0.5">Log decisions and auto-track before/after impact</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Log New Decision
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {([
          ['Total', String(counts.total), '#0F172A'],
          ['Successful', String(counts.success), '#059669'],
          ['Neutral', String(counts.neutral + counts.pending), '#64748B'],
          ['Failed', String(counts.failed), '#DC2626'],
        ]).map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            <p className="text-xs text-slate-400 font-medium">{l}</p>
            <p className="text-2xl font-black mt-1" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {decisions.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="flex justify-center mb-4">
            <VisionMark size={52} theme="muted" />
          </div>
          <p className="text-base font-bold text-slate-900 mb-1.5">No decisions logged yet</p>
          <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">Start tracking your team's decisions and measure their impact on key metrics automatically.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: '#6366F1' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Log Your First Decision
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map(decision => {
            const s = OUTCOME_STYLES[decision.outcome]
            const isExpanded = expanded === decision.id
            const chartData = decision.before.map((b, i) => ({
              label: `W${i + 1}`,
              before: b,
              after: decision.after[i],
            }))
            const isPending = decision.outcome === 'pending'
            return (
              <div key={decision.id} className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                <button onClick={() => setExpanded(isExpanded ? null : decision.id)} className="w-full text-left p-5">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 mt-0.5" style={{ background: s.bg, color: s.color }}>{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{decision.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-slate-400">{decision.date}</span>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: '#6366F1' }}>{decision.ownerInitials}</div>
                              <span className="text-xs text-slate-500">{decision.owner}</span>
                            </div>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-500">↑ {decision.metric}</span>
                            <span className="text-slate-300">·</span>
                            {decision.personas.map(id => <PersonaChip key={id} id={id} size="sm" />)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: '#F1F5F9' }}>
                    <p className="text-xs text-slate-500 leading-relaxed mt-3">
                      <span className="font-semibold text-slate-700">Hypothesis:</span> {decision.hypothesis}
                    </p>
                    <div className="mt-4 p-4 rounded-xl border" style={{ background: '#FAFBFF', borderColor: '#E2E8F0' }}>
                      {isPending ? (
                        <div className="text-center py-6">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: '#EEF2FF' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4338CA" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-sm font-semibold text-slate-700">Tracking in progress</p>
                          <p className="text-xs text-slate-400 mt-0.5">Before/after data will appear once 14 days of baseline are collected.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 mb-3">
                            <p className="text-xs font-semibold text-slate-700">{decision.metric} — Before vs After</p>
                            <div className="flex gap-3 text-[10px] font-semibold">
                              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#CBD5E1' }} /> Before</span>
                              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#6366F1' }} /> After</span>
                            </div>
                          </div>
                          <BarChart data={chartData} height={130} formatValue={v => `${decision.unit}${v.toFixed(1)}`} />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
