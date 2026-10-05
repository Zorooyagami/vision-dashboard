import { useCallback, useEffect, useMemo, useRef } from 'react'

const MAX_CANVAS_PIXELS = 10_000_000

const COLOR_STOPS = [
  [0, [59, 130, 246]],
  [0.2, [34, 211, 238]],
  [0.4, [74, 222, 128]],
  [0.6, [253, 224, 71]],
  [0.8, [249, 115, 22]],
  [1, [239, 68, 68]],
]

function heatColor(value) {
  const t = Math.max(0, Math.min(1, value))

  for (let i = 0; i < COLOR_STOPS.length - 1; i += 1) {
    const [fromAt, fromColor] = COLOR_STOPS[i]
    const [toAt, toColor] = COLOR_STOPS[i + 1]

    if (t >= fromAt && t <= toAt) {
      const progress = (t - fromAt) / (toAt - fromAt)
      return fromColor.map((channel, index) =>
        Math.round(channel + (toColor[index] - channel) * progress),
      )
    }
  }

  return COLOR_STOPS[COLOR_STOPS.length - 1][1]
}

export default function HeatmapViewer({
  events = [],
  type = 'click',
  screenshot,
}) {
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  // Preserve the SDK's exact normalized coordinates. Invalid legacy events are
  // ignored rather than clamped to an incorrect edge of the screenshot.
  const points = useMemo(
    () =>
      events
        .filter((event) => event?.event === `heatmap_${type}`)
        .map((event) => ({
          x: Number(event?.properties?.x),
          y: Number(event?.properties?.y),
        }))
        .filter(
          ({ x, y }) =>
            Number.isFinite(x) &&
            Number.isFinite(y) &&
            x >= 0 &&
            x <= 1 &&
            y >= 0 &&
            y <= 1,
        ),
    [events, type],
  )

  const getCanvasScale = useCallback((width, height) => {
    const desiredScale = Math.min(window.devicePixelRatio || 1, 2)
    const desiredPixels = width * height * desiredScale * desiredScale

    if (desiredPixels <= MAX_CANVAS_PIXELS) return desiredScale

    return Math.max(
      0.75,
      Math.sqrt(MAX_CANVAS_PIXELS / (width * height)),
    )
  }, [])

  const drawHeatmap = useCallback(() => {
    const stage = stageRef.current
    const image = imageRef.current
    const canvas = canvasRef.current

    if (!stage || !image || !canvas || !image.complete || !image.naturalWidth) {
      return
    }

    const width = stage.clientWidth
    const height = stage.clientHeight
    if (width <= 0 || height <= 0) return

    const scale = getCanvasScale(width, height)
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.clearRect(0, 0, width, height)

    if (!points.length) return

    /*
     * Cluster only very-nearby rendered points. Unlike the old 50x50 grid,
     * this does not move events to a large cell centre: each cluster is drawn
     * at the average of its real captured coordinates. This keeps positional
     * accuracy while allowing density to control the heat colour.
     */
    const cellSize = type === 'move' ? 22 : 14
    const clusters = new Map()

    points.forEach((point) => {
      const px = point.x * width
      const py = point.y * height
      const key = `${Math.floor(px / cellSize)}:${Math.floor(py / cellSize)}`
      const existing = clusters.get(key)

      if (existing) {
        existing.x += px
        existing.y += py
        existing.count += 1
      } else {
        clusters.set(key, { x: px, y: py, count: 1 })
      }
    })

    const maxCount = Math.max(...Array.from(clusters.values(), (c) => c.count))
    // Avoid turning a single isolated interaction bright red. A cluster must
    // build real density before it reaches the hot end of the scale.
    const densityCeiling = Math.max(maxCount, type === 'move' ? 16 : 6)
    const radius = Math.max(
      type === 'move' ? 18 : 11,
      width * (type === 'move' ? 0.038 : 0.022),
    )

    ctx.save()

    clusters.forEach((cluster) => {
      const x = cluster.x / cluster.count
      const y = cluster.y / cluster.count
      const intensity = Math.min(
        1,
        Math.log1p(cluster.count) / Math.log1p(densityCeiling),
      )
      const [r, g, b] = heatColor(intensity)
      const alpha =
        type === 'move'
          ? 0.14 + intensity * 0.28
          : 0.2 + intensity * 0.42

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
      gradient.addColorStop(0.35, `rgba(${r},${g},${b},${alpha * 0.72})`)
      gradient.addColorStop(0.72, `rgba(${r},${g},${b},${alpha * 0.24})`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()
  }, [points, type, getCanvasScale])

  useEffect(() => {
    drawHeatmap()
  }, [drawHeatmap])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(drawHeatmap)
    })

    observer.observe(stage)
    return () => observer.disconnect()
  }, [drawHeatmap])

  return (
    <div ref={stageRef} className="relative w-full bg-white">
      <img
        ref={imageRef}
        src={screenshot}
        alt="Heatmap page"
        draggable={false}
        className="block h-auto w-full select-none"
        onLoad={() => requestAnimationFrame(drawHeatmap)}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className="pointer-events-none absolute right-3 top-3 rounded-lg border bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm"
        style={{ borderColor: 'rgba(226,232,240,0.9)' }}
      >
        {points.length.toLocaleString()} {type === 'click' ? 'clicks' : 'moves'}
      </div>
    </div>
  )
}
