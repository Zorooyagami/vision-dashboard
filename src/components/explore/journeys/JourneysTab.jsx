// src/components/explore/journeys/JourneysTab.jsx

import { useMemo, useState } from 'react'
import { PERSONAS } from '../../../data/personas'
import { useFilters } from '../../../context/FiltersContext'
import { useJourneyFlow } from '../../../hooks/useJourneyFlow'
import { fmtVol } from '../exploreUtils'

/* =========================================================
   CONFIG
========================================================= */

const NODE_ORDER = [
  'PLP',
  'PDP',
  'Add to Cart',
  'Cart',
  'Checkout',
  'Shipping',
  'Purchase',
]

const NODE_CATEGORY = {
  PLP: 'browsing',
  PDP: 'browsing',
  'Add to Cart': 'cart',
  Cart: 'cart',
  Checkout: 'checkout',
  Shipping: 'checkout',
  Purchase: 'purchase',
  Exit: 'exit',
}

const CATEGORY_COLOR = {
  browsing: '#0D9488',
  cart: '#D97706',
  checkout: '#4338CA',
  purchase: '#6366F1',
  exit: '#94A3B8',
}

const nodeColor = (name) =>
  CATEGORY_COLOR[NODE_CATEGORY[name]] || '#0D9488'

/*
 * Cart is intentionally the convergence point.
 *
 *                  PDP
 *
 * PLP ----------------------------> Cart
 *   \                ↗                |
 *    \ Add to Cart ------------------/
 *                                     |
 *                                  Checkout
 *                                     |
 *                                  Shipping
 *                                     |
 *                                  Purchase
 */

const NODE_LAYOUT = {
  PLP: {
    x: 60,
    y: 220,
  },

  PDP: {
    x: 315,
    y: 55,
  },

  'Add to Cart': {
    x: 315,
    y: 375,
  },

  Cart: {
    x: 610,
    y: 220,
  },

  Checkout: {
    x: 610,
    y: 400,
  },

  Shipping: {
    x: 610,
    y: 565,
  },

  Purchase: {
    x: 610,
    y: 730,
  },
}

const NODE_W = 155
const NODE_H = 60

const SVG_W = 920
const SVG_H = 870

/* =========================================================
   COMPONENT
========================================================= */

function JourneysTab() {
  const {
    platform,
    period,
    customRange,
    selectedPersonas,
  } = useFilters()

  const [personaFilter, setPersonaFilter] = useState(null)
  const [hoveredPath, setHoveredPath] = useState(null)

  /*
   * forward  = normal progression + exits
   * backward = backtracking only
   * all      = everything
   */
  const [trackingMode, setTrackingMode] = useState('forward')

  /* =======================================================
     FILTERS
  ======================================================= */

  const effectivePersonas = personaFilter
    ? [personaFilter]
    : selectedPersonas

  const filters = {
    period,
    customRange,
    platform,
    selectedPersonas: effectivePersonas,
  }

  /* =======================================================
     API DATA
  ======================================================= */

  const {
    nodes: nodeCounts = {},
    edges = [],
    totalSessions = 0,
    loading,
    error,
  } = useJourneyFlow(filters)

  /* =======================================================
     ACTIVE NODES
  ======================================================= */

  const activeNodes = useMemo(
    () =>
      NODE_ORDER.filter(
        (name) => (nodeCounts[name] || 0) > 0
      ),
    [nodeCounts]
  )

  /* =======================================================
     EDGE DIRECTION
  ======================================================= */

  const getEdgeDirection = (edge) => {
    if (edge.to === 'Exit') {
      return 'exit'
    }

    const fromIndex = NODE_ORDER.indexOf(edge.from)
    const toIndex = NODE_ORDER.indexOf(edge.to)

    return toIndex > fromIndex
      ? 'forward'
      : 'backward'
  }

  /* =======================================================
     VALID + FILTERED EDGES
  ======================================================= */

  const validEdges = useMemo(() => {
    return edges.filter((edge) => {
      const hasValidNodes =
        NODE_LAYOUT[edge.from] &&
        (
          edge.to === 'Exit' ||
          NODE_LAYOUT[edge.to]
        )

      if (!hasValidNodes) {
        return false
      }

      const direction = getEdgeDirection(edge)

      /*
       * Forward mode includes exits because exits are
       * drop-offs from the forward journey.
       */
      if (trackingMode === 'forward') {
        return (
          direction === 'forward' ||
          direction === 'exit'
        )
      }

      /*
       * Backward mode is intentionally clean:
       * only actual backwards transitions.
       */
      if (trackingMode === 'backward') {
        return direction === 'backward'
      }

      /*
       * All mode
       */
      return true
    })
  }, [edges, trackingMode])

  /* =======================================================
     TRAFFIC SCALE
  ======================================================= */

  const maxEdgeUsers = useMemo(
    () =>
      Math.max(
        ...validEdges.map((edge) => edge.users || 0),
        1
      ),
    [validEdges]
  )

  const getStrokeWidth = (users) => {
    const ratio =
      Math.sqrt(users || 0) /
      Math.sqrt(maxEdgeUsers)

    return Math.max(1.5, ratio * 11)
  }

  const getPathId = (edge, index) =>
    `${edge.from}-${edge.to}-${index}`

  /* =======================================================
     NODE HELPERS
  ======================================================= */

  const getNodeCenter = (name) => {
    const node = NODE_LAYOUT[name]

    if (!node) return null

    return {
      x: node.x + NODE_W / 2,
      y: node.y + NODE_H / 2,
    }
  }

  /* =======================================================
     FORWARD PATHS
  ======================================================= */

  const getForwardPath = (edge) => {
    const source = NODE_LAYOUT[edge.from]
    const target = NODE_LAYOUT[edge.to]

    if (!source || !target) return null

    const sourceCenter = getNodeCenter(edge.from)
    const targetCenter = getNodeCenter(edge.to)

    /* -----------------------------------------------------
       PLP → PDP
    ----------------------------------------------------- */

    if (
      edge.from === 'PLP' &&
      edge.to === 'PDP'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x
      const ty = targetCenter.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 70} ${sy - 5},
            ${tx - 65} ${ty + 20},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 - 12,
      }
    }

    /* -----------------------------------------------------
       PDP → Add to Cart
    ----------------------------------------------------- */

    if (
      edge.from === 'PDP' &&
      edge.to === 'Add to Cart'
    ) {
      const sx = sourceCenter.x
      const sy = source.y + NODE_H

      const tx = targetCenter.x
      const ty = target.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 35} ${sy + 80},
            ${tx - 35} ${ty - 80},
            ${tx} ${ty}
        `,
        labelX: sx - 48,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       PDP → Cart
    ----------------------------------------------------- */

    if (
      edge.from === 'PDP' &&
      edge.to === 'Cart'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = targetCenter.x
      const ty = target.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 120} ${sy},
            ${tx - 110} ${ty - 65},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 - 28,
      }
    }

    /* -----------------------------------------------------
       PLP → Add to Cart
    ----------------------------------------------------- */

    if (
      edge.from === 'PLP' &&
      edge.to === 'Add to Cart'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x
      const ty = targetCenter.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 70} ${sy + 20},
            ${tx - 70} ${ty - 20},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 + 18,
      }
    }

    /* -----------------------------------------------------
       PLP → Cart

       Direct path bypassing Add to Cart visually.
    ----------------------------------------------------- */

    if (
      edge.from === 'PLP' &&
      edge.to === 'Cart'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x
      const ty = targetCenter.y

      const routeY = 185

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 100} ${routeY},
            ${tx - 100} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY - 10,
      }
    }

    /* -----------------------------------------------------
       Add to Cart → Cart
    ----------------------------------------------------- */

    if (
      edge.from === 'Add to Cart' &&
      edge.to === 'Cart'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x
      const ty = targetCenter.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 100} ${sy},
            ${tx - 100} ${ty + 55},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 + 25,
      }
    }

    /* -----------------------------------------------------
       Cart → Checkout
    ----------------------------------------------------- */

    if (
      edge.from === 'Cart' &&
      edge.to === 'Checkout'
    ) {
      const sx = sourceCenter.x
      const sy = source.y + NODE_H

      const tx = targetCenter.x
      const ty = target.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx} ${sy + 55},
            ${tx} ${ty - 55},
            ${tx} ${ty}
        `,
        labelX: sx + 45,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       Checkout → Shipping
    ----------------------------------------------------- */

    if (
      edge.from === 'Checkout' &&
      edge.to === 'Shipping'
    ) {
      const sx = sourceCenter.x
      const sy = source.y + NODE_H

      const tx = targetCenter.x
      const ty = target.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx} ${sy + 50},
            ${tx} ${ty - 50},
            ${tx} ${ty}
        `,
        labelX: sx + 45,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       Shipping → Purchase
    ----------------------------------------------------- */

    if (
      edge.from === 'Shipping' &&
      edge.to === 'Purchase'
    ) {
      const sx = sourceCenter.x
      const sy = source.y + NODE_H

      const tx = targetCenter.x
      const ty = target.y

      return {
        d: `
          M ${sx} ${sy}
          C ${sx} ${sy + 50},
            ${tx} ${ty - 50},
            ${tx} ${ty}
        `,
        labelX: sx + 45,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       Generic forward
    ----------------------------------------------------- */

    const sx =
      sourceCenter.x <= targetCenter.x
        ? source.x + NODE_W
        : sourceCenter.x

    const sy =
      sourceCenter.x <= targetCenter.x
        ? sourceCenter.y
        : source.y + NODE_H

    const tx =
      sourceCenter.x <= targetCenter.x
        ? target.x
        : targetCenter.x

    const ty =
      sourceCenter.x <= targetCenter.x
        ? targetCenter.y
        : target.y

    const cx = (sx + tx) / 2

    return {
      d: `
        M ${sx} ${sy}
        C ${cx} ${sy},
          ${cx} ${ty},
          ${tx} ${ty}
      `,
      labelX: cx,
      labelY: (sy + ty) / 2 - 10,
    }
  }

  /* =======================================================
     BACKTRACKING PATHS
  ======================================================= */

  const getBackwardPath = (edge) => {
    const source = NODE_LAYOUT[edge.from]
    const target = NODE_LAYOUT[edge.to]

    if (!source || !target) return null

    const sourceCenter = getNodeCenter(edge.from)
    const targetCenter = getNodeCenter(edge.to)

    /* -----------------------------------------------------
       Add to Cart → PDP
    ----------------------------------------------------- */

    if (
      edge.from === 'Add to Cart' &&
      edge.to === 'PDP'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x + NODE_W
      const ty = targetCenter.y

      const outerX = sx + 70

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${sy},
            ${outerX} ${ty},
            ${tx} ${ty}
        `,
        labelX: outerX + 10,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       Add to Cart → PLP
    ----------------------------------------------------- */

    if (
      edge.from === 'Add to Cart' &&
      edge.to === 'PLP'
    ) {
      const sx = source.x
      const sy = sourceCenter.y

      const tx = target.x + NODE_W / 2
      const ty = target.y + NODE_H

      const routeY = 335

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 80} ${routeY},
            ${tx + 80} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY + 18,
      }
    }

    /* -----------------------------------------------------
       PDP → PLP
    ----------------------------------------------------- */

    if (
      edge.from === 'PDP' &&
      edge.to === 'PLP'
    ) {
      const sx = source.x
      const sy = sourceCenter.y

      const tx = targetCenter.x
      const ty = target.y

      const outerX = 25
      const upperY = 30

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${upperY},
            ${outerX} ${ty - 45},
            ${tx} ${ty}
        `,
        labelX: 85,
        labelY: 75,
      }
    }

    /* -----------------------------------------------------
       Cart → PLP
    ----------------------------------------------------- */

    if (
      edge.from === 'Cart' &&
      edge.to === 'PLP'
    ) {
      const sx = sourceCenter.x
      const sy = source.y + NODE_H

      const tx = targetCenter.x
      const ty = target.y + NODE_H

      const routeY = 335

      return {
        d: `
          M ${sx} ${sy}
          C ${sx} ${routeY},
            ${tx} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY + 18,
      }
    }

    /* -----------------------------------------------------
       Checkout → Cart
    ----------------------------------------------------- */

    if (
      edge.from === 'Checkout' &&
      edge.to === 'Cart'
    ) {
      const sx = source.x + NODE_W
      const sy = sourceCenter.y

      const tx = target.x + NODE_W
      const ty = targetCenter.y

      const outerX = sx + 85

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${sy},
            ${outerX} ${ty},
            ${tx} ${ty}
        `,
        labelX: outerX + 10,
        labelY: (sy + ty) / 2,
      }
    }

    /* -----------------------------------------------------
       Checkout → PLP
    ----------------------------------------------------- */

    if (
      edge.from === 'Checkout' &&
      edge.to === 'PLP'
    ) {
      const sx = source.x
      const sy = sourceCenter.y

      const tx = targetCenter.x
      const ty = target.y + NODE_H

      const outerX = 20
      const bottomY = 510

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${bottomY},
            ${outerX} ${ty + 100},
            ${tx} ${ty}
        `,
        labelX: 55,
        labelY: 455,
      }
    }

    /* -----------------------------------------------------
       Purchase → PLP
    ----------------------------------------------------- */

    if (
      edge.from === 'Purchase' &&
      edge.to === 'PLP'
    ) {
      const sx = source.x
      const sy = sourceCenter.y

      const tx = targetCenter.x
      const ty = target.y + NODE_H

      const outerX = 18
      const bottomY = 825

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 180} ${bottomY},
            ${outerX} ${bottomY},
            ${outerX} ${ty + 120}
          C ${outerX} ${ty + 60},
            ${tx - 70} ${ty},
            ${tx} ${ty}
        `,
        labelX: 180,
        labelY: 820,
      }
    }

    /* -----------------------------------------------------
       Purchase → PDP
    ----------------------------------------------------- */

    if (
      edge.from === 'Purchase' &&
      edge.to === 'PDP'
    ) {
      const sx = source.x
      const sy = sourceCenter.y

      const tx = targetCenter.x
      const ty = target.y + NODE_H

      const outerX = 265
      const bottomY = 805

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 140} ${bottomY},
            ${outerX} ${bottomY},
            ${outerX} ${ty + 120}
          C ${outerX} ${ty + 50},
            ${tx - 30} ${ty},
            ${tx} ${ty}
        `,
        labelX: 350,
        labelY: 790,
      }
    }

    /* -----------------------------------------------------
       Generic backtracking
    ----------------------------------------------------- */

    const sx = sourceCenter.x
    const sy = source.y

    const tx = targetCenter.x
    const ty = target.y

    const fromIndex =
      NODE_ORDER.indexOf(edge.from)

    const toIndex =
      NODE_ORDER.indexOf(edge.to)

    const distance =
      Math.abs(fromIndex - toIndex)

    const curveY = Math.max(
      15,
      Math.min(source.y, target.y) -
        45 -
        distance * 12
    )

    return {
      d: `
        M ${sx} ${sy}
        C ${sx} ${curveY},
          ${tx} ${curveY},
          ${tx} ${ty}
      `,
      labelX: (sx + tx) / 2,
      labelY: curveY - 7,
    }
  }

  /* =======================================================
     SELECT PATH
  ======================================================= */

  const getJourneyPath = (edge) => {
    const direction =
      getEdgeDirection(edge)

    if (direction === 'forward') {
      const path = getForwardPath(edge)

      return path
        ? {
            ...path,
            type: 'forward',
          }
        : null
    }

    const path = getBackwardPath(edge)

    return path
      ? {
          ...path,
          type: 'backward',
        }
      : null
  }

  /* =======================================================
     EXIT PATHS
  ======================================================= */

  const getExitPath = (edge) => {
    const source = NODE_LAYOUT[edge.from]

    if (!source) return null

    const center = getNodeCenter(edge.from)

    const EXIT_LAYOUT = {
      PLP: {
        x: 100,
        y: 345,
      },

      PDP: {
        x: 525,
        y: 115,
      },

      'Add to Cart': {
        x: 390,
        y: 500,
      },

      Cart: {
        x: 850,
        y: 300,
      },

      Checkout: {
        x: 850,
        y: 470,
      },

      Shipping: {
        x: 850,
        y: 630,
      },

      Purchase: {
        x: 850,
        y: 790,
      },
    }

    const exit = EXIT_LAYOUT[edge.from]

    if (!exit) return null

    let sx
    let sy

    if (
      [
        'PDP',
        'Cart',
        'Checkout',
        'Shipping',
        'Purchase',
      ].includes(edge.from)
    ) {
      sx = source.x + NODE_W
      sy = center.y
    } else {
      sx = center.x
      sy = source.y + NODE_H
    }

    const tx = exit.x
    const ty = exit.y

    const cx = (sx + tx) / 2

    return {
      d: `
        M ${sx} ${sy}
        C ${cx} ${sy},
          ${cx} ${ty},
          ${tx} ${ty}
      `,

      exitX: tx,
      exitY: ty,

      labelX: cx,
      labelY: (sy + ty) / 2 - 8,
    }
  }

  /* =======================================================
     RENDER JOURNEY EDGE
  ======================================================= */

  const renderJourneyEdge = (
    edge,
    index
  ) => {
    const path = getJourneyPath(edge)

    if (!path?.d) return null

    const pathId =
      getPathId(edge, index)

    const isHovered =
      hoveredPath === pathId

    const strokeWidth =
      getStrokeWidth(edge.users)

    const isBackward =
      path.type === 'backward'

    return (
      <g key={pathId}>

        {/* Larger invisible hover target */}

        <path
          d={path.d}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(
            18,
            strokeWidth + 10
          )}
          style={{
            cursor: 'pointer',
          }}
          onMouseEnter={() =>
            setHoveredPath(pathId)
          }
          onMouseLeave={() =>
            setHoveredPath(null)
          }
        />

        {/* Visible path */}

        <path
          d={path.d}
          fill="none"
          stroke={
            isHovered
              ? nodeColor(edge.to)
              : isBackward
                ? '#94A3B8'
                : '#CBD5E1'
          }
          strokeWidth={
            isHovered
              ? strokeWidth + 1.5
              : strokeWidth
          }
          strokeOpacity={
            isHovered
              ? 0.9
              : isBackward
                ? 0.55
                : 0.58
          }
          strokeDasharray={
            isBackward
              ? '6 5'
              : undefined
          }
          pointerEvents="none"
          style={{
            transition:
              'all 0.15s ease',
          }}
        />

        {/* Tooltip */}

        {isHovered && (
          <g pointerEvents="none">

            <rect
              x={path.labelX - 70}
              y={path.labelY - 20}
              width="140"
              height="30"
              rx="7"
              fill="#0F172A"
            />

            <text
              x={path.labelX}
              y={path.labelY}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#FFFFFF"
            >
              {fmtVol(edge.users)} users ·{' '}
              {edge.pct}%
            </text>

          </g>
        )}

      </g>
    )
  }

  /* =======================================================
     RENDER EXIT EDGE
  ======================================================= */

  const renderExitEdge = (
    edge,
    index
  ) => {
    const path = getExitPath(edge)

    if (!path) return null

    const pathId =
      getPathId(edge, index)

    const isHovered =
      hoveredPath === pathId

    const strokeWidth =
      getStrokeWidth(edge.users)

    return (
      <g key={pathId}>

        {/* Hover target */}

        <path
          d={path.d}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(
            18,
            strokeWidth + 10
          )}
          style={{
            cursor: 'pointer',
          }}
          onMouseEnter={() =>
            setHoveredPath(pathId)
          }
          onMouseLeave={() =>
            setHoveredPath(null)
          }
        />

        {/* Visible path */}

        <path
          d={path.d}
          fill="none"
          stroke={
            isHovered
              ? '#64748B'
              : '#CBD5E1'
          }
          strokeWidth={
            isHovered
              ? strokeWidth + 1
              : strokeWidth
          }
          strokeOpacity={
            isHovered ? 0.85 : 0.45
          }
          pointerEvents="none"
        />

        {/* Exit endpoint */}

        <circle
          cx={path.exitX}
          cy={path.exitY}
          r="6"
          fill="#94A3B8"
        />

        <text
          x={path.exitX}
          y={path.exitY + 20}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#94A3B8"
        >
          Exit
        </text>

        {/* Tooltip */}

        {isHovered && (
          <g pointerEvents="none">

            <rect
              x={path.labelX - 68}
              y={path.labelY - 20}
              width="136"
              height="30"
              rx="7"
              fill="#0F172A"
            />

            <text
              x={path.labelX}
              y={path.labelY}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#FFFFFF"
            >
              {fmtVol(edge.users)} exits ·{' '}
              {edge.pct}%
            </text>

          </g>
        )}

      </g>
    )
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">

      {/* ==================================================
          PERSONA FILTER
      ================================================== */}

      <div className="flex items-center gap-3 flex-wrap">

        <span className="text-xs font-semibold text-slate-500">
          Persona
        </span>

        <div
          className="flex rounded-xl border overflow-hidden"
          style={{
            borderColor: '#E2E8F0',
          }}
        >

          <button
            onClick={() =>
              setPersonaFilter(null)
            }
            className="px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              background:
                personaFilter === null
                  ? '#6366F1'
                  : '#fff',

              color:
                personaFilter === null
                  ? '#fff'
                  : '#475569',
            }}
          >
            All
          </button>

          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setPersonaFilter(
                  (prev) =>
                    prev === p.id
                      ? null
                      : p.id
                )
              }
              className="px-3 py-2 text-xs font-semibold transition-colors"
              style={{
                background:
                  personaFilter === p.id
                    ? p.color
                    : '#fff',

                color:
                  personaFilter === p.id
                    ? '#fff'
                    : '#475569',
              }}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}

        </div>

      </div>

      {/* ==================================================
          GRAPH CARD
      ================================================== */}

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            '0 1px 3px rgba(15,23,42,0.06)',
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between gap-5 mb-5 flex-wrap">

          {/* Title */}

          <div>

            <p className="text-sm font-bold text-slate-900">
              Customer Journey Flow
            </p>

            <p className="text-xs text-slate-400 mt-0.5">

              {totalSessions.toLocaleString()}{' '}
              total sessions

              <span className="mx-1.5">
                ·
              </span>

              {trackingMode === 'forward' &&
                'Forward progression & drop-offs'}

              {trackingMode === 'backward' &&
                'Backtracking behaviour'}

              {trackingMode === 'all' &&
                'All journey transitions'}

            </p>

          </div>

          {/* Controls */}

          <div className="flex items-center gap-4">

            {/* =============================================
                TRACKING MODE TOGGLE
            ============================================= */}

            <div
              className="flex items-center rounded-xl border p-1"
              style={{
                borderColor: '#E2E8F0',
                background: '#F8FAFC',
              }}
            >

              {[
                {
                  id: 'forward',
                  label: 'Forward',
                },
                {
                  id: 'backward',
                  label: 'Backward',
                },
                {
                  id: 'all',
                  label: 'All',
                },
              ].map((mode) => {
                const active =
                  trackingMode === mode.id

                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setTrackingMode(mode.id)
                      setHoveredPath(null)
                    }}
                    className="
                      px-3
                      py-1.5
                      rounded-lg
                      text-xs
                      font-semibold
                      transition-all
                    "
                    style={{
                      background: active
                        ? '#FFFFFF'
                        : 'transparent',

                      color: active
                        ? '#4F46E5'
                        : '#94A3B8',

                      boxShadow: active
                        ? '0 1px 3px rgba(15,23,42,0.10)'
                        : 'none',
                    }}
                  >
                    {mode.label}
                  </button>
                )
              })}

            </div>

            {/* Helper */}

            <div className="text-right">

              <p className="text-xs text-slate-400">
                Line thickness represents traffic
              </p>

              <p className="text-[10px] text-slate-300 mt-0.5">
                Hover a path for details
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="py-16 text-center">
            <p className="text-xs text-slate-400">
              Loading journeys...
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-xs text-red-500">
              Unable to load journeys.
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          validEdges.length === 0 && (
            <div className="py-16 text-center">

              <p className="text-xs text-slate-400">

                {trackingMode === 'backward'
                  ? 'No backtracking behaviour found for this filter.'
                  : 'No journey data for this filter yet.'}

              </p>

            </div>
          )}

        {/* =================================================
            GRAPH
        ================================================= */}

        {!loading &&
          !error &&
          validEdges.length > 0 && (
            <div className="overflow-x-auto">

              <div
                style={{
                  minWidth: SVG_W,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >

                <svg
                  width={SVG_W}
                  height={SVG_H}
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  style={{
                    overflow: 'visible',
                  }}
                >

                  {/* ========================================
                      EDGES FIRST

                      Nodes render after paths so paths
                      visually sit behind the cards.
                  ======================================== */}

                  {validEdges.map(
                    (edge, index) =>
                      edge.to === 'Exit'
                        ? renderExitEdge(
                            edge,
                            index
                          )
                        : renderJourneyEdge(
                            edge,
                            index
                          )
                  )}

                  {/* ========================================
                      NODES
                  ======================================== */}

                  {activeNodes.map(
                    (name) => {
                      const pos =
                        NODE_LAYOUT[name]

                      if (!pos) return null

                      const color =
                        nodeColor(name)

                      const count =
                        nodeCounts[name] || 0

                      return (
                        <g key={name}>

                          {/* Shadow */}

                          <rect
                            x={pos.x + 2}
                            y={pos.y + 3}
                            width={NODE_W}
                            height={NODE_H}
                            rx="11"
                            fill="#0F172A"
                            opacity="0.04"
                          />

                          {/* Card */}

                          <rect
                            x={pos.x}
                            y={pos.y}
                            width={NODE_W}
                            height={NODE_H}
                            rx="11"
                            fill="#FFFFFF"
                            stroke={color}
                            strokeWidth="1.5"
                          />

                          {/* Category stripe */}

                          <rect
                            x={pos.x}
                            y={pos.y}
                            width="5"
                            height={NODE_H}
                            rx="2.5"
                            fill={color}
                          />

                          {/* Name */}

                          <text
                            x={
                              pos.x +
                              NODE_W / 2
                            }
                            y={pos.y + 24}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill={color}
                          >
                            {name}
                          </text>

                          {/* Session count */}

                          <text
                            x={
                              pos.x +
                              NODE_W / 2
                            }
                            y={pos.y + 44}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#334155"
                          >
                            {fmtVol(count)}
                          </text>

                        </g>
                      )
                    }
                  )}

                </svg>

              </div>

            </div>
          )}

      </div>

      {/* ==================================================
          LEGEND
      ================================================== */}

      <div className="flex items-center gap-6 px-1 flex-wrap">

        {[
          {
            label: 'Browsing',
            color: '#0D9488',
          },
          {
            label: 'Cart',
            color: '#D97706',
          },
          {
            label: 'Checkout',
            color: '#4338CA',
          },
          {
            label: 'Purchase',
            color: '#6366F1',
          },
          {
            label: 'Exit',
            color: '#94A3B8',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5"
          >

            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                background: item.color,
              }}
            />

            <span className="text-xs text-slate-500">
              {item.label}
            </span>

          </div>
        ))}

        {/* Only show backtracking legend when relevant */}

        {(trackingMode === 'backward' ||
          trackingMode === 'all') && (
          <div className="flex items-center gap-2 ml-2">

            <span
              className="w-7 border-t border-dashed"
              style={{
                borderColor: '#94A3B8',
              }}
            />

            <span className="text-xs text-slate-500">
              Backtracking
            </span>

          </div>
        )}

      </div>

    </div>
  )
}

export default JourneysTab