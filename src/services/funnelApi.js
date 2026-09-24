// services/funnelApi.js
const API_BASE = 'http://localhost:4000/api/admin';

export async function fetchFunnel({ period, customRange, platform, selectedPersonas, device }) {
  const params = new URLSearchParams();
  params.set('period', period);
  params.set('platform', platform);
  if (selectedPersonas?.length) params.set('personas', selectedPersonas.join(','));
  if (device) params.set('device', device);
  if (period === 'custom' && customRange?.from && customRange?.to) {
    params.set('from', customRange.from);
    params.set('to', customRange.to);
  }

  const res = await fetch(`${API_BASE}/funnel?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch funnel');
  return res.json();
}