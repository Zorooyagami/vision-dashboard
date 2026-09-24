
// src/components/AreaChart.jsx
import { useState } from 'react'

export default function AreaChart({
  data,
  color = '#6366F1',
  height = 180,
  formatValue,
}) {
  const [tooltip, setTooltip] = useState(null)

  if (!data?.length) return null

  const W = 560
  const H = height
  const padL = 52
  const padR = 12
  const padT = 8
  const padB = 28

  const values = data.map(d => Number(d.value) || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const toX = (i) => {
    if (data.length === 1) return W / 2

    return padL + (i / (data.length - 1)) * (W - padL - padR)
  }

  const toY = (v) =>
    padT + (1 - (v - min) / range) * (H - padT - padB)

  const lineD = data.reduce(
    (acc, d, i) =>
      acc +
      (i === 0
        ? `M${toX(i)},${toY(d.value)}`
        : `L${toX(i)},${toY(d.value)}`),
    ''
  )

  const areaD =
    lineD +
    ` L${toX(data.length - 1)},${H - padB}` +
    ` L${toX(0)},${H - padB} Z`

  const yTicks = 4
  const yStep = range / yTicks

  const fmtY =
    formatValue ??
    ((v) =>
      v >= 1000
        ? `$${Math.round(v / 1000)}K`
        : `$${Math.round(v)}`)

  // Format dates such as:
  // 2026-02-07 -> 7 Feb
  // 2026-07-01 -> 1 Jul
  // Already formatted labels are returned unchanged.
  const formatDateLabel = (value) => {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(date)
  }

  const markerColor = (outcome) =>
    outcome === 'success'
      ? '#10B981'
      : outcome === 'failed'
        ? '#EF4444'
        : '#94A3B8'

  // const handleMouseMove = (e) => {
  //   const rect = e.currentTarget.getBoundingClientRect()

  //   // Convert mouse position to SVG coordinate
  //   const svgX = ((e.clientX - rect.left) / rect.width) * W

  //   // Find closest data point
  //   const rawIndex =
  //     ((svgX - padL) / (W - padL - padR)) * (data.length - 1)

  //   const index = Math.max(
  //     0,
  //     Math.min(data.length - 1, Math.round(rawIndex))
  //   )

  //   const point = data[index]

  //   if (!point) return

  //   const pointX = toX(index)
  //   const pointY = toY(point.value)

  //   // Convert SVG coordinates back to rendered pixel coordinates
  //   const tooltipX = (pointX / W) * rect.width
  //   const tooltipY = (pointY / H) * rect.height

  //   setTooltip({
  //     index,
  //     x: tooltipX,
  //     y: tooltipY,
  //     label: point.label,
  //     formattedLabel: formatDateLabel(point.label),
  //     value: fmtY(point.value),
  //     markerText: point.marker?.text,
  //   })
  // }
  const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()

  // Mouse position in actual rendered SVG pixels
  const mouseX = e.clientX - rect.left

  // Convert rendered pixels -> SVG viewBox coordinates
  const svgX = (mouseX / rect.width) * W

  // Plot area only
  const plotWidth = W - padL - padR

  // Clamp mouse position to plot area
  const clampedX = Math.max(
    padL,
    Math.min(W - padR, svgX)
  )

  // Find nearest data point
  const ratio = (clampedX - padL) / plotWidth
  const index = Math.round(ratio * (data.length - 1))

  const point = data[index]

  if (!point) return

  const pointX = toX(index)
  const pointY = toY(point.value)

  // Convert SVG coordinates -> rendered pixels
  const tooltipX = (pointX / W) * rect.width
  const tooltipY = (pointY / H) * rect.height

  setTooltip({
    index,
    x: tooltipX,
    y: tooltipY,
    label: point.label,
    formattedLabel: formatDateLabel(point.label),
    value: fmtY(point.value),
    markerText: point.marker?.text,
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
        style={{
          cursor: 'crosshair',
          display: 'block',
        }}
      >
        <defs>
          <linearGradient
            id="revenue-area-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.18"
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Y Axis */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = min + yStep * i
          const y = toY(v)

          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth={1}
              />

              <text
                x={padL - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#94A3B8"
              >
                {fmtY(v)}
              </text>
            </g>
          )
        })}

        {/* X Axis */}
        {data.map((d, i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#94A3B8"
          >
            {formatDateLabel(d.label)}
          </text>
        ))}

        {/* Area */}
        <path
          d={areaD}
          fill="url(#revenue-area-gradient)"
        />

        {/* Revenue line */}
        <path
          d={lineD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover crosshair */}
        {tooltip && (
          <line
            x1={toX(tooltip.index)}
            y1={padT}
            x2={toX(tooltip.index)}
            y2={H - padB}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          const isHovered = tooltip?.index === i

          if (d.marker) {
            return (
              <g key={`marker-${i}`}>
                <circle
                  cx={toX(i)}
                  cy={toY(d.value)}
                  r={isHovered ? 7 : 6}
                  fill={markerColor(d.marker.outcome)}
                  stroke="white"
                  strokeWidth={1.5}
                />

                <text
                  x={toX(i)}
                  y={toY(d.value) - 2}
                  textAnchor="middle"
                  fontSize={8}
                  fill="white"
                  fontWeight="bold"
                >
                  ●
                </text>
              </g>
            )
          }

          return (
            <circle
              key={`dot-${i}`}
              cx={toX(i)}
              cy={toY(d.value)}
              r={isHovered ? 5 : 2.5}
              fill={color}
              opacity={isHovered ? 1 : 0.5}
            />
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-xl z-10"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 20,
            transform:
              tooltip.x > 300
                ? 'translateX(-110%)'
                : 'none',
          }}
        >
          <p className="font-semibold text-slate-300 text-[10px]">
            {tooltip.formattedLabel}
          </p>

          <p
            className="font-bold"
            style={{ color }}
          >
            {tooltip.value}
          </p>

          {tooltip.markerText && (
            <p className="text-[10px] text-emerald-400 mt-0.5">
              ↑ {tooltip.markerText}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
