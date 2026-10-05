import { useNavigate } from 'react-router-dom'
import Topbar from './Topbar'
import { useFilters } from '../context/FiltersContext'
import { useProject } from '../context/ProjectContext'

export default function TopbarHost({ title = 'Overview', showFilters = true }) {
  const navigate = useNavigate()
  const {
    platform,
    setPlatform,
    selectedPersonas,
    setSelectedPersonas,
    period,
    onPeriodChange,
    customRange,
  } = useFilters()
  const { projectId, projectName } = useProject()

  return (
    <Topbar
      title={title}
      showFilters={showFilters}
      projectId={projectId}
      projectName={projectName}
      onProjectClick={() => navigate('/projects')}
      onNavigatePath={navigate}
      platform={platform}
      onPlatformChange={setPlatform}
      selectedPersonas={selectedPersonas}
      onPersonasChange={setSelectedPersonas}
      period={period}
      customRange={customRange}
      onPeriodChange={onPeriodChange}
    />
  )
}
