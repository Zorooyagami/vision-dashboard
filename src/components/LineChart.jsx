import { useState } from 'react'



export default function LineChart({ labels, series, height = 180 }) {
  const [tooltip, setTooltip] = useState(null)

  const W = 500, H = height
  const padL = 40, padR = 12, padT = 8, padB = 24

  const allVals = series.flatMap(s => s.data)
  const min = Math.min(...allVals)
  const max = Math.max(...allVals)
  const range = max - min || 1

  const toX = (i) => padL + (i / (labels.length - 1)) * (W - padL - padR)
  const toY = (v) => padT + (1 - (v - min) / range) * (H - padT - padB)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const rawI = (svgX - padL) / (W - padL - padR) * (labels.length - 1)
    const i = Math.max(0, Math.min(labels.length - 1, Math.round(rawI)))
    setTooltip({
      x: (toX(i) / W) * rect.width,
      y: 20,
      label: labels[i],
      items: series.map(s => ({ name: s.name, color: s.color, value: s.data[i] })),
    })
  }

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ cursor: 'crosshair' }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const v = min + pct * range
          const y = toY(v)
          return (
            <g key={pct}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth={1} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94A3B8">{Math.round(v)}</text>
            </g>
          )
        })}
        {labels.map((l, i) => (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">{l}</text>
        ))}
        {tooltip && (
          <line
            x1={toX(labels.indexOf(tooltip.label))}
            y1={padT}
            x2={toX(labels.indexOf(tooltip.label))}
            y2={H - padB}
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        )}
        {series.map(s => {
          const d = s.data.reduce(
            (acc, v, i) => acc + (i === 0 ? `M${toX(i)},${toY(v)}` : `L${toX(i)},${toY(v)}`), ''
          )
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => {
                const isHovered = tooltip?.label === labels[i]
                return (
                  <circle key={i} cx={toX(i)} cy={toY(v)} r={isHovered ? 4 : 3}
                    fill={s.color} stroke="white" strokeWidth={1.5}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white px-2.5 py-2 rounded-lg text-xs shadow-xl z-10 space-y-1"
          style={{ left: tooltip.x + 10, top: tooltip.y, transform: tooltip.x > 250 ? 'translateX(-110%)' : 'none' }}
        >
          <p className="font-semibold text-slate-300 text-[10px] mb-1">{tooltip.label}</p>
          {tooltip.items.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span>{item.name}: <strong>{item.value}</strong></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
