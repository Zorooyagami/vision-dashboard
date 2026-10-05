// src/hooks/useFunnels.js
import { useCallback, useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import * as api from '../services/funnelsService'

// filters = { period, customRange, platform, device, selectedPersonas }
export function useFunnels(filters) {
  const { projectId } = useProject()

  const [funnels, setFunnels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // filters is a new object every render, so key effects on its contents.
  const filterKey = JSON.stringify(filters ?? {})

  // Never show another project's funnels after switching project.
  useEffect(() => {
    setFunnels([])
  }, [projectId])

  const load = useCallback(
    async (signal) => {
      if (!projectId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await api.listFunnels(JSON.parse(filterKey), signal)
        if (!signal?.aborted) setFunnels(data.funnels)
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
      const { funnel } = await api.createFunnel(payload, JSON.parse(filterKey))
      setFunnels((prev) => [funnel, ...prev])
      return funnel
    },
    [filterKey],
  )

  const update = useCallback(
    async (id, payload) => {
      const { funnel } = await api.updateFunnel(id, payload, JSON.parse(filterKey))
      setFunnels((prev) => prev.map((f) => (f.id === id ? funnel : f)))
      return funnel
    },
    [filterKey],
  )

  const remove = useCallback(async (id) => {
    try {
      await api.deleteFunnel(id)
      setFunnels((prev) => prev.filter((f) => f.id !== id))
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [])

  const duplicate = useCallback(
    async (id) => {
      try {
        const { funnel } = await api.duplicateFunnel(id, JSON.parse(filterKey))
        setFunnels((prev) => [funnel, ...prev])
        return funnel
      } catch (e) {
        setError(e.message)
        return null
      }
    },
    [filterKey],
  )

  return { funnels, loading, error, create, update, remove, duplicate, reload: load }
}

// Event names from the project's event catalog (feeds the step picker).
export function useTrackedEvents() {
  const { projectId } = useProject()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setEvents([])
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    api
      .listTrackedEvents(controller.signal)
      .then((data) => setEvents(data.events))
      .catch(() => {}) // picker stays empty; the tab surfaces list errors
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [projectId])

  return { events, loading }
}
