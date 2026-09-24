import Topbar from './Topbar'
import { useFilters } from '../context/FiltersContext'

export default function TopbarHost({ title = 'Overview' }) {
  const {
    platform, setPlatform,
    selectedPersonas, setSelectedPersonas,
    period, onPeriodChange,
  } = useFilters()

  return (
    <Topbar
      title={title}
      platform={platform}
      onPlatformChange={setPlatform}
      selectedPersonas={selectedPersonas}
      onPersonasChange={setSelectedPersonas}
      period={period}
      onPeriodChange={onPeriodChange}
    />
  )
}