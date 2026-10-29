// src/hooks/useSiteEditor.js
//
// Drives the on-site element picker. Opens the customer's site in a new tab with
// ?vision_editor=1; the hosted SDK in that tab switches to editor mode and talks
// back over postMessage (see "VISUAL EDITOR" in the SDK).
//
// Security: we only ever talk to the tab WE opened (event.source), and only to the
// origin of the URL WE opened (event.origin). Nothing else is trusted.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useProject } from '../context/ProjectContext'

// Module scope on purpose: closing and re-opening the modal must keep talking to
// the same editor tab instead of opening a second one.
let sharedWin = null
let sharedOrigin = null

const isOpen = () => !!sharedWin && !sharedWin.closed

export function normaliseSiteUrl(raw) {
  const value = String(raw || '').trim()
  if (!value) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/**
 * status: 'idle' | 'opening' | 'connected' | 'blocked' | 'closed'
 */
export function useSiteEditor({ onPicked } = {}) {
  const { projectId } = useProject()
  const [status, setStatus] = useState(() => (isOpen() ? 'opening' : 'idle'))
  const [testResult, setTestResult] = useState(null)
  const pendingRef = useRef(null)
  const requestIdRef = useRef(0)
  const onPickedRef = useRef(onPicked)
  onPickedRef.current = onPicked

  const post = useCallback(
    (type, payload) => {
      if (!isOpen() || !sharedOrigin) return false
      sharedWin.postMessage({ type, projectId, ...payload }, sharedOrigin)
      return true
    },
    [projectId],
  )

  useEffect(() => {
    function onMessage(event) {
      if (!sharedWin || event.source !== sharedWin) return
      if (event.origin !== sharedOrigin) return
      const msg = event.data
      if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return
      if (!msg.type.startsWith('vision:') || msg.projectId !== projectId) return

      switch (msg.type) {
        case 'vision:editor-ready':
          // The SDK asks until someone answers; this is the handshake.
          sharedWin.postMessage({ type: 'vision:editor-init', projectId }, sharedOrigin)
          break
        case 'vision:editor-connected':
          setStatus('connected')
          if (pendingRef.current) {
            const { type, payload } = pendingRef.current
            pendingRef.current = null
            post(type, payload)
          }
          break
        case 'vision:element-picked':
          onPickedRef.current?.(msg)
          break
        case 'vision:test-result':
          setTestResult(msg)
          break
        case 'vision:editor-closed':
          setStatus('closed')
          break
        default:
          break
      }
    }

    window.addEventListener('message', onMessage)

    // Re-attach to a tab left open by an earlier modal.
    if (isOpen()) sharedWin.postMessage({ type: 'vision:editor-init', projectId }, sharedOrigin)

    // Notice when the admin closes the editor tab.
    const timer = setInterval(() => {
      if (sharedWin && sharedWin.closed) setStatus((s) => (s === 'idle' ? s : 'closed'))
    }, 1000)

    return () => {
      window.removeEventListener('message', onMessage)
      clearInterval(timer)
      // Don't leave highlights/crosshair behind on the site.
      if (isOpen() && sharedOrigin) {
        sharedWin.postMessage({ type: 'vision:stop-pick', projectId }, sharedOrigin)
        sharedWin.postMessage({ type: 'vision:clear', projectId }, sharedOrigin)
      }
    }
  }, [projectId, post])

  // Opens (or re-uses) the editor tab, then runs `then` once the SDK has connected.
  const ensureEditor = useCallback(
    (siteUrl, then) => {
      const url = normaliseSiteUrl(siteUrl)
      if (!url) return false

      if (isOpen() && sharedOrigin === url.origin && status === 'connected') {
        sharedWin.focus()
        if (then) post(then.type, then.payload)
        return true
      }

      url.searchParams.set('vision_editor', '1')
      sharedOrigin = url.origin
      pendingRef.current = then || null
      setTestResult(null)
      // Must run synchronously inside the click handler or popup blockers drop it.
      const win = window.open(url.toString(), 'vision_editor')
      if (!win) {
        sharedWin = null
        setStatus('blocked')
        return false
      }
      sharedWin = win
      setStatus('opening')
      return true
    },
    [post, status],
  )

  const startPick = useCallback(
    (siteUrl) => ensureEditor(siteUrl, { type: 'vision:start-pick' }),
    [ensureEditor],
  )

  const testSelector = useCallback(
    (siteUrl, selector) => {
      requestIdRef.current += 1
      return ensureEditor(siteUrl, {
        type: 'vision:test-selector',
        payload: { selector, requestId: String(requestIdRef.current) },
      })
    },
    [ensureEditor],
  )

  return { status, testResult, startPick, testSelector, clearTestResult: () => setTestResult(null) }
}
