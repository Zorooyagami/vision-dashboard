// src/hooks/useEvents.js
import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, toggleEventStatus, createEvent } from '../services/eventsApi';
import { useProject } from '../context/ProjectContext'

export function useEvents(filters) {
  const { projectId } = useProject()

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
  setLoading(true);
  setError(null);
  return fetchEvents(filters)
    .then(setEvents)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, [projectId, filters.period, filters.customRange, filters.platform, JSON.stringify(filters.selectedPersonas), filters.device]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = useCallback(async (name) => {
    // optimistic update, roll back on failure
    setEvents((prev) => prev.map((e) => e.name === name
      ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' }
      : e));
    try {
      await toggleEventStatus(name);
    } catch (err) {
      setError(err.message);
      load(); // resync with server truth on failure
    }
  }, [load]);

  const addEvent = useCallback(async (payload) => {
    const created = await createEvent(payload); // let caller catch errors (e.g. duplicate name)
    await load();
    return created;
  }, [load]);

  return { events, loading, error, reload: load, toggleStatus, addEvent };
}