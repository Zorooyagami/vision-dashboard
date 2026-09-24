
export const REVENUE_BASE = [
  { label: 'Feb', web: 284, app: 148, combined: 432 },
  { label: 'Mar', web: 312, app: 165, combined: 477 },
  { label: 'Apr', web: 298, app: 178, combined: 476 },
  { label: 'May', web: 334, app: 190, combined: 524 },
  { label: 'Jun', web: 358, app: 208, combined: 566 },
  { label: 'Jul', web: 376, app: 224, combined: 600 },
]

export const KPI_MULT = {
  web: { rev: 0.63, users: 0.68, conv: 0.58, aov: 1.08 },
  app: { rev: 0.37, users: 0.32, conv: 0.42, aov: 0.92 },
  combined: { rev: 1, users: 1, conv: 1, aov: 1 },
}

export const OUTCOME_MARKERS = {
  success: 'success',
  neutral: 'neutral',
  failed: 'failed',
  pending: 'neutral',
}

export const LEADERBOARD = [
  // { id: 'collector', revenue: '$2.28M', conv: '9.8%', dir: 'up' },
  { id: 'loyal', revenue: '$1.84M', conv: '11.2%', dir: 'up' },
  { id: 'active', revenue: '$624K', conv: '5.6%', dir: 'up' },
  { id: 'guest', revenue: '$3421K', conv: '1.8%', dir: 'flat' },
  { id: 'firsttime', revenue: '$284K', conv: '3.4%', dir: 'up' },
]

export const KPI_LABELS = ['Revenue', 'Active Users', 'Conversion', 'Avg Order']
export const KPI_DEFS = [
  'Total revenue across all personas',
  'Unique users in the selected period',
  'Share of sessions ending in purchase',
  'Average value per completed order',
]

export const KPI_OPTIONS = [
  { id: 'cart_abandon', label: 'Cart abandonment rate', value: '68.2%', change: '+2.1%', pos: false, spark: [62, 64, 65, 66, 67, 67, 68] },
  { id: 'collector_rev', label: 'Collector revenue share', value: '43.8%', change: '+1.2%', pos: true, spark: [40, 41, 41, 42, 43, 43, 44] },
  { id: 'app_retention_d7', label: 'App retention D7', value: '41%', change: '+3pp', pos: true, spark: [35, 36, 37, 38, 39, 40, 41] },
  { id: 'firsttime_conv', label: 'First-time buyer conversion', value: '3.4%', change: '-0.2pp', pos: false, spark: [3.8, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4] },
  { id: 'loyal_aov', label: 'Loyal User AOV', value: '$143', change: '+$8', pos: true, spark: [128, 131, 134, 136, 139, 141, 143] },
  { id: 'guest_bounce', label: 'Guest bounce rate', value: '54%', change: '+3%', pos: false, spark: [48, 49, 50, 51, 52, 53, 54] },
  { id: 'revenue_per_session', label: 'Revenue per session', value: '$2.84', change: '+$0.12', pos: true, spark: [2.6, 2.65, 2.7, 2.72, 2.76, 2.80, 2.84] },
  { id: 'mobile_conv', label: 'Mobile conversion rate', value: '2.9%', change: '+0.4pp', pos: true, spark: [2.4, 2.5, 2.6, 2.65, 2.7, 2.8, 2.9] },
  { id: 'collector_ltv', label: 'Collector 90-day LTV', value: '$812', change: '+$34', pos: true, spark: [760, 772, 782, 790, 798, 806, 812] },
  { id: 'new_user_activation', label: 'New user activation rate', value: '28%', change: '-1pp', pos: false, spark: [31, 30, 30, 29, 29, 28, 28] },
  { id: 'sessions_per_user', label: 'Sessions per user', value: '4.2', change: '+0.3', pos: true, spark: [3.7, 3.8, 3.9, 3.9, 4.0, 4.1, 4.2] },
  { id: 'loyal_retention', label: 'Loyal User retention (30d)', value: '84%', change: '+2pp', pos: true, spark: [79, 80, 81, 82, 82, 83, 84] },
]


export const DEFAULT_PINNED = ['cart_abandon', 'collector_rev', 'app_retention_d7']

export const AI_INSIGHTS = [
  {
    id: 1,
    sentiment: 'positive',
    text: 'Collectors on App are 2.1× more likely to complete checkout than last week.',
    timestamp: '2 hours ago',
    screen: 'personas',
    decisionTitle: 'Replicate Collector App checkout improvements site-wide',
    decisionMetric: 'Conversion Rate',
    decisionPersonas: ['collector'],
  },
  {
    id: 2,
    sentiment: 'negative',
    text: 'Guest User sessions dropped 15% after the homepage redesign — investigate bounce rate.',
    timestamp: '2 hours ago',
    screen: 'conversion',
    decisionTitle: 'Fix Guest User bounce rate after homepage redesign',
    decisionMetric: 'Conversion Rate',
    decisionPersonas: ['guest'],
  },
  {
    id: 3,
    sentiment: 'positive',
    text: 'Loyal Users drove 34% of total revenue in July, up from 28% in June.',
    timestamp: '3 hours ago',
    screen: 'revenue',
    decisionTitle: 'Accelerate Loyal User revenue share with targeted campaign',
    decisionMetric: 'Revenue',
    decisionPersonas: ['loyal'],
  },
  {
    id: 4,
    sentiment: 'neutral',
    text: 'First-Time Buyer conversion is flat week-over-week — consider a welcome offer.',
    timestamp: '5 hours ago',
    screen: 'alerts',
    decisionTitle: 'Launch welcome offer to lift First-Time Buyer conversion',
    decisionMetric: 'Conversion Rate',
    decisionPersonas: ['firsttime'],
  },
]


export const SENTIMENT_DOT = {
  positive: { color: '#10B981', bg: '#ECFDF5' },
  negative: { color: '#EF4444', bg: '#FEF2F2' },
  neutral: { color: '#F59E0B', bg: '#FFFBEB' },
}

export const FUNNEL_STEPS = [
  { label: 'view_item',      users: 276800, pct: 100 },
  { label: 'add_to_cart',    users: 184200, pct: 67 },
  { label: 'begin_checkout', users: 96800,  pct: 35 },
  { label: 'purchase',       users: 64800,  pct: 23 },
]