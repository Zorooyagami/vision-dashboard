

export default function DonutChart({ data, size = 140, thickness = 28 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = size / 2
  const cy = size / 2
  const r = (size - thickness) / 2

  let cumAngle = -Math.PI / 2

  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI
    const startAngle = cumAngle
    const endAngle = cumAngle + angle
    cumAngle = endAngle

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
    ].join(' ')

    return { ...d, pathD, angle }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path
          key={i}
          d={s.pathD}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness - 2}
          strokeLinecap="butt"
        />
      ))}
      {/* Gap rings */}
      {slices.map((s, i) => {
        const gapAngle = -Math.PI / 2 + slices.slice(0, i).reduce((a, sl) => a + sl.angle, 0)
        const gx = cx + r * Math.cos(gapAngle)
        const gy = cy + r * Math.sin(gapAngle)
        return <circle key={`g${i}`} cx={gx} cy={gy} r={1.5} fill="white" />
      })}
    </svg>
  )
}
