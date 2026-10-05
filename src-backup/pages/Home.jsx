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
import { usePersonaLeaderboard } from '../hooks/usePersonaLeaderboard'

export default function Home({ decisions, onNavigate, onLogDecision }) {
  const { platform, selectedPersonas, period, customRange, device } = useFilters()
  const { rows, loadingPersonaLeaderboard } = usePersonaLeaderboard({
    period,
    customRange,
    platform,
    device,
  })

  const { cards, loading, error } = useKpiData(
    platform,
    selectedPersonas,
    period,
    customRange,
  )

  const visiblePersonas =
    selectedPersonas.length === 0
      ? PERSONAS
      : PERSONAS.filter((persona) => selectedPersonas.includes(persona.id))

  const donutData = visiblePersonas.map((persona) => ({
    name: persona.name,
    value: persona.pct,
    color: persona.color,
  }))

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <KpiRow kpis={cards} loading={loading} error={error} />

      <InsightsPanel
        onNavigate={onNavigate}
        onLogDecision={onLogDecision}
      />

      <RevenueTrendCard platform={platform} decisions={decisions} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <KpiWatchlist onViewAll={() => onNavigate('metrics')} />
        <FunnelsTeaser onNavigate={onNavigate} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <PersonaDistribution
          selectedCount={selectedPersonas.length}
          visiblePersonas={visiblePersonas}
          donutData={donutData}
        />
        <PersonaLeaderboard
          rows={rows}
          loadingPersonaLeaderboard={loadingPersonaLeaderboard}
          onViewAll={() => onNavigate('personas')}
        />
      </div>
    </div>
  )
}
