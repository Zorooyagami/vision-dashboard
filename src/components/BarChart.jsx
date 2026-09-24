import { useState } from 'react'




export default function BarChart({
  data,
  color = '#6366F1',
  beforeColor = '#CBD5E1',
  afterColor = '#6366F1',
  height = 160,
  formatValue,
  stacked = false,
  stackedSeries = [],
  stackedData = {},
}) {
  const [tooltip, setTooltip] = useState(null)

  const W = 540, H = height
  const padL = 48, padR = 12, padT = 8, padB = 24
  const fmtV = formatValue ?? ((v) => `${v}`)

  if (stacked && stackedSeries.length && Object.keys(stackedData).length) {
    const labels = Object.keys(stackedData)
    const totals = labels.map(l => stackedSeries.reduce((s, sr) => s + (stackedData[l][sr.key] || 0), 0))
    const maxTotal = Math.max(...totals) * 1.1
    const barW = Math.min(36, ((W - padL - padR) / labels.length) * 0.55)
    const gap = (W - padL - padR) / labels.length

    return (
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          onMouseLeave={() => setTooltip(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padT + (1 - pct) * (H - padT - padB)
            const v = Math.round(maxTotal * pct)
            return (
              <g key={pct}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth={1} />
                <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94A3B8">
                  {v >= 1000 ? `$${v / 1000}K` : `$${v}`}
                </text>
              </g>
            )
          })}
          {labels.map((label, gi) => {
            const cx = padL + gi * gap + gap / 2
            let yBase = H - padB
            return (
              <g key={label}>
                {stackedSeries.map((sr, si) => {
                  const val = stackedData[label][sr.key] || 0
                  const barH = (val / maxTotal) * (H - padT - padB)
                  const y = yBase - barH
                  const isTop = si === stackedSeries.length - 1
                  yBase = y
                  return (
                    <rect
                      key={sr.key}
                      x={cx - barW / 2} y={y} width={barW} height={barH}
                      fill={sr.color} rx={isTop ? 3 : 0}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.closest('svg').getBoundingClientRect()
                        const svgRect = e.currentTarget.getBBox()
                        setTooltip({
                          x: ((cx) / W) * rect.width,
                          y: (y / H) * rect.height,
                          content: `${sr.name}: $${val}K`,
                        })
                      }}
                    />
                  )
                })}
                <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">{label}</text>
              </g>
            )
          })}
        </svg>
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-xl z-10"
            style={{ left: tooltip.x + 8, top: tooltip.y - 10, transform: tooltip.x > 280 ? 'translateX(-110%)' : 'none' }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    )
  }

  const hasBefore = data.some(d => d.before !== undefined)
  const allVals = data.flatMap(d => [d.value, d.before, d.after].filter(v => v !== undefined))
  const maxVal = (Math.max(...allVals) * 1.1) || 1
  const groupW = (W - padL - padR) / data.length
  const barW = hasBefore ? Math.min(20, groupW * 0.3) : Math.min(32, groupW * 0.55)

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        onMouseLeave={() => setTooltip(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padT + (1 - pct) * (H - padT - padB)
          return (
            <g key={pct}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth={1} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94A3B8">
                {fmtV(maxVal * pct)}
              </text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const cx = padL + i * groupW + groupW / 2
          if (hasBefore) {
            const bH = ((d.before ?? 0) / maxVal) * (H - padT - padB)
            const aH = ((d.after ?? 0) / maxVal) * (H - padT - padB)
            return (
              <g key={i}>
                <rect
                  x={cx - barW - 1} y={H - padB - bH} width={barW} height={bH}
                  fill={beforeColor} rx={2} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setTooltip({ x: (cx / W) * 540, y: (H - padB - bH) / H * height, content: `Before: ${fmtV(d.before ?? 0)}` })}
                />
                <rect
                  x={cx + 1} y={H - padB - aH} width={barW} height={aH}
                  fill={afterColor} rx={2} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setTooltip({ x: (cx / W) * 540, y: (H - padB - aH) / H * height, content: `After: ${fmtV(d.after ?? 0)}` })}
                />
                <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">{d.label}</text>
              </g>
            )
          }
          const vH = ((d.value ?? 0) / maxVal) * (H - padT - padB)
          return (
            <g key={i}>
              <rect
                x={cx - barW / 2} y={H - padB - vH} width={barW} height={vH}
                fill={color} rx={2} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: (cx / W) * 540, y: (H - padB - vH) / H * height, content: `${d.label}: ${fmtV(d.value ?? 0)}` })}
              />
              <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-xl z-10"
          style={{ left: tooltip.x + 8, top: Math.max(4, tooltip.y - 10), transform: tooltip.x > 280 ? 'translateX(-110%)' : 'none' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
