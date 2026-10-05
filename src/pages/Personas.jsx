import { useEffect, useMemo, useState } from 'react'
import { PERSONAS } from '../data/personas'
import { useFilters } from '../context/FiltersContext'
import { usePersonasOverview } from '../hooks/usePersonasOverview'
import PersonaList from '../components/personas/PersonaList'
import PersonaDetail from '../components/personas/PersonaDetail'
import PersonaCompare from '../components/personas/PersonaCompare'
import { PERSONA_FALLBACK } from '../components/personas/personaUi'

function mergePersona(apiPersona) {
  const metadata =
    PERSONAS.find((item) => item.id === apiPersona.id) ||
    PERSONA_FALLBACK[apiPersona.id] ||
    {}

  return {
    ...metadata,
    ...apiPersona,
    name: metadata.name || PERSONA_FALLBACK[apiPersona.id]?.name || apiPersona.id,
    icon: metadata.icon || PERSONA_FALLBACK[apiPersona.id]?.icon || '●',
    color: metadata.color || PERSONA_FALLBACK[apiPersona.id]?.color || '#6366F1',
    lightBg: metadata.lightBg || PERSONA_FALLBACK[apiPersona.id]?.lightBg || '#EEF2FF',
    textColor: metadata.textColor || PERSONA_FALLBACK[apiPersona.id]?.textColor || '#4338CA',
    desc: metadata.desc || PERSONA_FALLBACK[apiPersona.id]?.desc || '',
  }
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
    </div>
  )
}

export default function PersonasPage({ onNavigateSettings }) {
  const { platform, period, customRange, device } = useFilters()
  const [selected, setSelected] = useState('loyal')
  const [compareIds, setCompareIds] = useState([])
  const [mode, setMode] = useState('explore')

  const {
    personas: apiPersonas,
    months,
    summary,
    loadingPersonas,
    error,
  } = usePersonasOverview({
    period,
    customRange,
    platform,
    device,
  })

  const personas = useMemo(
    () => apiPersonas.map(mergePersona),
    [apiPersonas]
  )

  useEffect(() => {
    if (!personas.length) return
    if (!personas.some((persona) => persona.id === selected)) {
      setSelected(personas[0].id)
    }
  }, [personas, selected])

  useEffect(() => {
    setCompareIds((current) =>
      current.filter((id) => personas.some((persona) => persona.id === id))
    )
  }, [personas])

  const selectedPersona = personas.find((persona) => persona.id === selected)
  const comparePersonas = personas.filter((persona) => compareIds.includes(persona.id))

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }

      if (current.length >= 3) {
        return current
      }

      return [...current, id]
    })
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Personas Explorer</h2>
            {!loadingPersonas && !error && (
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                {summary.personaCount || personas.length} live personas
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            System-defined, mutually-exclusive customer segments calculated from this project's real activity.
          </p>
        </div>

        <div className="flex w-fit items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
          {['explore', 'compare'].map((item) => {
            const active = mode === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className="rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                style={
                  active
                    ? { background: '#fff', color: '#6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: '#64748B' }
                }
              >
                {item === 'explore' ? 'Explore' : 'Compare'}
              </button>
            )
          })}
        </div>
      </div>

      {loadingPersonas && <LoadingState />}

      {!loadingPersonas && error && (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-800">Unable to load personas</p>
          <p className="mt-1 text-xs text-red-500">{error.message || String(error)}</p>
          <p className="mt-2 text-[11px] text-slate-400">
            Check that a project is selected and that /api/admin/personas/overview is mounted after requireProject.
          </p>
        </div>
      )}

      {!loadingPersonas && !error && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <PersonaList
            personas={personas}
            mode={mode}
            selectedId={selected}
            compareIds={compareIds}
            onSelect={setSelected}
            onToggleCompare={toggleCompare}
          />

          <div className="col-span-1 lg:col-span-2">
            {mode === 'explore' ? (
              <PersonaDetail
                persona={selectedPersona}
                months={months}
                onAdjustThresholds={onNavigateSettings}
              />
            ) : (
              <PersonaCompare
                personas={comparePersonas}
                months={months}
                onRemove={toggleCompare}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
