// components/tools/heatmaps/HeatmapViewer.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'

const MAX_CANVAS_PIXELS = 10_000_000

export default function HeatmapViewer({
  events = [],
  type = 'click',
  screenshot,
}) {
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  /*
   * Keep only valid events for the selected heatmap type.
   *
   * IMPORTANT:
   * We do NOT bucket coordinates anymore.
   * Every event keeps its original normalized x/y position.
   */
  const points = useMemo(() => {
    return events
      .filter(
        (event) =>
          event?.event === `heatmap_${type}`
      )
      .map((event) => {
        const x = Number(
          event?.properties?.x
        )

        const y = Number(
          event?.properties?.y
        )

        return {
          x,
          y,

          sessionId:
            event?.sessionId || null,

          userId:
            event?.userId || null,

          timestamp:
            event?.timestamp || null,
        }
      })
      .filter(
        (point) =>
          Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          point.x >= 0 &&
          point.x <= 1 &&
          point.y >= 0 &&
          point.y <= 1
      )
  }, [events, type])

  /*
   * Prevent enormous full-page screenshots
   * from creating massive retina canvases.
   */
  const getCanvasScale =
    useCallback(
      (width, height) => {
        const desiredScale =
          Math.min(
            window.devicePixelRatio || 1,
            2
          )

        const desiredPixels =
          width *
          height *
          desiredScale *
          desiredScale

        if (
          desiredPixels <=
          MAX_CANVAS_PIXELS
        ) {
          return desiredScale
        }

        const safeScale =
          Math.sqrt(
            MAX_CANVAS_PIXELS /
              (width * height)
          )

        return Math.max(
          0.75,
          safeScale
        )
      },
      []
    )

  /*
   * Click-map color.
   *
   * Since we're now drawing actual points rather than grid cells,
   * density naturally builds up where gradients overlap.
   */
  const getPointStyle =
    useCallback(
      () => {
        if (type === 'move') {
          return {
            radiusMultiplier: 0.032,
            minRadius: 14,
            alpha: 0.11,
          }
        }

        return {
          radiusMultiplier: 0.028,
          minRadius: 12,
          alpha: 0.18,
        }
      },
      [type]
    )

  const drawHeatmap =
    useCallback(() => {
      const stage =
        stageRef.current

      const image =
        imageRef.current

      const canvas =
        canvasRef.current

      if (
        !stage ||
        !image ||
        !canvas
      ) {
        return
      }

      if (
        !image.complete ||
        !image.naturalWidth
      ) {
        return
      }

      const width =
        stage.clientWidth

      const height =
        stage.clientHeight

      if (
        width <= 0 ||
        height <= 0
      ) {
        return
      }

      const scale =
        getCanvasScale(
          width,
          height
        )

      canvas.width =
        Math.max(
          1,
          Math.round(
            width * scale
          )
        )

      canvas.height =
        Math.max(
          1,
          Math.round(
            height * scale
          )
        )

      canvas.style.width =
        `${width}px`

      canvas.style.height =
        `${height}px`

      const ctx =
        canvas.getContext('2d')

      if (!ctx) return

      ctx.setTransform(
        scale,
        0,
        0,
        scale,
        0,
        0
      )

      ctx.clearRect(
        0,
        0,
        width,
        height
      )

      if (!points.length) {
        return
      }

      const style =
        getPointStyle()

      const radius =Math.max(10, width * 0.022)
        // Math.max(
        //   style.minRadius,
        //   width *
        //     style.radiusMultiplier
        // )

      ctx.save()

      /*
       * Makes overlapping points naturally appear hotter.
       */
      ctx.globalCompositeOperation =
        'lighter'

      points.forEach(
        (point) => {
          /*
           * THIS is the key accuracy change:
           *
           * Captured normalized coordinates are converted
           * directly to the rendered screenshot dimensions.
           *
           * No 50 × 50 grid.
           * No snapping to cell centres.
           */
          const x =
            point.x * width

          const y =
            point.y * height

          const gradient =
            ctx.createRadialGradient(
              x,
              y,
              0,
              x,
              y,
              radius
            )

          if (type === 'click') {
            /*
             * Start red/orange.
             * Overlapping clicks become increasingly bright.
             */
            gradient.addColorStop(
              0,
              `rgba(239,68,68,${style.alpha})`
            )

            gradient.addColorStop(
              0.25,
              `rgba(249,115,22,${style.alpha * 0.9})`
            )

            gradient.addColorStop(
              0.55,
              `rgba(253,224,71,${style.alpha * 0.5})`
            )

            gradient.addColorStop(
              1,
              'rgba(59,130,246,0)'
            )
          } else {
            /*
             * Movement map is intentionally softer.
             */
            gradient.addColorStop(
              0,
              `rgba(239,68,68,${style.alpha})`
            )

            gradient.addColorStop(
              0.3,
              `rgba(249,115,22,${style.alpha * 0.75})`
            )

            gradient.addColorStop(
              0.65,
              `rgba(34,211,238,${style.alpha * 0.35})`
            )

            gradient.addColorStop(
              1,
              'rgba(59,130,246,0)'
            )
          }

          ctx.fillStyle =
            gradient

          ctx.beginPath()

          ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
          )

          ctx.fill()
        }
      )

      ctx.restore()
    }, [
      points,
      type,
      getCanvasScale,
      getPointStyle,
    ])

  /*
   * Repaint whenever points/type changes.
   */
  useEffect(() => {
    drawHeatmap()
  }, [drawHeatmap])

  /*
   * Repaint if dashboard/sidebar/browser width changes.
   */
  useEffect(() => {
    const stage =
      stageRef.current

    if (!stage) return

    const observer =
      new ResizeObserver(() => {
        requestAnimationFrame(
          drawHeatmap
        )
      })

    observer.observe(stage)

    return () => {
      observer.disconnect()
    }
  }, [drawHeatmap])

  return (
    <div
      ref={stageRef}
      className="relative w-full bg-white"
    >
      {/* PAGE SCREENSHOT */}

      <img
        ref={imageRef}
        src={screenshot}
        alt="Heatmap page"
        draggable={false}
        className="
          block
          h-auto
          w-full
          select-none
        "
        onLoad={() => {
          requestAnimationFrame(
            drawHeatmap
          )
        }}
      />

      {/* HEATMAP */}

      <canvas
        ref={canvasRef}
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
        "
      />

      {/* EVENT COUNT */}

      <div
        className="
          pointer-events-none
          absolute
          right-3
          top-3
          rounded-lg
          border
          bg-white/90
          px-2.5
          py-1.5
          text-[10px]
          font-semibold
          text-slate-600
          shadow-sm
          backdrop-blur-sm
        "
        style={{
          borderColor:
            'rgba(226,232,240,0.9)',
        }}
      >
        {points.length.toLocaleString()}{' '}
        {type === 'click'
          ? 'clicks'
          : 'moves'}
      </div>
    </div>
  )
}