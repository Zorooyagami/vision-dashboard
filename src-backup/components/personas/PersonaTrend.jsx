import MiniSparkline from '../MiniSparkline'

export default function PersonaTrend({ persona, months = [] }) {
  const values = persona.trend?.map((item) => item.value) || []
  const labels = months.length
    ? months.map((item) => item.label)
    : persona.trend?.map((item) => item.label) || []

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            6-month activity
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Unique sessions for this persona
          </p>
        </div>
      </div>

      <div className="overflow-hidden">
        <MiniSparkline
          data={values}
          color={persona.color}
          width={520}
          height={54}
        />
      </div>

      <div className="mt-1 flex justify-between gap-1 text-[9px] text-slate-400">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
    </div>
  )
}
