import { createContext, useContext, useState, useCallback } from 'react'

const FiltersContext = createContext(null)

export function FiltersProvider({ children }) {
  const [platform, setPlatform] = useState('combined')
  const [selectedPersonas, setSelectedPersonas] = useState([])
  const [period, setPeriod] = useState('30d')
  const [customRange, setCustomRange] = useState(null)

  // Topbar calls onPeriodChange(token) for presets,
  // or onPeriodChange('custom', { from, to }) for the custom picker
  const onPeriodChange = useCallback((token, range) => {
    setPeriod(token)
    if (token === 'custom' && range) setCustomRange(range)
  }, [])

  const value = {
    platform, setPlatform,
    selectedPersonas, setSelectedPersonas,
    period, onPeriodChange,
    customRange,
  }

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters must be used within a FiltersProvider')
  return ctx
}