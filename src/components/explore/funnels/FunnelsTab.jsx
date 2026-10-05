import { useState } from 'react'
import { useFilters } from '../../../context/FiltersContext'
// Use whatever useUsers uses to get the active project. Adjust this import to match.
import { useProject } from '../../../context/ProjectContext'
import { useFunnels, useTrackedEvents } from '../../../hooks/useFunnels'
// import { fmtRelativeTime } from '../exploreUtils'
import FunnelViz from './FunnelViz'
import FunnelBuilderModal from './FunnelBuilderModal'

const fmtConversion = (value) => (value == null ? '—' : `${value}%`)

function FunnelsTab() {
  const { platform, period, customRange, device } = useFilters()
  const { projectId } = useProject()

  // Personas don't apply to funnels, so they're left out and won't trigger a refetch.
  const filters = { period, customRange, platform, device }

  const { funnels, loading, error, create, update, remove, duplicate } = useFunnels(projectId, filters)
  const { events } = useTrackedEvents(projectId)

  const [builder, setBuilder] = useState(null) // null | { funnel: existing | null }
  const [openId, setOpenId] = useState(null)

  // Derived from the list so the detail panel stays fresh after edits or filter changes.
  const openFunnel = funnels.find((f) => f.id === openId) || null

  async function handleDelete() {
    if (!window.confirm(`Delete "${openFunnel.name}"? This can't be undone.`)) return
    if (await remove(openFunnel.id)) setOpenId(null)
  }

  async function handleDuplicate() {
    const copy = await duplicate(openFunnel.id)
    if (copy) setOpenId(copy.id)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Saved Funnels</h3>
          <p className="text-xs text-slate-400 mt-0.5">Custom funnels built from your tracked events</p>
        </div>
        <button
          onClick={() => setBuilder({ funnel: null })}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ background: '#6366F1' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create funnel
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {loading && <p className="text-xs text-slate-400 py-8 text-center">Loading funnels...</p>}

      {!loading && funnels.length === 0 && !error && (
        <p className="text-xs text-slate-400 py-8 text-center">No funnels yet. Create one to see where users drop off.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {funnels.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl p-5 cursor-pointer hover:ring-2 transition-all"
            style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}
            onClick={() => setOpenId(f.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{f.steps.length} steps · edited {(f.updatedAt)}</p>
              </div>
              <span className="text-lg font-black" style={{ color: '#6366F1' }}>{fmtConversion(f.conversion)}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {f.steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg" style={{ background: '#EEF2FF', color: '#4338CA' }}>{s}</span>
                  {i < f.steps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel detail */}
      {openFunnel && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-slate-900">{openFunnel.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Overall conversion: <strong style={{ color: '#6366F1' }}>{fmtConversion(openFunnel.conversion)}</strong>
                {' · '}within {openFunnel.conversionWindowDays} day{openFunnel.conversionWindowDays !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDuplicate} className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Duplicate</button>
              <button onClick={() => setBuilder({ funnel: openFunnel })} className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Edit</button>
              <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-red-50 transition-colors" style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}>Delete</button>
              <button onClick={() => setOpenId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 ml-2 transition-colors">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          {openFunnel.counts ? (
            <FunnelViz steps={openFunnel.steps} data={openFunnel.counts} />
          ) : (
            <p className="text-xs py-6 text-center" style={{ color: '#B91C1C' }}>Couldn't calculate results for this funnel. Try again shortly.</p>
          )}
        </div>
      )}

      {builder && (
        <FunnelBuilderModal
          projectId={projectId}
          filters={filters}
          events={events}
          initial={builder.funnel || undefined}
          onClose={() => setBuilder(null)}
          onSave={(payload) => (builder.funnel ? update(builder.funnel.id, payload) : create(payload))}
        />
      )}
    </div>
  )
}

export default FunnelsTab
