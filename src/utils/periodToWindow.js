// utils/periodToWindow.js
const PERIOD_TO_WINDOW = {
  '1d': '1d',
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
  '180d': '180d',
  // adjust left-hand side to match your actual useFilters period values, e.g.:
  // today: '1d', week: '7d', month: '30d', quarter: '90d', halfyear: '180d',
};

export function periodToWindow(period) {
  return PERIOD_TO_WINDOW[period] || '7d'; // sensible fallback
}