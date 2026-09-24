// src/services/eventsApi.js
const API_BASE = 'http://localhost:4000/api/admin';

// services/eventsApi.js
export async function fetchEvents({ period, customRange, platform, selectedPersonas, device } = {}) {
  const params = new URLSearchParams();
  params.set('period', period || '30d');
  params.set('platform', platform || 'combined');
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','));
  if (device) params.set('device', device);
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from);
    params.set('to', customRange.to);
  }

  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events;
}

export async function toggleEventStatus(name) {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(name)}/status`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function createEvent({ name, description, category }) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, category }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add event');
  return data.event;
}

export async function fetchEventDetail(name, { period, customRange, platform, device } = {}) {
  const params = new URLSearchParams();
  params.set('period', period || '30d');
  params.set('platform', platform || 'combined');
  if (device) params.set('device', device);
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from);
    params.set('to', customRange.to);
  }
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(name)}/detail?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch event detail');
  return res.json();
}