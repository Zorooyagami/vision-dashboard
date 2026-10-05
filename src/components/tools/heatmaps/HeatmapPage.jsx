import { useEffect, useMemo, useState } from 'react'
import PersonaChip from '../../PersonaChip'
import HeatmapViewer from './HeatmapViewer'
import { apiFetch } from '../../../services/apiClient'

const API_BASE = '/api/events/heatmaps'

const PAGES = [
  {
    id: 'home',
    label: 'Homepage',
    pageId: 0,
    path: '/',
  },
  {
    id: 'products',
    label: 'Products (PLP)',
    pageId: 1,
    path: '/products',
  },
  {
    id: 'product',
    label: 'Product Detail (PDP)',
    pageId: 2,
    path: '/product',
  }
]

const SCREENSHOTS = {
  home: {
    web: '/heatmap-snapshot/home-desktop.png',
    app: '/heatmap-snapshot/home-mobile.png',
  },

  products: {
    web: '/heatmap-snapshot/products-desktop.png',
  },

  product: {
    web: '/heatmap-snapshot/product-detail-desktop.png',
  },

}



export default function HeatmapPage({
  platform,
  selectedPersonas = [],
}) {
  // Start on PDP because that's the first real screenshot we've added.
  const [page, setPage] = useState('product')
  const [hType, setHType] = useState('click')

  const [hmPlatform, setHmPlatform] = useState(
    platform === 'app' ? 'app' : 'web'
  )
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const currentPage = PAGES.find((item) => item.id === page)

  const personaKey = selectedPersonas
    .slice()
    .sort()
    .join(',')

  // A page/surface is available when a matching snapshot has been configured.
  const screenshot = SCREENSHOTS?.[page]?.[hmPlatform]

  const isSupported = Boolean(screenshot)

  /*
   * Keep local Surface selection in sync with
   * the global platform filter.
   */
  useEffect(() => {
    if (platform === 'app') {
      setHmPlatform('app')
    }

    if (platform === 'web') {
      setHmPlatform('web')
    }
  }, [platform])

  /*
   * Fetch real heatmap events.
   */
  useEffect(() => {
    if (!currentPage || !isSupported) {
      setEvents([])
      setStatus('unsupported')
      setError(null)
      return
    }

    let cancelled = false

    async function loadHeatmap() {
      try {
        setStatus('loading')
        setError(null)

        const params = new URLSearchParams()

        /*
         * Safe to send now.
         *
         * If backend supports these filters,
         * they are automatically applied.
         *
         * If it currently ignores them,
         * nothing breaks.
         */
        params.set('deviceType', 'Desktop')
        params.set('platform', hmPlatform)

        if (personaKey) {
          params.set('personas', personaKey)
        }

        const url =
          `${API_BASE}/${currentPage.pageId}` +
          `?${params.toString()}`

        const data = await apiFetch(url)

        if (cancelled) return

        let result = Array.isArray(data?.events)
          ? data.events
          : []

        /*
         * Temporary defensive filtering.
         *
         * We only have a desktop screenshot right now,
         * so don't mix mobile/tablet coordinates into it.
         *
         * Once filtering happens fully in the backend,
         * this can be removed.
         */
        result = result.filter((event) => {
          const deviceType =
            event?.deviceInfo?.deviceType

          return (
            !deviceType ||
            deviceType === 'Desktop'
          )
        })

        setEvents(result)

        setStatus(
          result.length > 0
            ? 'ready'
            : 'empty'
        )
      } catch (err) {
        console.error(
          '[HeatmapPage] failed to load heatmap:',
          err
        )

        if (!cancelled) {
          setEvents([])
          setStatus('error')
          setError(err.message)
        }
      }
    }

    loadHeatmap()

    return () => {
      cancelled = true
    }
  }, [
    currentPage?.pageId,
    hmPlatform,
    personaKey,
    isSupported,
  ])

  /*
   * Summary data from REAL events.
   */
  const stats = useMemo(() => {
    let clicks = 0
    let moves = 0

    const users = new Set()
    const sessions = new Set()

    events.forEach((event) => {
      if (event.event === 'heatmap_click') {
        clicks += 1
      }

      if (event.event === 'heatmap_move') {
        moves += 1
      }

      if (event.userId) {
        users.add(event.userId)
      }

      if (event.sessionId) {
        sessions.add(event.sessionId)
      }
    })

    return {
      clicks,
      moves,
      uniqueUsers: users.size,
      sessions: sessions.size,
    }
  }, [events])

  const activeEventCount =
    hType === 'click'
      ? stats.clicks
      : stats.moves

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">

      {/* =========================================================
          CONTROLS
      ========================================================= */}

      <div
        className="
          shrink-0
          border-b
          bg-white
          px-3
          sm:px-6
          py-3
          flex
          items-center
          gap-4
          flex-wrap
        "
        style={{
          borderColor: '#F1F5F9',
        }}
      >
        {/* PAGE */}
{hmPlatform}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Page
          </span>

          <select
            value={page}
            onChange={(event) => {
              setPage(event.target.value)
            }}
            className="
              cursor-pointer
              rounded-lg
              border
              px-3
              py-1.5
              text-sm
              font-medium
              text-slate-800
              focus:outline-none
            "
            style={{
              borderColor: '#E2E8F0',
            }}
          >
            {PAGES.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className="h-5 w-px shrink-0"
          style={{
            background: '#E2E8F0',
          }}
        />

        {/* SURFACE */}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Surface
          </span>

          <div
            className="flex overflow-hidden rounded-lg border"
            style={{
              borderColor: '#E2E8F0',
            }}
          >
            {['web'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setHmPlatform(item)
                }
                className="
                  px-3.5
                  py-1.5
                  text-xs
                  font-semibold
                  capitalize
                  transition-colors
                "
                style={{
                  background:
                    hmPlatform === item
                      ? '#6366F1'
                      : '#FFFFFF',

                  color:
                    hmPlatform === item
                      ? '#FFFFFF'
                      : '#475569',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div
          className="h-5 w-px shrink-0"
          style={{
            background: '#E2E8F0',
          }}
        />

        {/* TYPE */}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Type
          </span>

          <div
            className="flex overflow-hidden rounded-lg border"
            style={{
              borderColor: '#E2E8F0',
            }}
          >
            {[
              ['click', 'Click map'],
              ['move', 'Move map'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setHType(value)
                }
                className="
                  px-3.5
                  py-1.5
                  text-xs
                  font-semibold
                  transition-colors
                "
                style={{
                  background:
                    hType === value
                      ? '#6366F1'
                      : '#FFFFFF',

                  color:
                    hType === value
                      ? '#FFFFFF'
                      : '#475569',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PERSONAS */}

        {selectedPersonas.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Filtered:</span>

            {selectedPersonas.map((id) => (
              <PersonaChip
                key={id}
                id={id}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">

        {/* =======================================================
            HEATMAP AREA
        ======================================================= */}

        <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-6">

          <div className="mx-auto max-w-[900px]">

            {/* UNSUPPORTED */}

            {status === 'unsupported' && (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  bg-white
                  px-8
                  py-20
                  text-center
                "
                style={{
                  borderColor: '#E2E8F0',
                }}
              >
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  className="mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.739 4.29 10.274 3.5 12c1.68 3.674 5.306 6 8.5 6 1.002 0 1.976-.172 2.887-.493M9.88 4.62A8.97 8.97 0 0112 4.5c3.194 0 6.82 2.326 8.5 6a10.478 10.478 0 01-1.817 2.765"
                  />
                </svg>

                <p className="text-sm font-bold text-slate-700">
                  Heatmap snapshot not configured
                </p>

                <p className="mt-1 max-w-[340px] text-xs leading-5 text-slate-400">
                  A page snapshot has not been configured for this page and surface yet.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPage('product')
                    setHmPlatform('web')
                  }}
                  className="
                    mt-5
                    rounded-xl
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-white
                    transition-opacity
                    hover:opacity-90
                  "
                  style={{
                    background: '#6366F1',
                  }}
                >
                  View available desktop heatmap
                </button>
              </div>
            )}

            {/* LOADING */}

            {status === 'loading' && (
              <div
                className="
                  flex
                  min-h-[320px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  bg-white
                "
                style={{
                  borderColor: '#E2E8F0',
                }}
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      mb-3
                      h-7
                      w-7
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-200
                      border-t-indigo-500
                    "
                  />

                  <p className="text-sm text-slate-400">
                    Loading heatmap…
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {status === 'error' && (
              <div
                className="
                  rounded-2xl
                  border
                  bg-white
                  px-8
                  py-16
                  text-center
                "
                style={{
                  borderColor: '#E2E8F0',
                }}
              >
                <p className="text-sm font-semibold text-red-500">
                  Failed to load heatmap
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {error ||
                    'Check the network tab and backend logs.'}
                </p>
              </div>
            )}

            {/* EMPTY */}

            {status === 'empty' && (
              <div
                className="
                  rounded-2xl
                  border
                  bg-white
                  px-8
                  py-16
                  text-center
                "
                style={{
                  borderColor: '#E2E8F0',
                }}
              >
                <p className="text-sm font-bold text-slate-700">
                  No heatmap activity found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No desktop heatmap events were found for this page.
                </p>
              </div>
            )}

            {/* READY */}

            {status === 'ready' && (
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                "
                style={{
                  borderColor: '#E2E8F0',
                  boxShadow:
                    '0 2px 12px rgba(15,23,42,0.08)',
                }}
              >

                {/* DEVICE CHROME */}

                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    background: '#1E293B',
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: '#EF4444',
                    }}
                  />

                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: '#F59E0B',
                    }}
                  />

                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: '#10B981',
                    }}
                  />

                  <div
                    className="
                      mx-3
                      flex-1
                      rounded
                      px-3
                      py-0.5
                      font-mono
                      text-[11px]
                      text-slate-400
                    "
                    style={{
                      background: '#0F172A',
                    }}
                  >
                    ecommerce.local{currentPage?.path || '/'}
                  </div>

                  <div className="text-[10px] font-semibold text-slate-400">
                    Desktop
                  </div>
                </div>

                {/* SCREENSHOT + REAL HEATMAP */}

                <HeatmapViewer
                  events={events}
                  type={hType}
                  screenshot={screenshot}
                />
              </div>
            )}

            {/* LEGEND */}

            {status === 'ready' && (
              <div className="mt-4 flex items-center justify-center gap-3">

                <span className="text-[11px] text-slate-500">
                  Low activity
                </span>

                <div
                  className="
                    flex
                    h-3
                    w-44
                    overflow-hidden
                    rounded-full
                  "
                >
                  {[
                    '#3B82F6',
                    '#22D3EE',
                    '#4ADE80',
                    '#FDE047',
                    '#F97316',
                    '#EF4444',
                  ].map((color) => (
                    <div
                      key={color}
                      className="flex-1"
                      style={{
                        background: color,
                      }}
                    />
                  ))}
                </div>

                <span className="text-[11px] text-slate-500">
                  High activity
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================
            SIDE PANEL
        ======================================================= */}

        <aside
          className="
            w-full
            shrink-0
            overflow-y-auto
            border-t
            bg-white
            p-4
            xl:w-60
            xl:border-l
            xl:border-t-0
          "
          style={{
            borderColor: '#F1F5F9',
          }}
        >
          <p
            className="
              mb-4
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Heatmap Summary
          </p>

          <div className="space-y-3">

            <SummaryRow
              label="Total clicks"
              value={stats.clicks.toLocaleString()}
            />

            <SummaryRow
              label="Mouse movements"
              value={stats.moves.toLocaleString()}
            />

            <SummaryRow
              label="Unique users"
              value={stats.uniqueUsers.toLocaleString()}
            />

            <SummaryRow
              label="Sessions"
              value={stats.sessions.toLocaleString()}
            />
          </div>

          <div
            className="my-5 border-t"
            style={{
              borderColor: '#F1F5F9',
            }}
          />

          <p
            className="
              mb-3
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Current View
          </p>

          <div className="space-y-3">

            <SummaryRow
              label="Page"
              value={
                currentPage?.label || '—'
              }
            />

            <SummaryRow
              label="Surface"
              value={
                hmPlatform === 'web'
                  ? 'Web'
                  : 'App'
              }
            />

            <SummaryRow
              label="Device"
              value="Desktop"
            />

            <SummaryRow
              label="Map"
              value={
                hType === 'click'
                  ? 'Click'
                  : 'Movement'
              }
            />
          </div>

          {status === 'ready' && (
            <>
              <div
                className="my-5 border-t"
                style={{
                  borderColor: '#F1F5F9',
                }}
              />

              <div
                className="
                  rounded-xl
                  border
                  bg-slate-50
                  p-3
                "
                style={{
                  borderColor: '#E2E8F0',
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Active map
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {activeEventCount.toLocaleString()}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {hType === 'click'
                    ? 'click events'
                    : 'movement events'}
                </p>
              </div>
            </>
          )}

          {selectedPersonas.length > 0 && (
            <>
              <div
                className="my-5 border-t"
                style={{
                  borderColor: '#F1F5F9',
                }}
              />

              <p
                className="
                  mb-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Personas
              </p>

              <div className="flex flex-wrap gap-1.5">
                {selectedPersonas.map((id) => (
                  <PersonaChip
                    key={id}
                    id={id}
                    size="sm"
                  />
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-slate-500">
        {label}
      </span>

      <span className="text-right text-[11px] font-bold text-slate-800">
        {value}
      </span>
    </div>
  )
}