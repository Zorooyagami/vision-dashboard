import PersonaChip from '../PersonaChip'
import { Card, ViewAllBtn } from './shared'
import { fmtRev } from '../revenue/revenueUtils' // reuse the same formatter from RevenueTable

export default function PersonaLeaderboard({ rows, loadingPersonaLeaderboard, onViewAll }) {
  console.log("rows",rows)
  return (
    <Card className="col-span-3 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-900">Persona Leaderboard</p>
        <ViewAllBtn onClick={onViewAll} />
      </div>

      {loadingPersonaLeaderboard && (
        <div className="flex items-center justify-center h-24 text-sm text-slate-400">Loading…</div>
      )}

      {!loadingPersonaLeaderboard && rows.length === 0 && (
        <div className="flex items-center justify-center h-24 text-sm text-slate-400">No data for current filter</div>
      )}

      {!loadingPersonaLeaderboard && rows.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-semibold text-slate-500 pb-3 tracking-widest uppercase">Persona</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 pb-3 tracking-widest uppercase">Revenue</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 pb-3 tracking-widest uppercase">Conv %</th>
              <th className="w-5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} style={{ borderTop: i === 0 ? '1px solid #F1F5F9' : '1px solid #F8FAFC' }}>
                <td className="py-3">
                  <PersonaChip id={row.id} size="sm" />
                </td>
                <td className="py-3 text-right text-sm font-bold text-slate-900">{row.revenue}</td>
                <td className="py-3 text-right text-xs font-semibold text-slate-500">{row.conv}%</td>
                <td className="py-3 text-right text-xs pl-2">
                  {row.dir === 'up' ? (
                    <span className="text-emerald-500 font-bold">↑</span>
                  ) : (
                    <span className="text-slate-400 font-bold">→</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}