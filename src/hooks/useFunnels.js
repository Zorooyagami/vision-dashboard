// src/hooks/useFunnels.js
import { useCallback, useEffect, useState } from 'react'
import * as api from '../services/funnelsService'

export function useFunnels(projectId, filters) {
  const [funnels, setFunnels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // filters is a new object every render, so key the effect on its contents.
  const filterKey = JSON.stringify(filters ?? {})

  const load = useCallback(
    async (signal) => {
      if (!projectId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await api.listFunnels(projectId, JSON.parse(filterKey), signal)
        setFunnels(data.funnels)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message)
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [projectId, filterKey],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  // create / update throw so the builder modal can show the error inline.
  const create = useCallback(
    async (payload) => {
      const { funnel } = await api.createFunnel(projectId, payload, JSON.parse(filterKey))
      setFunnels((prev) => [funnel, ...prev])
      return funnel
    },
    [projectId, filterKey],
  )

  const update = useCallback(
    async (id, payload) => {
      const { funnel } = await api.updateFunnel(projectId, id, payload, JSON.parse(filterKey))
      setFunnels((prev) => prev.map((f) => (f.id === id ? funnel : f)))
      return funnel
    },
    [projectId, filterKey],
  )

  const remove = useCallback(
    async (id) => {
      try {
        await api.deleteFunnel(projectId, id)
        setFunnels((prev) => prev.filter((f) => f.id !== id))
        return true
      } catch (e) {
        setError(e.message)
        return false
      }
    },
    [projectId],
  )

  const duplicate = useCallback(
    async (id) => {
      try {
        const { funnel } = await api.duplicateFunnel(projectId, id, JSON.parse(filterKey))
        setFunnels((prev) => [funnel, ...prev])
        return funnel
      } catch (e) {
        setError(e.message)
        return null
      }
    },
    [projectId, filterKey],
  )

  return { funnels, loading, error, create, update, remove, duplicate, reload: load }
}

// Event names tracked for this project (feeds the step picker).
export function useTrackedEvents(projectId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    api
      .listTrackedEvents(projectId, controller.signal)
      .then((data) => setEvents(data.events))
      .catch(() => {}) // picker just stays empty; the tab surfaces list errors
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [projectId])

  return { events, loading }
}
