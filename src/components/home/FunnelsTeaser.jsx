import { Card } from './shared'
import { FUNNEL_STEPS } from './homeConstants'

export default function FunnelsTeaser({ onNavigate }) {
  return (
    <Card className="col-span-2 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: '#6366F1' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V20a1 1 0 01-.553.894l-4-2A1 1 0 018 18v-4.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </span>
        <p className="text-sm font-bold text-slate-900">Custom Funnels</p>
      </div>
      <p className="text-[11px] text-slate-400 mb-4">Build and track multi-step conversion paths</p>

      <div className="flex-1 space-y-2 mb-4">
        {FUNNEL_STEPS.map((step, i) => {
          const prev = i > 0 ? FUNNEL_STEPS[i - 1].users : 0
          const dropPct = i > 0 ? Math.round(((prev - step.users) / prev) * 100) : 0
          return (
            <div key={step.label}>
              {i > 0 && (
                <div className="flex items-center gap-1.5 py-0.5 pl-4">
                  <div className="w-px h-3" style={{ background: '#E2E8F0' }} />
                  <span className="text-[10px] text-slate-400">−{dropPct}% drop</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                  style={{ background: '#6366F1' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-slate-600 truncate max-w-[100px]">{step.label}</span>
                    <span className="text-[10px] font-bold text-slate-700 shrink-0">{(step.users / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${step.pct}%`, background: '#6366F1', opacity: 1 - i * 0.15 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between" style={{ background: '#EEF2FF' }}>
        <span className="text-[11px] font-semibold text-slate-600">Overall conversion</span>
        <span className="text-sm font-black" style={{ color: '#4338CA' }}>23.4%</span>
      </div>

      <button
        onClick={() => onNavigate('explore')}
        className="w-full py-2.5 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        style={{ background: '#6366F1' }}
      >
        Explore More
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </Card>
  )
}