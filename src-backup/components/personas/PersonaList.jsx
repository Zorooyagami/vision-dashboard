import MiniSparkline from '../MiniSparkline'
import { formatCompact, formatTrend } from './personaUi'

export default function PersonaList({
  personas,
  mode,
  selectedId,
  compareIds,
  onSelect,
  onToggleCompare,
}) {
  return (
    <div className="space-y-2">
      {personas.map((persona) => {
        const isActive =
          mode === 'explore'
            ? selectedId === persona.id
            : compareIds.includes(persona.id)

        const trendValues = persona.trend?.map((item) => item.value) || []

        return (
          <button
            key={persona.id}
            type="button"
            onClick={() =>
              mode === 'explore'
                ? onSelect(persona.id)
                : onToggleCompare(persona.id)
            }
            className="w-full rounded-2xl border bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{
              borderColor: isActive ? persona.color : '#E2E8F0',
              boxShadow: isActive ? `0 0 0 1px ${persona.color}20` : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                style={{ background: persona.lightBg, color: persona.textColor }}
              >
                {persona.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {persona.name}
                  </p>
                  {mode === 'compare' && isActive && (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: persona.lightBg, color: persona.textColor }}
                    >
                      ✓ Selected
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {formatCompact(persona.audienceCount)} users · {persona.trafficSharePct}% of sessions
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    background: persona.audienceChangePct >= 0 ? '#ECFDF5' : '#FEF2F2',
                    color: persona.audienceChangePct >= 0 ? '#047857' : '#DC2626',
                  }}
                >
                  {formatTrend(persona.audienceChangePct)}
                </span>

                <MiniSparkline
                  data={trendValues}
                  color={persona.color}
                  width={52}
                  height={18}
                />
              </div>
            </div>
          </button>
        )
      })}

      {mode === 'compare' && (
        <p className="py-1 text-center text-[10px] text-slate-400">
          {compareIds.length === 0
            ? 'Select 2–3 personas to compare'
            : `${compareIds.length}/3 selected`}
        </p>
      )}
    </div>
  )
}
