export const PERSONA_FALLBACK = {
  loyal: {
    name: 'Loyal',
    icon: '◆',
    color: '#6366F1',
    lightBg: '#EEF2FF',
    textColor: '#4338CA',
    desc: 'Returning customers with a strong purchase history.',
  },
  firsttime: {
    name: 'First-time',
    icon: '✦',
    color: '#0EA5E9',
    lightBg: '#F0F9FF',
    textColor: '#0369A1',
    desc: 'Newly signed-up customers in the selected period.',
  },
  active: {
    name: 'Active',
    icon: '●',
    color: '#14B8A6',
    lightBg: '#F0FDFA',
    textColor: '#0F766E',
    desc: 'Known customers who are actively engaging with the store.',
  },
  guest: {
    name: 'Guest',
    icon: '○',
    color: '#F59E0B',
    lightBg: '#FFFBEB',
    textColor: '#B45309',
    desc: 'Anonymous visitors who have not signed in.',
  },
}

export function formatCompact(value = 0) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)
}

export function formatCurrency(value = 0) {
  const number = Number(value) || 0

  if (Math.abs(number) >= 1000000) {
    return `$${(number / 1000000).toFixed(2)}M`
  }

  if (Math.abs(number) >= 1000) {
    return `$${(number / 1000).toFixed(number >= 100000 ? 0 : 1)}K`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatPercent(value, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback
  }

  return `${Number(value).toFixed(1).replace(/\.0$/, '')}%`
}

export function formatTrend(value = 0) {
  const number = Number(value) || 0
  if (number === 0) return '0%'
  return `${number > 0 ? '+' : ''}${number.toFixed(1).replace(/\.0$/, '')}%`
}
