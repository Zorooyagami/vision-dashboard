// services/journeyApi.js
const API_BASE = 'http://localhost:4000/api/admin';

function buildParams({ period, customRange, platform, selectedPersonas, device }) {
  const params = new URLSearchParams();
  params.set('period', period);
  params.set('platform', platform);
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','));
  if (device) params.set('device', device);
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from);
    params.set('to', customRange.to);
  }
  return params;
}

export async function fetchTopPaths(filters, limit = 4) {
  const params = buildParams(filters);
  params.set('limit', limit);
  const res = await fetch(`${API_BASE}/journeys/top-paths?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch top paths');
  return res.json();
}

export async function fetchPathDetail(filters, nodes) {
  const params = buildParams(filters);
  params.set('path', nodes.join(','));
  const res = await fetch(`${API_BASE}/journeys/path-detail?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch path detail');
  return res.json();
}

export async function fetchJourneyFlow(filters) {
  const params = buildParams(filters);
  const res = await fetch(`${API_BASE}/journeys/flow?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch journey flow');
  return res.json();
}