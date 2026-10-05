import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ACTIVE_PROJECT_ID_KEY,
  ACTIVE_PROJECT_NAME_KEY,
  clearActiveProject,
  setActiveProject,
} from '../services/apiClient'

const ProjectContext = createContext(null)

function readStoredProject() {
  return {
    projectId: localStorage.getItem(ACTIVE_PROJECT_ID_KEY) || null,
    projectName: localStorage.getItem(ACTIVE_PROJECT_NAME_KEY) || null,
  }
}

export function ProjectProvider({ children }) {
  const [activeProject, setActiveProjectState] = useState(readStoredProject)

  const selectProject = useCallback((project) => {
    if (!project?.projectId) return

    setActiveProject(project)
    setActiveProjectState({
      projectId: project.projectId,
      projectName: project.name || project.projectId,
    })
  }, [])

  // Backward-compatible setter for any existing code that only knows an ID.
  const setProjectId = useCallback((projectId) => {
    if (!projectId) {
      clearActiveProject()
      setActiveProjectState({ projectId: null, projectName: null })
      return
    }

    setActiveProject(projectId)
    setActiveProjectState((current) => ({
      projectId,
      projectName:
        current.projectId === projectId
          ? current.projectName
          : projectId,
    }))
  }, [])

  const clearProject = useCallback(() => {
    clearActiveProject()
    setActiveProjectState({ projectId: null, projectName: null })
  }, [])

  // Keep multiple tabs/windows in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (
        event.key === ACTIVE_PROJECT_ID_KEY ||
        event.key === ACTIVE_PROJECT_NAME_KEY
      ) {
        setActiveProjectState(readStoredProject())
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({
      ...activeProject,
      setProjectId,
      selectProject,
      clearProject,
    }),
    [activeProject, setProjectId, selectProject, clearProject],
  )

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider')
  return ctx
}
