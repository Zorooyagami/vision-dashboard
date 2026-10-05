import { useState } from 'react'
import PersonaChip from '../components/PersonaChip'
import AreaChart from '../components/AreaChart'
import { PERSONAS } from '../data/personas'


const INITIAL_ALERTS = [
  {
    id: 1,
    severity: 'critical',
    metric: 'Purchase Rate',
    persona: 'collector',
    message: 'Collector purchase rate dropped 18% this week — lowest in 90 days. Primarily App channel. Possible issue with App checkout for rare-item listings.',
    timestamp: '2h ago',
    dismissed: false,
    chartData: [
      { label: 'W1', value: 9.8 }, { label: 'W2', value: 9.6 }, { label: 'W3', value: 9.4 },
      { label: 'W4', value: 9.7 }, { label: 'W5', value: 8.8 }, { label: 'W6', value: 8.1 },
      { label: 'W7', value: 8.0 }, { label: 'W8', value: 7.9 },
    ],
  },
  {
    id: 2,
    severity: 'warning',
    metric: 'Session Duration',
    persona: 'firsttime',
    message: 'First Time Users session duration fell 23% vs last week. High bounce rate on mobile landing pages detected.',
    timestamp: '5h ago',
    dismissed: false,
    chartData: [
      { label: 'W1', value: 4.2 }, { label: 'W2', value: 4.4 }, { label: 'W3', value: 4.1 },
      { label: 'W4', value: 4.3 }, { label: 'W5', value: 3.8 }, { label: 'W6', value: 3.5 },
      { label: 'W7', value: 3.4 }, { label: 'W8', value: 3.3 },
    ],
  },
  {
    id: 3,
    severity: 'info',
    metric: 'Revenue',
    persona: 'loyal',
    message: 'Loyal Users revenue is up 14.2% MoM — on track to exceed monthly target. Free shipping campaign impact confirmed.',
    timestamp: '1d ago',
    dismissed: false,
    chartData: [
      { label: 'W1', value: 420 }, { label: 'W2', value: 438 }, { label: 'W3', value: 452 },
      { label: 'W4', value: 460 }, { label: 'W5', value: 472 }, { label: 'W6', value: 488 },
      { label: 'W7', value: 496 }, { label: 'W8', value: 504 },
    ],
  },
  {
    id: 4,
    severity: 'warning',
    metric: 'Conversion Rate',
    persona: 'guest',
    message: 'Guest User conversion rate 1.4% below benchmark. Consider streamlining guest checkout or adding trust signals.',
    timestamp: '2d ago',
    dismissed: false,
    chartData: [
      { label: 'W1', value: 2.1 }, { label: 'W2', value: 2.0 }, { label: 'W3', value: 1.9 },
      { label: 'W4', value: 1.8 }, { label: 'W5', value: 1.8 }, { label: 'W6', value: 1.7 },
      { label: 'W7', value: 1.8 }, { label: 'W8', value: 1.8 },
    ],
  },
  {
    id: 5,
    severity: 'info',
    metric: 'Retention',
    persona: 'active',
    message: "Active Users 7-day retention improved to 41% (+3pp) following last week's onboarding email campaign.",
    timestamp: '3d ago',
    dismissed: false,
    chartData: [
      { label: 'W1', value: 36 }, { label: 'W2', value: 37 }, { label: 'W3', value: 37 },
      { label: 'W4', value: 38 }, { label: 'W5', value: 39 }, { label: 'W6', value: 40 },
      { label: 'W7', value: 41 }, { label: 'W8', value: 41 },
    ],
  },
]

// SVG icon nodes for each severity — distinct shapes for colorblind users
const SEV_ICONS = {
  critical: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v3.75M12 2.25L1.5 20.25h21L12 2.25zM12 16.5h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.25v.008M12 11.25v4.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
  ),
}

const SEVERITY = {
  critical: { label: 'Critical', bg: '#FEF2F2', border: '#FECACA', iconBg: '#DC2626', textColor: '#B91C1C', chartColor: '#EF4444' },
  warning:  { label: 'Warning',  bg: '#FFFBEB', border: '#FDE68A', iconBg: '#D97706', textColor: '#92400E', chartColor: '#F59E0B' },
  info:     { label: 'Info',     bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#2563EB', textColor: '#1D4ED8', chartColor: '#3B82F6' },
}

function AlertDetailModal({ alert, onClose, onCreateDecision, onSnooze }) {
  const s = SEVERITY[alert.severity]
  const persona = PERSONAS.find(p => p.id === alert.persona)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,17,23,0.6)', backdropFilter: 'blur(4px)' }}>
      <div role="dialog" aria-modal="true" aria-label={`${alert.metric} Alert`} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: s.iconBg }}>{SEV_ICONS[alert.severity]}</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">{alert.metric} Alert</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PersonaChip id={alert.persona} size="sm" />
                <span className="text-xs text-slate-500">{alert.timestamp}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors touch-target">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl p-3 border" style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-sm text-slate-700 leading-relaxed">{alert.message}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">{alert.metric} — 8-week trend</p>
            <AreaChart
              data={alert.chartData}
              color={s.chartColor}
              height={150}
              formatValue={v => `${v}`}
            />
          </div>

          {persona && (
            <div className="rounded-xl p-4 border" style={{ background: '#FAFBFF', borderColor: '#E2E8F0' }}>
              <p className="text-xs font-semibold text-slate-500 tracking-widest mb-2">AFFECTED PERSONA</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: persona.lightBg }}>{persona.icon}</div>
                <div>
                  <PersonaChip id={persona.id} size="md" />
                  <p className="text-xs text-slate-500 mt-0.5">{persona.count.toLocaleString()} users · {persona.convRate} avg conversion</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-between">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Close</button>
          <div className="flex gap-2">
            <button
              onClick={() => { onSnooze(alert.id); onClose() }}
              className="px-4 py-2 text-sm font-bold border rounded-lg hover:bg-slate-50 transition-colors"
              style={{ borderColor: '#E2E8F0', color: '#64748B' }}
            >
              Snooze 7d
            </button>
            <button
              onClick={() => { onCreateDecision(alert); onClose() }}
              className="px-4 py-2 text-sm font-bold text-white rounded-lg"
              style={{ background: s.iconBg }}
            >
              Create Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertCard({ alert, severity: s, onViewDetails, onDismiss }) {
  const [expanded, setExpanded] = useState(false)
  const TRUNCATE = 110
  const isLong = alert.message.length > TRUNCATE

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)', borderLeft: `3px solid ${s.iconBg}` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5" aria-hidden="true" style={{ background: s.iconBg }}>{SEV_ICONS[alert.severity]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.textColor }}>{s.label.toUpperCase()}</span>
              <span className="text-xs font-semibold text-slate-700">{alert.metric}</span>
              <PersonaChip id={alert.persona} size="sm" />
              <span className="text-[10px] text-slate-400 ml-auto">{alert.timestamp}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {expanded || !isLong ? alert.message : `${alert.message.slice(0, TRUNCATE)}…`}
              {isLong && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="ml-1 text-[11px] font-semibold hover:underline"
                  style={{ color: '#6366F1' }}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={onViewDetails}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50"
                style={{ borderColor: '#E2E8F0', color: '#374151' }}
              >
                View Details
              </button>
              <button
                onClick={onDismiss}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:text-slate-700"
                style={{ color: '#64748B' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function AlertsPage({ onNavigateSettings, onNavigateDecisions }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [filter, setFilter] = useState('all')
  const [detailAlert, setDetailAlert] = useState(null)

  const dismiss = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  const snooze = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))

  const handleCreateDecision = (alert) => {
    onNavigateDecisions({ title: `Fix: ${alert.message.slice(0, 60)}…`, metric: alert.metric, personas: [alert.persona] })
  }

  const active = alerts.filter(a => !a.dismissed && (filter === 'all' || a.severity === filter))
  const dismissed = alerts.filter(a => a.dismissed)

  const counts = {
    critical: alerts.filter(a => !a.dismissed && a.severity === 'critical').length,
    warning: alerts.filter(a => !a.dismissed && a.severity === 'warning').length,
    info: alerts.filter(a => !a.dismissed && a.severity === 'info').length,
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {detailAlert && <AlertDetailModal alert={detailAlert} onClose={() => setDetailAlert(null)} onCreateDecision={handleCreateDecision} onSnooze={snooze} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Alerts & Insights</h2>
          <p className="text-xs text-slate-400 mt-0.5">Auto-detected anomalies across personas and metrics</p>
        </div>
        <button onClick={onNavigateSettings} className="text-xs font-semibold px-3 py-2 rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
          Configure Thresholds
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {Object.entries(counts).map(([sev, count]) => {
          const s = SEVERITY[sev]
          return (
            <div key={sev} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{s.label}</p>
                <span className="w-6 h-6 rounded-full flex items-center justify-center" aria-hidden="true" style={{ background: s.iconBg }}>{SEV_ICONS[sev]}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">active alert{count !== 1 ? 's' : ''}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center rounded-xl p-1 gap-1 w-fit" style={{ background: '#F1F5F9' }}>
        {(['all', 'critical', 'warning', 'info']).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={
              filter === f
                ? { background: '#fff', color: '#6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#475569' }
            }
          >
            {f === 'all' ? `All (${counts.critical + counts.warning + counts.info})` : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-lg" style={{ background: '#ECFDF5' }}>✓</div>
            <p className="text-sm font-semibold text-slate-700">All clear!</p>
            <p className="text-xs text-slate-400 mt-1">No active alerts for the selected filter.</p>
          </div>
        ) : active.map(alert => {
          const s = SEVERITY[alert.severity]
          return (
            <AlertCard
              key={alert.id}
              alert={alert}
              severity={s}
              onViewDetails={() => setDetailAlert(alert)}
              onDismiss={() => dismiss(alert.id)}
            />
          )
        })}
      </div>

      {dismissed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-widest mb-2">DISMISSED ({dismissed.length})</p>
          <div className="space-y-2">
            {dismissed.map(alert => (
              <div key={alert.id} className="bg-white rounded-xl border p-3 opacity-40" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{alert.metric}</span>
                  <PersonaChip id={alert.persona} size="sm" />
                  <button
                    onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, dismissed: false } : a))}
                    className="ml-auto text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
