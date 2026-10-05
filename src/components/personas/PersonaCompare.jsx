import { VisionMark } from '../VisionLogo'
import LineChart from '../LineChart'
import PersonaChip from '../PersonaChip'
import { formatCompact, formatCurrency, formatPercent } from './personaUi'

export default function PersonaCompare({ personas, months, onRemove }) {
  if (!personas.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mb-3 flex justify-center">
          <VisionMark size={40} theme="muted" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Select 2–3 personas to compare</p>
        <p className="mt-1 text-xs text-slate-400">Choose personas from the list to compare performance side by side.</p>
      </div>
    )
  }

  const labels = months.map((month) => month.label)
  const series = personas.map((persona) => ({
    key: persona.id,
    name: persona.name,
    color: persona.color,
    data: persona.trend?.map((item) => item.value) || [],
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="rounded-2xl border bg-white p-4"
            style={{ borderColor: `${persona.color}88`, boxShadow: `0 0 0 1px ${persona.color}12` }}
          >
            <div className="flex items-start justify-between gap-3">
              <PersonaChip id={persona.id} size="md" />
              <button
                type="button"
                onClick={() => onRemove(persona.id)}
                className="rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                Remove
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                ['Users', formatCompact(persona.audienceCount)],
                ['Sessions', formatCompact(persona.sessionCount)],
                ['Revenue', formatCurrency(persona.revenue)],
                ['AOV', formatCurrency(persona.aov)],
                ['Conversion', formatPercent(persona.conversionRate)],
                ['Repeat visits', formatPercent(persona.repeatRate)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs last:border-b-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {personas.length >= 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">Activity trend comparison</p>
          <p className="mb-4 mt-0.5 text-xs text-slate-400">Six-month unique-session trend</p>
          <LineChart labels={labels} series={series} height={190} />
          <div className="mt-3 flex flex-wrap gap-4">
            {personas.map((persona) => (
              <div key={persona.id} className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: persona.color }} />
                <span className="text-xs text-slate-500">{persona.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
