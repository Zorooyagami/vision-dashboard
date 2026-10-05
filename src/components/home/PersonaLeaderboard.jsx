import PersonaChip from '../PersonaChip'
import { Card, ViewAllBtn } from './shared'

export default function PersonaLeaderboard({ rows, loadingPersonaLeaderboard, onViewAll }) {
  return (
    <Card className="col-span-1 p-5 xl:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Persona Leaderboard</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Revenue contribution for the selected period</p>
        </div>
        <ViewAllBtn onClick={onViewAll} />
      </div>

      {loadingPersonaLeaderboard && (
        <div className="flex h-24 items-center justify-center text-sm text-slate-400">Loading…</div>
      )}

      {!loadingPersonaLeaderboard && rows.length === 0 && (
        <div className="flex h-24 items-center justify-center text-sm text-slate-400">No data for current filter</div>
      )}

      {!loadingPersonaLeaderboard && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px]">
            <thead>
              <tr>
                <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Persona</th>
                <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500">Revenue</th>
                <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500">Share</th>
                <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500">Orders</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} style={{ borderTop: i === 0 ? '1px solid #F1F5F9' : '1px solid #F8FAFC' }}>
                  <td className="py-3">
                    <PersonaChip id={row.id} size="sm" />
                  </td>
                  <td className="py-3 text-right text-sm font-bold text-slate-900">{row.revenue}</td>
                  <td className="py-3 text-right text-xs font-semibold text-slate-500">{row.share}</td>
                  <td className="py-3 text-right text-xs font-semibold text-slate-600">{row.orders.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
