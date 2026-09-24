import { useFilters } from '../context/FiltersContext'
import { useRevenueBreakdown, useStackedRevenue } from '../hooks/useRevenueByPersona'
import RevenueSummaryCards from '../components/revenue/RevenueSummaryCards'
import RevenueStackedChart from '../components/revenue/RevenueStackedChart'
import RevenueTable from '../components/revenue/RevenueTable'

export default function RevenuePage() {
  const { platform, selectedPersonas, period, customRange, device } = useFilters()
  const filters = { period, customRange, platform, device }

  const { rows, loading: rowsLoading } = useRevenueBreakdown(filters)
  const { monthly, loading: chartLoading } = useStackedRevenue(filters)

  const filteredRows = rows.filter(r => selectedPersonas.length === 0 || selectedPersonas.includes(r.id))

  const totalRev = filteredRows.reduce((s, r) => s + r.revenue, 0)
  const totalOrders = filteredRows.reduce((s, r) => s + r.orders, 0)
  const avgAov = filteredRows.length ? Math.round(filteredRows.reduce((s, r) => s + r.aov, 0) / filteredRows.length) : 0
  const topPersona = [...filteredRows].sort((a, b) => b.revenue - a.revenue)[0] || null

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">Revenue by Persona</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {platform === 'combined' ? 'All Platforms' : platform === 'web' ? 'Web only' : 'App only'}
          {selectedPersonas.length > 0 ? ` · ${selectedPersonas.length} persona filter active` : ''}
        </p>
      </div>

      <RevenueSummaryCards
        totalRev={totalRev}
        totalOrders={totalOrders}
        avgAov={avgAov}
        topPersona={topPersona}
        selectedPersonas={selectedPersonas}
      />

      <RevenueStackedChart platform={platform} selectedPersonas={selectedPersonas} monthly={monthly} loading={chartLoading} />

      <RevenueTable platform={platform} rows={filteredRows} loading={rowsLoading} />
    </div>
  )
}