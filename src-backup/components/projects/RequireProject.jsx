import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProject } from '../../context/ProjectContext'

export default function RequireProject() {
  const { projectId } = useProject()
  const location = useLocation()

  if (!projectId) {
    return (
      <Navigate
        to="/projects"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
