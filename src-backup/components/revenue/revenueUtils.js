// src/components/revenue/revenueUtils.js
export function fmtRev(n) {
  return n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`
}