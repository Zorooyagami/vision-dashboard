// src/context/ProjectContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(() => localStorage.getItem('vision_project_id') || null)

  useEffect(() => {
    if (projectId) localStorage.setItem('vision_project_id', projectId)
  }, [projectId])

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider')
  return ctx
}