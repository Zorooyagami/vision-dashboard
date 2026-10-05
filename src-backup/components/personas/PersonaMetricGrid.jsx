import { formatCurrency, formatPercent } from './personaUi'

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        {hint && <span className="text-[9px] text-slate-300">{hint}</span>}
      </div>
      <p className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
        {value}
      </p>
    </div>
  )
}

export default function PersonaMetricGrid({ persona }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
      <MetricCard label="Revenue" value={formatCurrency(persona.revenue)} />
      <MetricCard label="Avg order value" value={formatCurrency(persona.aov)} />
      <MetricCard label="Conversion" value={formatPercent(persona.conversionRate)} />
      <MetricCard
        label="Repeat visit rate"
        value={formatPercent(persona.repeatRate)}
        hint={persona.id === 'guest' ? 'Known users only' : undefined}
      />
    </div>
  )
}
