import KpiRow from '../components/home/KpiRow'
import InsightsPanel from '../components/home/AiInsightsPanel'
import RevenueTrendCard from '../components/home/RevenueTrendCard'
import KpiWatchlist from '../components/home/KpiWatchlist'
import FunnelsTeaser from '../components/home/FunnelsTeaser'
import PersonaDistribution from '../components/home/PersonaDistribution'
import PersonaLeaderboard from '../components/home/PersonaLeaderboard'
import { useFilters } from '../context/FiltersContext'
import { useKpiData } from '../hooks/useKpiData'
import { PERSONAS } from '../data/personas'
import { LEADERBOARD } from '../components/home/homeConstants'
import { buildQueryParams } from '../services/analyticsService'
import { usePersonaLeaderboard } from '../hooks/usePersonaLeaderboard'
export default function Home({ decisions, onNavigate, onLogDecision }) {
  const { platform, selectedPersonas, period, customRange, device } = useFilters()
const { rows, loadingPersonaLeaderboard } = usePersonaLeaderboard({ period, customRange, platform, device })

  const { cards, loading, error } = useKpiData(platform, selectedPersonas, period, customRange)

  const visiblePersonas = selectedPersonas.length === 0
    ? PERSONAS
    : PERSONAS.filter(p => selectedPersonas.includes(p.id))

  const donutData = visiblePersonas.map(p => ({ name: p.name, value: p.pct, color: p.color }))

  const visibleLeaderboard = selectedPersonas.length === 0
    ? LEADERBOARD
    : LEADERBOARD.filter(r => selectedPersonas.includes(r.id))



  return (
    <div className="p-6 space-y-5">
      {/* 🍽️ Just hand the plate to the table — KpiRow doesn't fetch anything itself */}
      <KpiRow kpis={cards} loading={loading} error={error} />

      <InsightsPanel period={period}/>
      <RevenueTrendCard platform={platform} decisions={decisions} />

      <div className="grid grid-cols-4 gap-4">
        <KpiWatchlist onViewAll={() => onNavigate('metrics')} />
        <FunnelsTeaser onNavigate={onNavigate} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <PersonaDistribution
          selectedCount={selectedPersonas.length}
          visiblePersonas={visiblePersonas}
          donutData={donutData}
        />
        <PersonaLeaderboard rows={rows} onViewAll={() => onNavigate('personas')} />
      </div>
    </div>
  )
}