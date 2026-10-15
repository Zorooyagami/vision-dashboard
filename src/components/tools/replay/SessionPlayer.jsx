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

    const loadReplay = async () => {
      try {
        setStatus('loading')

        const [{ default: rrwebPlayer }, response] = await Promise.all([
          import('rrweb-player'),
          apiRequest(`${API_BASE}/${encodeURIComponent(session.sessionId)}`),
        ])

        if (!response.ok) {
          throw new Error(`Status ${response.status}`)
        }

        const { events } = await response.json()
        if (cancelled) return

        if (!events?.length) {
          setStatus('empty')
          return
        }

        // Allow browser to finish laying out the replay area first
        requestAnimationFrame(() => {
          if (cancelled || !containerRef.current) return

          const rect = containerRef.current.getBoundingClientRect()

          const width = Math.max(Math.floor(rect.width), 320)

          // Leave room for rrweb controls
          const height = Math.max(
            Math.floor(rect.height - 70),
            360
          )

          playerRef.current?.$destroy?.()

          playerRef.current = new rrwebPlayer({
            target: containerRef.current,

            props: {
              events,
              width,
              height,
              autoPlay: false,

              // Optional
              showController: true,
              skipInactive: true,
            },
          })

          setStatus('ready')
        })
      } catch (err) {
        console.error('[SessionPlayer] failed to load:', err)

        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    loadReplay()

    return () => {
      cancelled = true

      playerRef.current?.$destroy?.()
      playerRef.current = null
    }
  }, [session.sessionId])

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Session Replay
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {session.sessionId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Share
            </button>

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
          <div className="flex min-w-0 flex-1 flex-col bg-slate-50 p-5">

            <div
              className="
                relative
                flex
                min-h-0
                flex-1
                overflow-auto
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
                    No events found for this session.
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
                  h-full
                  min-h-[500px]
                  w-full
                  min-w-0
                  [&_.rr-player]:mx-auto
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
          <aside className="hidden w-[300px] shrink-0 border-l border-slate-200 bg-white xl:block">
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