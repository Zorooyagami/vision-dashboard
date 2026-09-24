import { useState } from 'react'
import { PERSONAS } from '../data/personas'
import PersonaChip from '../components/PersonaChip'
import { useFilters } from '../context/FiltersContext' // adjust path
import { useFunnel } from '../hooks/useFunnel'

const FUNNEL_DATA = {
  'Product Viewed': { web: 100000, app: 52000, combined: 152000 },
  'Add to Cart': { web: 42000, app: 24000, combined: 66000 },
  'Checkout Started': { web: 18000, app: 12000, combined: 30000 },
  'Purchase': { web: 10800, app: 7800, combined: 18600 },
}

const STEPS = ['Product Viewed', 'Add to Cart', 'Checkout Started', 'Purchase']

const PERSONA_FUNNEL = {
  loyal: [100, 65, 42, 28],
  // collector: [100, 58, 38, 24],
  firsttime: [100, 30, 18, 8],
  active: [100, 42, 26, 16],
  guest: [100, 22, 12, 4],
}

// Weighted average for multi-persona selection
function getPersonaFunnel(ids) {
  if (ids.length === 0) return [100, 43, 20, 12]
  const weights = ids.map(id => PERSONAS.find(p => p.id === id)?.pct ?? 20)
  const total = weights.reduce((a, b) => a + b, 0)
  return [0, 1, 2, 3].map(i =>
    Math.round(ids.reduce((sum, id, wi) => sum + PERSONA_FUNNEL[id][i] * weights[wi], 0) / total)
  )
}

// Simple Sankey SVG component
function SankeyDiagram() {
  const W = 560, H = 260

  // Left nodes (session start by platform)
  const leftNodes = [
    { label: 'App Sessions', value: 52000, color: '#8B5CF6', y: 30, h: 90 },
    { label: 'Web Sessions', value: 100000, color: '#6366F1', y: 140, h: 100 },
  ]

  // Right nodes (conversion platform)
  const rightNodes = [
    { label: 'App Purchase', value: 7800, color: '#8B5CF6', y: 20, h: 55 },
    { label: 'Web Purchase', value: 10800, color: '#6366F1', y: 95, h: 75 },
    { label: 'Drop-off', value: 133400, color: '#E2E8F0', y: 188, h: 50 },
  ]

  // Flows: [leftIdx, rightIdx, width, color, label, pct]
  const flows = [
    [0, 0, 18, '#8B5CF6', 'App → App', '69%'],
    [0, 1, 8, '#A78BFA', 'App → Web (cross-device)', '15%'],
    [0, 2, 7, '#E2E8F0', 'App drop-off', '—'],
    [1, 1, 22, '#6366F1', 'Web → Web', '84%'],
    [1, 0, 8, '#818CF8', 'Web → App (cross-device)', '8%'],
    [1, 2, 14, '#E2E8F0', 'Web drop-off', '—'],
  ]

  const nodeW = 18
  const leftX = 48
  const rightX = W - 80

  const leftOffsets = [0, 0]
  const rightOffsets = [0, 0, 0]

  const paths = flows.map(([li, ri, width, color, label, pct]) => {
    const ln = leftNodes[li]
    const rn = rightNodes[ri]

    const srcY = ln.y + leftOffsets[li]
    leftOffsets[li] += width * 2

    const dstY = rn.y + rightOffsets[ri]
    rightOffsets[ri] += width * 2

    const midX = (leftX + nodeW + rightX) / 2
    const d = `M ${leftX + nodeW} ${srcY + width} C ${midX} ${srcY + width} ${midX} ${dstY + width} ${rightX} ${dstY + width} L ${rightX} ${dstY} C ${midX} ${dstY} ${midX} ${srcY} ${leftX + nodeW} ${srcY} Z`

    return { d, color, label, pct, isCross: label.includes('cross') }
  })

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
        {/* Flows */}
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={p.isCross ? 0.9 : 0.55} />
        ))}

        {/* Left nodes */}
        {leftNodes.map((n, i) => (
          <g key={i}>
            <rect x={leftX} y={n.y} width={nodeW} height={n.h} fill={n.color} rx={4} />
            <text x={leftX - 6} y={n.y + n.h / 2 + 4} textAnchor="end" fontSize={10} fill="#475569" fontWeight="600">{n.label}</text>
            <text x={leftX - 6} y={n.y + n.h / 2 + 16} textAnchor="end" fontSize={9} fill="#94A3B8">{n.value.toLocaleString()}</text>
          </g>
        ))}

        {/* Right nodes */}
        {rightNodes.map((n, i) => (
          <g key={i}>
            <rect x={rightX} y={n.y} width={nodeW} height={n.h} fill={n.color} rx={4} />
            <text x={rightX + nodeW + 6} y={n.y + n.h / 2 + 4} fontSize={10} fill="#475569" fontWeight="600">{n.label}</text>
            {n.value < 133400 && (
              <text x={rightX + nodeW + 6} y={n.y + n.h / 2 + 16} fontSize={9} fill="#94A3B8">{n.value.toLocaleString()}</text>
            )}
          </g>
        ))}

        {/* Cross-device callout */}
        <g>
          <rect x={W / 2 - 60} y={H - 38} width={120} height={20} fill="#EEF2FF" rx={6} />
          <text x={W / 2} y={H - 24} textAnchor="middle" fontSize={9} fill="#6366F1" fontWeight="700">4,280 cross-device conversions</text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 flex-wrap">
        {[
          { color: '#8B5CF6', label: 'App-originated' },
          { color: '#6366F1', label: 'Web-originated' },
          { color: '#A78BFA', label: 'App → Web (cross-device)' },
          { color: '#818CF8', label: 'Web → App (cross-device)' },
          { color: '#E2E8F0', label: 'Drop-off' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
            <span className="text-[10px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ConversionPage() {
  const [filterPersona, setFilterPersona] = useState(null)
  const [crossDevice, setCrossDevice] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
const { platform, selectedPersonas, period, customRange } = useFilters()
  const effectivePersonas = filterPersona ? [filterPersona] : selectedPersonas
  const isPersonaFiltered = filterPersona !== null || selectedPersonas.length > 0
  const { data: funnelData, loading, error } = useFunnel({
    period,
    customRange,
    platform,
    selectedPersonas: effectivePersonas,
  })
  // const getFunnelData = () => {
  //   if (isPersonaFiltered) {
  //     const pcts = getPersonaFunnel(effectivePersonas)
  //     const base = FUNNEL_DATA['Product Viewed'][platform]
  //     return STEPS.map((step, i) => ({
  //       step,
  //       value: Math.round(base * pcts[i] / 100),
  //       isRelative: false,
  //     }))
  //   }
  //   return STEPS.map(step => ({
  //     step,
  //     value: FUNNEL_DATA[step][platform],
  //     isRelative: false,
  //   }))
  // }

  const data = funnelData.map(d => ({ step: d.step, value: d.value, isRelative: false }))
  const maxVal = data[0]?.value || 1

  // Step click — filter to "users who reached this step"
  const handleStepClick = (step) => {
    setActiveStep(prev => prev === step ? null : step)
  }

  const activeStepIdx = activeStep ? STEPS.indexOf(activeStep) : -1

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Cross-Platform Funnel</h2>
          <p className="text-xs text-slate-400 mt-0.5">Conversion journey with drop-off analysis</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-semibold text-slate-600">Cross-Device Journeys</span>
          <button
            onClick={() => setCrossDevice(v => !v)}
            className="w-9 h-5 rounded-full transition-colors flex items-center"
            style={{ background: crossDevice ? '#6366F1' : '#CBD5E1' }}
          >
            <span
              className="block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5"
              style={{ transform: crossDevice ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </button>
        </label>
      </div>

      {/* Persona filter bar */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-xs font-semibold text-slate-500 mb-2.5">Filter Funnel by Persona</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterPersona(null)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
            style={{
              borderColor: filterPersona === null ? '#6366F1' : '#E2E8F0',
              background: filterPersona === null ? '#EEF2FF' : 'transparent',
              color: filterPersona === null ? '#6366F1' : '#64748B',
            }}
          >
            All Personas
          </button>
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPersona(prev => prev === p.id ? null : p.id)}
            >
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all"
                style={{
                  background: filterPersona === p.id ? p.lightBg : 'transparent',
                  color: filterPersona === p.id ? p.textColor : '#64748B',
                  borderColor: filterPersona === p.id ? p.color : '#E2E8F0',
                  boxShadow: filterPersona === p.id ? `0 0 0 1px ${p.color}` : 'none',
                }}
              >
                <span style={{ fontSize: '10px' }}>{p.icon}</span>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {crossDevice ? (
        /* Sankey view */
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-900">Cross-Device Journey Map</p>
            <p className="text-xs text-slate-400 mt-0.5">How users move between Web and App before converting · Jul 2026</p>
          </div>
          <SankeyDiagram />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { from: 'App', to: 'Web', count: 4280, pct: '23%', personas: ['loyal', 'collector'] },
              { from: 'Web', to: 'App', count: 2840, pct: '15%', personas: ['active', 'firsttime'] },
            ].map(journey => (
              <div key={`${journey.from}-${journey.to}`} className="rounded-xl border p-4" style={{ background: '#FAFBFF', borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: '#EEF2FF', color: '#6366F1' }}>{journey.from}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: '#F0FDFA', color: '#0F766E' }}>{journey.to}</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{journey.count.toLocaleString()}</p>
                <p className="text-xs text-slate-400">{journey.pct} of total conversions</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {journey.personas.map(id => <PersonaChip key={id} id={id} size="sm" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Funnel view */
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-slate-900">
              {filterPersona
                ? `${PERSONAS.find(p => p.id === filterPersona)?.name} Funnel`
                : selectedPersonas.length > 0
                ? `${selectedPersonas.length} Persona Funnel`
                : `${platform === 'combined' ? 'All Platforms' : platform === 'web' ? 'Web' : 'App'} Funnel`}
            </p>
            {activeStep && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#EEF2FF', color: '#6366F1' }}>
                  Filtered to: {activeStep}
                </span>
                <button onClick={() => setActiveStep(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {data.map((item, i) => {
              const pct = (item.value / maxVal) * 100
              const dropoff = i > 0 ? Math.round(((data[i - 1].value - item.value) / data[i - 1].value) * 100) : 0
              const personaColor = filterPersona ? PERSONAS.find(p => p.id === filterPersona)?.color : '#6366F1'
              const isActive = activeStep === item.step
              const isDimmed = activeStep !== null && !isActive && i > activeStepIdx

              return (
                <div key={item.step}>
                  {i > 0 && (
                    <div className="flex items-center gap-3 py-1 pl-4">
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                        ↓ {dropoff}% drop-off
                      </div>
                      <div className="flex-1 h-px" style={{ background: '#F1F5F9' }} />
                    </div>
                  )}
                  <button
                    className="w-full text-left transition-all"
                    onClick={() => handleStepClick(item.step)}
                    style={{ opacity: isDimmed ? 0.4 : 1 }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-semibold text-slate-700 w-36 shrink-0">{item.step}</span>
                      <span className="text-xs font-bold text-slate-900">{item.value.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">{Math.round(pct)}% of top</span>
                      {isActive && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#6366F1' }}>Selected</span>}
                    </div>
                    <div
                      className="h-10 rounded-lg overflow-hidden transition-all"
                      style={{ background: isActive ? `${personaColor}15` : '#F1F5F9', border: isActive ? `1px solid ${personaColor}40` : '1px solid transparent' }}
                    >
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${personaColor}CC, ${personaColor})`,
                          minWidth: '40px',
                        }}
                      >
                        {pct > 15 && (
                          <span className="text-white text-xs font-bold">{item.value.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {!filterPersona && platform === 'combined' && (
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-slate-500">Web: {FUNNEL_DATA[item.step].web.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-500">App: {FUNNEL_DATA[item.step].app.toLocaleString()}</span>
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {activeStep && (
            <div className="mt-4 p-4 rounded-xl border" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
              <p className="text-xs font-semibold text-indigo-700">
                Showing users who reached <strong>{activeStep}</strong>: {data[activeStepIdx].value.toLocaleString()} users
                ({Math.round((data[activeStepIdx].value / maxVal) * 100)}% of total)
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">Click any step to change selection · click again to deselect</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
