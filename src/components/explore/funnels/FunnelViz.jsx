import { fmtVol } from '../exploreUtils'

function FunnelViz({ steps, data }) {
  const max = data[0] || 1
  return (
    <div className="space-y-2 py-2">
      {steps.map((step, i) => {
        const pct = Math.round((data[i] / max) * 100)
        const drop = i > 0 ? Math.round(((data[i - 1] - data[i]) / data[i - 1]) * 100) : 0
        return (
          <div key={step}>
            {i > 0 && (
              <div className="flex items-center gap-2 my-1 px-2">
                <div className="w-px h-4 self-stretch" style={{ background: '#E2E8F0', marginLeft: 16 }} />
                <span className="text-[11px] text-slate-400 font-medium">{drop}% drop-off</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#6366F1' }}>{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold text-slate-700">{step}</span>
                  <span className="text-xs font-bold text-slate-900">{fmtVol(data[i])} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#6366F1', opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FunnelViz
