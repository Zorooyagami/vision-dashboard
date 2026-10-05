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

const NODE_W = 130
const NODE_H = 52

const SVG_W = 860
const SVG_H = 700

const NODE_LAYOUT = {
  PLP: {
    x: 55,
    y: 195,
  },

  PDP: {
    x: 285,
    y: 40,
  },

  'Add to Cart': {
    x: 285,
    y: 335,
  },

  Cart: {
    x: 570,
    y: 195,
  },

  Checkout: {
    x: 570,
    y: 335,
  },

  Shipping: {
    x: 570,
    y: 475,
  },

  Purchase: {
    x: 570,
    y: 615,
  },
}

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

    return Math.max(1.2, ratio * 8)
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
          C ${sx + 60} ${sy - 5},
            ${tx - 55} ${ty + 18},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 - 10,
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
          C ${sx - 30} ${sy + 65},
            ${tx - 30} ${ty - 65},
            ${tx} ${ty}
        `,
        labelX: sx - 42,
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
          C ${sx + 100} ${sy},
            ${tx - 95} ${ty - 55},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 - 24,
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
          C ${sx + 60} ${sy + 18},
            ${tx - 60} ${ty - 18},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 + 16,
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

      const routeY = 165

      return {
        d: `
          M ${sx} ${sy}
          C ${sx + 90} ${routeY},
            ${tx - 90} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY - 8,
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
          C ${sx + 90} ${sy},
            ${tx - 90} ${ty + 45},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: (sy + ty) / 2 + 22,
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
          C ${sx} ${sy + 45},
            ${tx} ${ty - 45},
            ${tx} ${ty}
        `,
        labelX: sx + 40,
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
          C ${sx} ${sy + 40},
            ${tx} ${ty - 40},
            ${tx} ${ty}
        `,
        labelX: sx + 40,
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
          C ${sx} ${sy + 40},
            ${tx} ${ty - 40},
            ${tx} ${ty}
        `,
        labelX: sx + 40,
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

      const outerX = sx + 60

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

      const routeY = 300

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 70} ${routeY},
            ${tx + 70} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY + 16,
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

      const outerX = 22
      const upperY = 24

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${upperY},
            ${outerX} ${ty - 40},
            ${tx} ${ty}
        `,
        labelX: 75,
        labelY: 65,
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

      const routeY = 300

      return {
        d: `
          M ${sx} ${sy}
          C ${sx} ${routeY},
            ${tx} ${routeY},
            ${tx} ${ty}
        `,
        labelX: (sx + tx) / 2,
        labelY: routeY + 16,
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

      const outerX = 18
      const bottomY = 408

      return {
        d: `
          M ${sx} ${sy}
          C ${outerX} ${bottomY},
            ${outerX} ${ty + 80},
            ${tx} ${ty}
        `,
        labelX: 50,
        labelY: 365,
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

      const outerX = 15
      const bottomY = 660

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 150} ${bottomY},
            ${outerX} ${bottomY},
            ${outerX} ${ty + 100}
          C ${outerX} ${ty + 50},
            ${tx - 60} ${ty},
            ${tx} ${ty}
        `,
        labelX: 155,
        labelY: 655,
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

      const outerX = 225
      const bottomY = 645

      return {
        d: `
          M ${sx} ${sy}
          C ${sx - 115} ${bottomY},
            ${outerX} ${bottomY},
            ${outerX} ${ty + 100}
          C ${outerX} ${ty + 45},
            ${tx - 25} ${ty},
            ${tx} ${ty}
        `,
        labelX: 300,
        labelY: 632,
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
      12,
      Math.min(source.y, target.y) -
        38 -
        distance * 10
    )

    return {
      d: `
        M ${sx} ${sy}
        C ${sx} ${curveY},
          ${tx} ${curveY},
          ${tx} ${ty}
      `,
      labelX: (sx + tx) / 2,
      labelY: curveY - 6,
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
        x: 90,
        y: 300,
      },

      PDP: {
        x: 460,
        y: 95,
      },

      'Add to Cart': {
        x: 350,
        y: 440,
      },

      Cart: {
        x: 780,
        y: 265,
      },

      Checkout: {
        x: 780,
        y: 400,
      },

      Shipping: {
        x: 780,
        y: 535,
      },

      Purchase: {
        x: 780,
        y: 665,
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
                : '#C7D2DB'
          }
          strokeWidth={
            isHovered
              ? strokeWidth + 1.5
              : strokeWidth
          }
          strokeOpacity={
            isHovered
              ? 1
              : isBackward
                ? 0.5
                : 0.55
          }
          strokeDasharray={
            isBackward
              ? '6 5'
              : undefined
          }
          strokeLinecap="round"
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
              x={path.labelX - 62}
              y={path.labelY - 22}
              width="124"
              height="28"
              rx="8"
              fill="#0F172A"
              opacity="0.96"
            />

            <path
              d={`M ${path.labelX - 5} ${path.labelY + 6}
                  L ${path.labelX} ${path.labelY + 11}
                  L ${path.labelX + 5} ${path.labelY + 6} Z`}
              fill="#0F172A"
              opacity="0.96"
            />

            <text
              x={path.labelX}
              y={path.labelY - 3}
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
              : '#C7D2DB'
          }
          strokeWidth={
            isHovered
              ? strokeWidth + 1
              : strokeWidth
          }
          strokeOpacity={
            isHovered ? 0.85 : 0.45
          }
          strokeLinecap="round"
          pointerEvents="none"
        />

        {/* Exit endpoint */}

        <circle
          cx={path.exitX}
          cy={path.exitY}
          r="5"
          fill="#94A3B8"
        />

        <text
          x={path.exitX}
          y={path.exitY + 18}
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
              y={path.labelY - 22}
              width="136"
              height="28"
              rx="8"
              fill="#0F172A"
              opacity="0.96"
            />

            <path
              d={`M ${path.labelX - 5} ${path.labelY + 6}
                  L ${path.labelX} ${path.labelY + 11}
                  L ${path.labelX + 5} ${path.labelY + 6} Z`}
              fill="#0F172A"
              opacity="0.96"
            />

            <text
              x={path.labelX}
              y={path.labelY - 3}
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

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
        className="bg-white rounded-2xl p-4 sm:p-5"
        style={{
          boxShadow:
            '0 1px 3px rgba(15,23,42,0.06)',
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">

          {/* Title */}

          <div className="min-w-0">

            <p className="text-sm font-bold text-slate-900">
              Customer Journey Flow
            </p>

            <p className="text-xs text-slate-400 mt-0.5 truncate">

              {totalSessions.toLocaleString()}{' '}
              total sessions

              <span className="mx-1.5">
                ·
              </span>

              {trackingMode === 'forward' &&
                'Forward & drop-offs'}

              {trackingMode === 'backward' &&
                'Backtracking only'}

              {trackingMode === 'all' &&
                'All transitions'}

            </p>

          </div>

          {/* Controls */}

          <div className="flex items-center gap-3 flex-wrap">

            {/* =============================================
                TRACKING MODE TOGGLE
            ============================================= */}

            <div
              className="flex items-center rounded-lg border p-0.5"
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
                      px-2.5
                      py-1
                      rounded-md
                      text-[11px]
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
                        ? '0 1px 2px rgba(15,23,42,0.10)'
                        : 'none',
                    }}
                  >
                    {mode.label}
                  </button>
                )
              })}

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
            <div
              className="w-full rounded-xl overflow-hidden"
              style={{
                background:
                  'radial-gradient(circle at 1px 1px, #E2E8F0 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            >

              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'calc(100vh - 280px)',
                  display: 'block',
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
                      <g
                        key={name}
                        style={{
                          cursor: 'default',
                        }}
                      >

                        {/* Shadow */}

                        <rect
                          x={pos.x + 1.5}
                          y={pos.y + 2.5}
                          width={NODE_W}
                          height={NODE_H}
                          rx="10"
                          fill="#0F172A"
                          opacity="0.06"
                        />

                        {/* Card */}

                        <rect
                          x={pos.x}
                          y={pos.y}
                          width={NODE_W}
                          height={NODE_H}
                          rx="10"
                          fill="#FFFFFF"
                          stroke={color}
                          strokeWidth="1.5"
                        />

                        {/* Accent stripe */}

                        <rect
                          x={pos.x}
                          y={pos.y + 8}
                          width="3.5"
                          height={NODE_H - 16}
                          rx="2"
                          fill={color}
                        />

                        {/* Name */}

                        <text
                          x={pos.x + NODE_W / 2 + 2}
                          y={pos.y + 22}
                          textAnchor="middle"
                          fontSize="10.5"
                          fontWeight="700"
                          fill={color}
                          letterSpacing="0.2"
                        >
                          {name}
                        </text>

                        {/* Session count */}

                        <text
                          x={pos.x + NODE_W / 2 + 2}
                          y={pos.y + 40}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="800"
                          fill="#1E293B"
                        >
                          {fmtVol(count)}
                        </text>

                      </g>
                    )
                  }
                )}

              </svg>

            </div>
          )}

        {/* =================================================
            LEGEND (inside card)
        ================================================= */}

        <div
          className="mt-4 pt-3 border-t flex items-center gap-5 flex-wrap"
          style={{
            borderColor: '#F1F5F9',
          }}
        >

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
                className="w-2 h-2 rounded-sm shrink-0"
                style={{
                  background: item.color,
                }}
              />

              <span className="text-[11px] text-slate-500">
                {item.label}
              </span>

            </div>
          ))}

          {/* Only show backtracking legend when relevant */}

          {(trackingMode === 'backward' ||
            trackingMode === 'all') && (
            <div className="flex items-center gap-2 ml-auto">

              <span
                className="w-6 border-t border-dashed"
                style={{
                  borderColor: '#94A3B8',
                }}
              />

              <span className="text-[11px] text-slate-500">
                Backtracking
              </span>

            </div>
          )}

          <div className="text-[10px] text-slate-400 ml-auto">
            Line thickness = traffic · Hover for details
          </div>

        </div>

      </div>

    </div>
  )
}

export default JourneysTab