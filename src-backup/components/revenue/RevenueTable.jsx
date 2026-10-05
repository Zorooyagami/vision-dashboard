// src/components/revenue/RevenueTable.jsx
import { useState } from 'react'
import PersonaChip from '../PersonaChip'
import { fmtRev } from './revenueUtils'

const TABLE_ROWS_DEFAULT = 5

export default function RevenueTable({ platform, rows, loading }) {
  const [sortKey, setSortKey] = useState('revenue')
  const [sortDir, setSortDir] = useState('desc')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...rows].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortDir === 'desc' ? -diff : diff
  })

  const totalRev = sorted.reduce((s, r) => s + r.revenue, 0)
  const totalOrders = sorted.reduce((s, r) => s + r.orders, 0)
  const avgAov = sorted.length > 0 ? Math.round(sorted.reduce((s, r) => s + r.aov, 0) / sorted.length) : 0

  function SortIcon({ col }) {
    if (sortKey !== col) return <span className="text-slate-400 ml-0.5">↕</span>
    return <span className="ml-0.5" style={{ color: '#6366F1' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  const exportCsv = () => {
    const header = 'Persona,Platform,Revenue,Orders,AOV,% Total\n'
    const csvRows = sorted.map(r => `${r.id},${platform === 'combined' ? 'All' : platform},${r.revenue},${r.orders},${r.aov},${r.pct}%`).join('\n')
    const blob = new Blob([header + csvRows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'vision-revenue.csv'
    a.click()
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
        <p className="text-sm font-bold text-slate-900">Detailed Breakdown</p>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          onClick={exportCsv}
        >Export CSV</button>
      </div>
      <table className="w-full">
        <thead style={{ background: '#F8FAFC' }}>
          <tr>
            <th className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">PERSONA</th>
            <th className="text-left text-[10px] font-semibold text-slate-400 px-3 py-3">PLATFORM</th>
            {['revenue', 'orders', 'aov', 'pct'].map(col => (
              <th
                key={col}
                className="text-right text-[10px] font-semibold text-slate-400 px-3 py-3 cursor-pointer select-none hover:text-slate-600 transition-colors"
                onClick={() => handleSort(col)}
              >
                {col === 'aov' ? 'AOV' : col === 'pct' ? '% TOTAL' : col.toUpperCase()} <SortIcon col={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">Loading…</td></tr>
          )}
          {!loading && sorted.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No personas match current filter</td></tr>
          )}
          {!loading && (showAll ? sorted : sorted.slice(0, TABLE_ROWS_DEFAULT)).map((row, i) => (
            <tr
              key={row.id}
              style={{ background: hoveredRow === row.id ? '#FAFBFF' : i % 2 === 0 ? '#fff' : '#FAFBFF', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-5 py-3"><PersonaChip id={row.id} size="md" /></td>
              <td className="px-3 py-3 text-xs font-medium text-slate-400 capitalize">{platform === 'combined' ? 'All' : platform}</td>
              <td className="px-3 py-3 text-right text-sm font-bold text-slate-900">{fmtRev(row.revenue)}</td>
              <td className="px-3 py-3 text-right text-xs font-semibold text-slate-600">{row.orders.toLocaleString()}</td>
              <td className="px-3 py-3 text-right text-xs font-semibold text-slate-600">${row.aov}</td>
              <td className="px-3 py-3 text-right">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#4338CA' }}>{row.pct}%</span>
              </td>
            </tr>
          ))}
        </tbody>
        {!loading && sorted.length > 0 && (
          <tfoot style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <tr>
              <td className="px-5 py-3 text-xs font-bold text-slate-700" colSpan={2}>
                {sorted.length} Persona{sorted.length !== 1 ? 's' : ''}
              </td>
              <td className="px-3 py-3 text-right text-sm font-black text-slate-900">{fmtRev(totalRev)}</td>
              <td className="px-3 py-3 text-right text-xs font-bold text-slate-600">{totalOrders.toLocaleString()}</td>
              <td className="px-3 py-3 text-right text-xs font-bold text-slate-600">${avgAov}</td>
              <td className="px-3 py-3 text-right text-xs font-bold text-slate-600">100%</td>
            </tr>
            {sorted.length > TABLE_ROWS_DEFAULT && (
              <tr>
                <td colSpan={6} className="px-5 py-2 text-center">
                  <button onClick={() => setShowAll(s => !s)} className="text-xs font-semibold hover:underline" style={{ color: '#6366F1' }}>
                    {showAll ? 'Show fewer' : `Show ${sorted.length - TABLE_ROWS_DEFAULT} more`}
                  </button>
                </td>
              </tr>
            )}
          </tfoot>
        )}
      </table>
    </div>
  )
}