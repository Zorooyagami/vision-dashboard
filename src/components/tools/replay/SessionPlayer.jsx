//components/tools/replay/SessionPlayer.jsx
import { useState, useEffect, useRef } from 'react'
import 'rrweb-player/dist/style.css'
import { apiRequest } from '../../../services/apiClient'

const API_BASE = '/api/record'

export default function SessionPlayer({ session, onClose }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)

  const [status, setStatus] = useState('loading')
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    let frame = 0
    let scaleFrame = 0
    let observer = null
    let Player = null
    let replayEvents = null
    let previousWidth = 0
    let previousHeight = 0
    const controller = new AbortController()
    const host = containerRef.current

    const fail = (err) => {
      if (cancelled || controller.signal.aborted) return
      console.error('[SessionPlayer] failed to load:', err)
      setStatus('error')
    }

    // The host is an absolutely positioned box in a bounded flex area.
    // Its size never depends on the player's own dimensions.
    const fitPlayer = () => {
      frame = 0
      if (cancelled || !host || !Player || !replayEvents) return
      if (document.fullscreenElement && host.contains(document.fullscreenElement)) return
      const width = Math.floor(host.clientWidth)
      const availableHeight = Math.floor(host.clientHeight)
      const controls = host.querySelector('.rr-controller')
      // rrweb-player's controller is 80px by default (not 70px).
      // Measure it too: narrow layouts can wrap its buttons onto another row.
      const controlsHeight = controls ? Math.ceil(controls.getBoundingClientRect().height) : 80
      if (width < 1 || availableHeight <= controlsHeight) return
      const height = availableHeight - controlsHeight
      try {
        if (!playerRef.current) {
          playerRef.current = new Player({
            target: host,
            props: { events: replayEvents, width, height, autoPlay: false,
              showController: true, skipInactive: true },
          })
          const toolbar = host.querySelector('.rr-controller')
          if (toolbar) observer?.observe(toolbar)
          setStatus('ready')
        } else if (width !== previousWidth || height !== previousHeight) {
          // Resize the same player, preserving playback position and state.
          playerRef.current.$set({ width, height })
        }
        previousWidth = width
        previousHeight = height
        cancelAnimationFrame(scaleFrame)
        scaleFrame = requestAnimationFrame(() => {
          if (cancelled) return
          try { playerRef.current?.triggerResize?.() } catch (err) { fail(err) }
        })
      } catch (err) { fail(err) }
    }
    const scheduleFit = () => {
      if (!cancelled && !frame) frame = requestAnimationFrame(fitPlayer)
    }

    if (host) {
      observer = new ResizeObserver(scheduleFit)
      observer.observe(host)
    }
    window.addEventListener('resize', scheduleFit)
    document.addEventListener('fullscreenchange', scheduleFit)

    const loadReplay = async () => {
      setStatus('loading')
      try {
        const [{ default: rrwebPlayer }, response] = await Promise.all([
          import('rrweb-player'),
          apiRequest(`${API_BASE}/${encodeURIComponent(session.sessionId)}`, { signal: controller.signal }),
        ])
        if (!response.ok) throw new Error(`Status ${response.status}`)
        const { events } = await response.json()
        if (cancelled) return
        if (!Array.isArray(events) || events.length < 2) {
          setStatus('empty')
          return
        }
        Player = rrwebPlayer
        replayEvents = events
        scheduleFit()
      } catch (err) { fail(err) }
    }
    loadReplay()

    return () => {
      cancelled = true
      controller.abort()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(scaleFrame)
      observer?.disconnect()
      window.removeEventListener('resize', scheduleFit)
      document.removeEventListener('fullscreenchange', scheduleFit)
      playerRef.current?.$destroy?.()
      playerRef.current = null
    }
  }, [session.sessionId])

  return (
    <>
      <div className="vision-session-replay flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-3 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              Session Replay
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500">
              {session.sessionId}
            </p>
          </div>

          <div className="flex items-center gap-2">            
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* PLAYER SECTION */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50 p-2 sm:p-4">

            <div
              className="
                relative
                flex
                min-h-0
                flex-1
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >

              {/* Loading state */}
              {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                    <p className="text-sm text-slate-500">
                      Loading session replay…
                    </p>
                  </div>
                </div>
              )}

              {/* Empty */}
              {status === 'empty' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-slate-400">
                    Not enough events to play this session yet.
                  </p>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-red-500">
                    Failed to load replay — check console/network tab.
                  </p>
                </div>
              )}

              {/*
                IMPORTANT:
                Do NOT use display:none here.

                It must exist in the layout while we're measuring it.
              */}
              <div
                ref={containerRef}
                className="
                  absolute inset-0
                  min-h-0 min-w-0 overflow-hidden
                "
                style={{
                  visibility:
                    status === 'empty' || status === 'error'
                      ? 'hidden'
                      : 'visible',
                }}
              />
            </div>
          </div>

          {/* SIDE PANEL */}
          <aside className="hidden min-h-0 w-[260px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Session details
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">
                    User
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {session.name || session.email || session.userId || 'Guest'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Session ID
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-600">
                    {session.sessionId}
                  </p>
                </div>

                {session.duration && (
                  <div>
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {session.duration}
                    </p>
                  </div>
                )}

                {session.pages?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">
                      Pages
                    </p>

                    <div className="mt-2 space-y-1">
                      {session.pages.map((page) => (
                        <div
                          key={page}
                          className="truncate rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-600"
                        >
                          {page}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .vision-session-replay .rr-player:not(:fullscreen) {
          float: none;
          height: auto !important;
          box-shadow: none;
        }
        .vision-session-replay .rr-controller {
          min-height: 80px;
          height: auto !important;
          box-sizing: border-box;
          padding: 8px 4px;
          gap: 8px;
        }
        .vision-session-replay .rr-controller__btns {
          max-width: 100%;
          flex-wrap: wrap;
          row-gap: 4px;
        }
      `}</style>

      {/* SHARE MODAL */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Share replay
              </h3>

              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Session ID
            </p>

            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              {session.sessionId}
            </div>
          </div>
        </div>
      )}
    </>
  )
}