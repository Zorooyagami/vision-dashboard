import { useState } from 'react'
import { PERSONAS } from '../data/personas'
import { useFilters } from '../context/FiltersContext'
import { useFunnel } from '../hooks/useFunnels'
import { useJourneyPaths } from '../hooks/useJourneyPaths'
import { usePathDetail } from '../hooks/usePathDetail'

export default function ConversionPage() {
  const [filterPersona, setFilterPersona] = useState(null)
  const [selectedFunnel, setSelectedFunnel] = useState('direct')
  const [activeStep, setActiveStep] = useState(null)
  const [expandedPath, setExpandedPath] = useState(null)

  const {
    platform,
    selectedPersonas,
    period,
    customRange,
    device,
  } = useFilters()

  const effectivePersonas = filterPersona
    ? [filterPersona]
    : selectedPersonas

  const filters = {
    period,
    customRange,
    platform,
    selectedPersonas: effectivePersonas,
    device,
  }

  /* --------------------------------------------------
   * Funnel
   * -------------------------------------------------- */

  const {
    data: funnelData,
    loading: funnelLoading,
    error: funnelError,
  } = useFunnel(filters)

  /* --------------------------------------------------
   * Customer paths
   * -------------------------------------------------- */

  const {
    topPaths,
    totalSessions,
    totalPurchasers,
    loading: pathsLoading,
  } = useJourneyPaths(filters)

  const {
    detail,
    loading: detailLoading,
    loadDetail,
    clearDetail,
  } = usePathDetail(filters)

  /* --------------------------------------------------
   * Persona helpers
   * -------------------------------------------------- */

  const selectedPersona = filterPersona
    ? PERSONAS.find((p) => p.id === filterPersona)
    : null

  const selectedPersonaName = selectedPersona?.name

  const isGuestPersona =
    selectedPersona?.name
      ?.toLowerCase()
      .includes('guest') || false

  /*
   * Collectors should remain available elsewhere in
   * the dashboard, but not in the Funnel persona filter.
   */
  const funnelPersonas = PERSONAS.filter(
    (p) =>
      !p.name
        ?.toLowerCase()
        .includes('collector')
  )

  /* --------------------------------------------------
   * Selected funnel
   * -------------------------------------------------- */

  const funnels = funnelData?.funnels || {}

  const activeFunnel = funnels[selectedFunnel]

  const allSteps = activeFunnel?.steps || []

  /*
   * UI-only filtering.
   *
   * Backend still calculates the full ordered journey.
   *
   * Via PDP:
   * PDP → Add to Cart → Cart → Checkout → Purchase
   *
   * Guest:
   * Checkout + Purchase are hidden.
   */

  let data = allSteps

  if (selectedFunnel === 'viaPdp') {
    data = data.filter(
      (step) => step.step !== 'PLP'
    )
  }

  if (isGuestPersona) {
    data = data.filter(
      (step) =>
        step.step !== 'Checkout' &&
        step.step !== 'Purchase'
    )
  }

  /*
   * First visible step becomes 100%.
   *
   * Direct:
   * PLP = 100%
   *
   * Via PDP:
   * PDP = 100%
   */

  const maxVal = data[0]?.value || 1

  const visibleEntrySessions =
    data[0]?.value || 0

  /* --------------------------------------------------
   * Handlers
   * -------------------------------------------------- */

  const handleFunnelChange = (funnelId) => {
    setSelectedFunnel(funnelId)
    setActiveStep(null)
  }

  const handleStepClick = (step) => {
    setActiveStep((prev) =>
      prev === step ? null : step
    )
  }

  const handlePathClick = (path) => {
    if (expandedPath === path.path) {
      setExpandedPath(null)
      clearDetail()
    } else {
      setExpandedPath(path.path)
      loadDetail(path.nodes)
    }
  }

  /* --------------------------------------------------
   * Render
   * -------------------------------------------------- */

  return (
    <div className="space-y-5 p-4 sm:p-6">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div>
        <h2 className="text-base font-bold text-slate-900">
          Conversion Funnel
        </h2>

        <p className="text-xs text-slate-400 mt-0.5">
          Understand how sessions progress through your
          key conversion journeys
        </p>
      </div>

      {/* ==================================================
          PERSONA FILTER
      ================================================== */}

      <div
        className="bg-white rounded-2xl p-4"
        style={{
          boxShadow:
            '0 1px 3px rgba(15,23,42,0.06)',
        }}
      >
        <p className="text-xs font-semibold text-slate-500 mb-2.5">
          Filter Funnel by Persona
        </p>

        <div className="flex flex-wrap gap-2">

          {/* All Personas */}

          <button
            onClick={() =>
              setFilterPersona(null)
            }
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
            style={{
              borderColor:
                filterPersona === null
                  ? '#6366F1'
                  : '#E2E8F0',

              background:
                filterPersona === null
                  ? '#EEF2FF'
                  : 'transparent',

              color:
                filterPersona === null
                  ? '#6366F1'
                  : '#64748B',
            }}
          >
            All Personas
          </button>

          {/* Personas - Collectors excluded */}

          {funnelPersonas.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setFilterPersona((prev) =>
                  prev === p.id
                    ? null
                    : p.id
                )
              }
            >
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all"
                style={{
                  background:
                    filterPersona === p.id
                      ? p.lightBg
                      : 'transparent',

                  color:
                    filterPersona === p.id
                      ? p.textColor
                      : '#64748B',

                  borderColor:
                    filterPersona === p.id
                      ? p.color
                      : '#E2E8F0',

                  boxShadow:
                    filterPersona === p.id
                      ? `0 0 0 1px ${p.color}`
                      : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                  }}
                >
                  {p.icon}
                </span>

                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================
          FUNNEL CARD
      ================================================== */}

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            '0 1px 3px rgba(15,23,42,0.06)',
        }}
      >

        {/* Funnel header */}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">

          <div>
            <p className="text-sm font-bold text-slate-900">
              {selectedPersonaName
                ? `${selectedPersonaName} Funnel`
                : platform === 'combined'
                  ? 'All Platforms Funnel'
                  : platform === 'web'
                    ? 'Web Funnel'
                    : 'App Funnel'}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Sessions must complete each step in order
              to progress through the funnel.
            </p>
          </div>

          {/* Funnel selector */}

          <div
            className="inline-flex rounded-xl p-1"
            style={{
              background: '#F1F5F9',
            }}
          >
            <button
              onClick={() =>
                handleFunnelChange('direct')
              }
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background:
                  selectedFunnel === 'direct'
                    ? '#FFFFFF'
                    : 'transparent',

                color:
                  selectedFunnel === 'direct'
                    ? '#4F46E5'
                    : '#64748B',

                boxShadow:
                  selectedFunnel === 'direct'
                    ? '0 1px 2px rgba(15,23,42,0.08)'
                    : 'none',
              }}
            >
              Direct to Cart
            </button>

            <button
              onClick={() =>
                handleFunnelChange('viaPdp')
              }
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background:
                  selectedFunnel === 'viaPdp'
                    ? '#FFFFFF'
                    : 'transparent',

                color:
                  selectedFunnel === 'viaPdp'
                    ? '#4F46E5'
                    : '#64748B',

                boxShadow:
                  selectedFunnel === 'viaPdp'
                    ? '0 1px 2px rgba(15,23,42,0.08)'
                    : 'none',
              }}
            >
              Via Product Detail
            </button>
          </div>
        </div>

        {/* Loading */}

        {funnelLoading && (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400">
              Loading funnel...
            </p>
          </div>
        )}

        {/* Error */}

        {!funnelLoading &&
          funnelError && (
            <div
              className="rounded-xl p-4 text-xs"
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
              }}
            >
              Failed to load funnel:{' '}
              {funnelError}
            </div>
          )}

        {/* Empty state */}

        {!funnelLoading &&
          !funnelError &&
          !activeFunnel && (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-400">
                No funnel data available.
              </p>
            </div>
          )}

        {/* ==================================================
            ACTIVE FUNNEL
        ================================================== */}

        {!funnelLoading &&
          !funnelError &&
          activeFunnel && (
            <>

              {/* Funnel description */}

              <div
                className="rounded-xl px-4 py-3 mb-5"
                style={{
                  background: '#F8FAFC',
                  border:
                    '1px solid #E2E8F0',
                }}
              >
                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-xs font-bold text-slate-700">
                    {activeFunnel.name}
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-xs text-slate-500">

                    {selectedFunnel ===
                    'viaPdp'
                      ? isGuestPersona
                        ? 'PDP → Add to Cart → Cart'
                        : 'PDP → Add to Cart → Cart → Checkout → Purchase'

                      : isGuestPersona
                        ? 'PLP → Add to Cart → Cart'
                        : activeFunnel.description}

                  </span>

                </div>
              </div>

              {/* ==================================================
                  SUMMARY CARDS
              ================================================== */}

              <div
                className={`grid grid-cols-1 ${
                  isGuestPersona
                    ? 'sm:grid-cols-1'
                    : 'sm:grid-cols-3'
                } gap-3 mb-7`}
              >

                {/* Entered */}

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: '#F8FAFC',
                    border:
                      '1px solid #E2E8F0',
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Entered Funnel
                  </p>

                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {visibleEntrySessions.toLocaleString()}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Sessions
                  </p>
                </div>

                {/* Purchase metrics not relevant for Guest */}

                {!isGuestPersona && (
                  <>

                    {/* Purchased */}

                    <div
                      className="rounded-xl p-4"
                      style={{
                        background:
                          '#F8FAFC',
                        border:
                          '1px solid #E2E8F0',
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                        Purchased
                      </p>

                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {(
                          activeFunnel.convertedSessions ||
                          0
                        ).toLocaleString()}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Sessions
                      </p>
                    </div>

                    {/* Overall conversion */}

                    <div
                      className="rounded-xl p-4"
                      style={{
                        background:
                          '#EEF2FF',
                        border:
                          '1px solid #C7D2FE',
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-indigo-400">
                        Overall Conversion
                      </p>

                      <p className="text-xl font-bold text-indigo-600 mt-1">
                        {selectedFunnel ===
                        'viaPdp'
                          ? visibleEntrySessions >
                            0
                            ? (
                                ((activeFunnel.convertedSessions ||
                                  0) /
                                  visibleEntrySessions) *
                                100
                              ).toFixed(1)
                            : 0
                          : activeFunnel.conversionRate ||
                            0}
                        %
                      </p>

                      <p className="text-[10px] text-indigo-400 mt-1">
                        {selectedFunnel ===
                        'viaPdp'
                          ? 'PDP → Purchase'
                          : 'Entry → Purchase'}
                      </p>
                    </div>

                  </>
                )}

              </div>

              {/* ==================================================
                  FUNNEL BARS
              ================================================== */}

              <div className="space-y-3">

                {data.map(
                  (item, i) => {
                    const pct =
                      maxVal > 0
                        ? (item.value /
                            maxVal) *
                          100
                        : 0

                    const isActive =
                      activeStep ===
                      item.step

                    /*
                     * Calculate displayed retention/drop-off
                     * against the previous VISIBLE step.
                     *
                     * This matters because PLP is hidden
                     * for the Via PDP view.
                     */

                    const previousItem =
                      i > 0
                        ? data[i - 1]
                        : null

                    const retention =
                      previousItem?.value > 0
                        ? +(
                            (item.value /
                              previousItem.value) *
                            100
                          ).toFixed(1)
                        : 100

                    const dropoff =
                      i > 0
                        ? +(
                            100 -
                            retention
                          ).toFixed(1)
                        : 0

                    return (
                      <div
                        key={`${item.step}-${i}`}
                      >

                        {/* Drop-off */}

                        {i > 0 && (
                          <div className="flex items-center gap-3 py-1 pl-4">

                            <div
                              className="text-[10px] font-bold px-2 py-0.5 rounded"
                              style={{
                                background:
                                  '#FEF2F2',
                                color:
                                  '#EF4444',
                              }}
                            >
                              ↓ {dropoff}%
                              {' drop-off'}
                            </div>

                            <div className="text-[10px] text-slate-400">
                              {retention}%
                              {' retained'}
                            </div>

                            <div
                              className="flex-1 h-px"
                              style={{
                                background:
                                  '#F1F5F9',
                              }}
                            />

                          </div>
                        )}

                        {/* Step */}

                        <button
                          className="w-full text-left transition-all"
                          onClick={() =>
                            handleStepClick(
                              item.step
                            )
                          }
                        >

                          <div className="flex items-center gap-3 mb-1.5">

                            <span className="text-xs font-semibold text-slate-700 w-36 shrink-0">
                              {item.step}
                            </span>

                            <span className="text-xs font-bold text-slate-900">
                              {item.value.toLocaleString()}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {Math.round(
                                pct
                              )}
                              % of entry
                            </span>

                            {isActive && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  background:
                                    '#EEF2FF',
                                  color:
                                    '#6366F1',
                                }}
                              >
                                Selected
                              </span>
                            )}

                          </div>

                          {/* Bar */}

                          <div
                            className="h-10 rounded-lg overflow-hidden"
                            style={{
                              background:
                                '#F1F5F9',
                            }}
                          >
                            <div
                              className="h-full rounded-lg flex items-center px-3 transition-all duration-300"
                              style={{
                                width: `${pct}%`,

                                background:
                                  'linear-gradient(90deg, #6366F1CC, #6366F1)',

                                minWidth:
                                  item.value >
                                  0
                                    ? '40px'
                                    : '0px',
                              }}
                            >
                              {pct > 15 && (
                                <span className="text-white text-xs font-bold">
                                  {item.value.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                        </button>
                      </div>
                    )
                  }
                )}

              </div>

              {/* ==================================================
                  FUNNEL FOOTER
              ================================================== */}

              {data.length > 0 && (
                <div
                  className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-4 border-t"
                  style={{
                    borderColor:
                      '#E2E8F0',
                  }}
                >

                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {visibleEntrySessions.toLocaleString()}
                    </span>{' '}
                    entered
                  </p>

                  {!isGuestPersona && (
                    <>

                      <p className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {activeFunnel.convertedSessions?.toLocaleString()}
                        </span>{' '}
                        purchased
                      </p>

                      <p className="text-[11px] text-slate-500">
                        <span className="font-semibold text-indigo-600">
                          {selectedFunnel ===
                          'viaPdp'
                            ? visibleEntrySessions >
                              0
                              ? (
                                  ((activeFunnel.convertedSessions ||
                                    0) /
                                    visibleEntrySessions) *
                                  100
                                ).toFixed(
                                  1
                                )
                              : 0
                            : activeFunnel.conversionRate}
                          %
                        </span>{' '}
                        overall conversion
                      </p>

                    </>
                  )}

                </div>
              )}

            </>
          )}

      </div>

      {/* ==================================================
          TOP CUSTOMER PATHS
      ================================================== */}

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            '0 1px 3px rgba(15,23,42,0.06)',
        }}
      >

        <div className="mb-4">

          <p className="text-sm font-bold text-slate-900">
            Top Customer Paths
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {totalSessions.toLocaleString()}
            {' total sessions · '}
            {totalPurchasers.toLocaleString()}
            {' purchasers'}
          </p>

        </div>

        {/* Loading */}

        {pathsLoading && (
          <p className="text-xs text-slate-400">
            Loading paths...
          </p>
        )}

        {/* Paths */}

        {!pathsLoading && (
          <div className="space-y-2">

            {topPaths.map(
              (path, i) => (
                <div key={path.path}>

                  <button
                    onClick={() =>
                      handlePathClick(
                        path
                      )
                    }
                    className="w-full text-left rounded-xl border p-4 transition-all hover:border-indigo-300"
                    style={{
                      borderColor:
                        expandedPath ===
                        path.path
                          ? '#6366F1'
                          : '#E2E8F0',

                      background:
                        expandedPath ===
                        path.path
                          ? '#EEF2FF'
                          : 'transparent',
                    }}
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex-1">

                        <p className="text-xs font-semibold text-slate-800">
                          {i + 1}.{' '}
                          {path.path}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">

                          {path.sessionCount?.toLocaleString()}
                          {' sessions · '}

                          {path.pctOfPurchasers !==
                          null
                            ? `${path.pctOfPurchasers}% of purchasers`
                            : `${path.pctOfTotalSessions}% of sessions`}

                          {path.revenue >
                            0 &&
                            ` · $${(
                              path.revenue /
                              1000
                            ).toFixed(
                              1
                            )}K revenue`}

                        </p>

                      </div>

                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#94A3B8"
                        strokeWidth={2}
                        style={{
                          transform:
                            expandedPath ===
                            path.path
                              ? 'rotate(90deg)'
                              : 'none',

                          transition:
                            'transform 0.2s',
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>

                    </div>

                  </button>

                  {/* ==========================================
                      PATH DETAIL
                  ========================================== */}

                  {expandedPath ===
                    path.path && (
                    <div
                      className="mt-2 rounded-xl border p-4"
                      style={{
                        background:
                          '#FAFBFF',
                        borderColor:
                          '#E2E8F0',
                      }}
                    >

                      {detailLoading && (
                        <p className="text-xs text-slate-400">
                          Loading
                          detail...
                        </p>
                      )}

                      {!detailLoading &&
                        detail && (
                          <>

                            {/* Steps */}

                            <div className="space-y-2 mb-4">

                              {detail.steps.map(
                                (
                                  step,
                                  si
                                ) => (
                                  <div
                                    key={`${step.node}-${si}`}
                                    className="flex flex-wrap items-center gap-3"
                                  >

                                    <span className="text-xs font-semibold text-slate-700 w-28">
                                      {
                                        step.node
                                      }
                                    </span>

                                    <span className="text-xs text-slate-500">
                                      {step.count.toLocaleString()}
                                      {' sessions'}
                                    </span>

                                    {si >
                                      0 && (
                                      <span className="text-[10px] text-slate-400">
                                        {
                                          step.retentionFromPrevious
                                        }
                                        %
                                        {' retained'}
                                      </span>
                                    )}

                                  </div>
                                )
                              )}

                            </div>

                            {/* Summary */}

                            <div
                              className="flex flex-wrap gap-8 pt-3 border-t"
                              style={{
                                borderColor:
                                  '#E2E8F0',
                              }}
                            >

                              <div>
                                <p className="text-[10px] text-slate-400">
                                  Users
                                </p>

                                <p className="text-sm font-bold text-slate-900">
                                  {detail.users.toLocaleString()}
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400">
                                  Revenue
                                </p>

                                <p className="text-sm font-bold text-slate-900">
                                  $
                                  {(
                                    detail.revenue /
                                    1000
                                  ).toFixed(
                                    1
                                  )}
                                  K
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400">
                                  Conversion
                                </p>

                                <p className="text-sm font-bold text-slate-900">
                                  {
                                    detail.conversion
                                  }
                                  %
                                </p>
                              </div>

                            </div>

                          </>
                        )}

                    </div>
                  )}

                </div>
              )
            )}

            {!topPaths.length && (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">
                  No customer paths found for the
                  selected filters.
                </p>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  )
}