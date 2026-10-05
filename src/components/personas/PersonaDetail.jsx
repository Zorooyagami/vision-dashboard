import PersonaMetricGrid from './PersonaMetricGrid'
import PersonaTrend from './PersonaTrend'
import { formatCompact, formatPercent, formatTrend } from './personaUi'

export default function PersonaDetail({ persona, months, onAdjustThresholds }) {
  if (!persona) return null

  const platformSplit = persona.platformSplit || { web: 0, app: 0 }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ background: persona.lightBg, color: persona.textColor }}
        >
          {persona.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black tracking-tight text-slate-900">
              {persona.name}
            </h3>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold"
              style={{ background: persona.lightBg, color: persona.textColor }}
            >
              {formatCompact(persona.audienceCount)} users
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:ml-auto"
              style={{
                background: persona.audienceChangePct >= 0 ? '#ECFDF5' : '#FEF2F2',
                color: persona.audienceChangePct >= 0 ? '#047857' : '#DC2626',
              }}
            >
              {formatTrend(persona.audienceChangePct)} vs prior period
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{persona.desc}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Classification rule
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          style={{ background: persona.lightBg, color: persona.textColor }}
        >
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {persona.criteria}
        </span>
      </div>

      <PersonaMetricGrid persona={persona} />

      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Platform split
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Unique sessions by surface</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              {formatCompact(persona.sessionCount)} sessions
            </span>
          </div>

          <div className="space-y-3">
            {[
              ['Web', platformSplit.web],
              ['App', platformSplit.app],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{label}</span>
                  <span className="font-bold" style={{ color: persona.color }}>
                    {formatPercent(value)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, value || 0))}%`, background: persona.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <PersonaTrend persona={persona} months={months} />
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
        <div className="flex items-start gap-2.5">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth={2} className="mt-0.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-slate-700">How this persona is classified</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
              Vision applies mutually-exclusive persona rules automatically from login state, sign-up activity and purchase history.
            </p>
            {onAdjustThresholds && (
              <button
                type="button"
                onClick={onAdjustThresholds}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Review persona settings
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
