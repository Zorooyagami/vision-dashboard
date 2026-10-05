

const ALL_METRICS = [
  { category: 'Revenue', items: [
    { id: 'total_rev', label: 'Total Revenue', value: '$600K', change: '+14.2%', pos: true, desc: 'Sum of all revenue across personas and platforms' },
    { id: 'collector_rev', label: 'Collector Revenue Share', value: '43.8%', change: '+1.2%', pos: true, desc: 'Percentage of total revenue from Collector persona' },
    { id: 'loyal_aov', label: 'Loyal User AOV', value: '$143', change: '+$8', pos: true, desc: 'Average order value for Loyal Users' },
    { id: 'revenue_per_session', label: 'Revenue per Session', value: '$2.84', change: '+$0.12', pos: true, desc: 'Total revenue divided by sessions in the period' },
    { id: 'collector_ltv', label: 'Collector 90-day LTV', value: '$812', change: '+$34', pos: true, desc: '90-day lifetime value for Collector segment' },
  ]},
  { category: 'Acquisition & Conversion', items: [
    { id: 'cart_abandon', label: 'Cart Abandonment Rate', value: '68.2%', change: '+2.1%', pos: false, desc: 'Share of carts started but not completed' },
    { id: 'firsttime_conv', label: 'First-Time Buyer Conversion', value: '3.4%', change: '-0.2pp', pos: false, desc: 'Conversion rate for users on their first session' },
    { id: 'mobile_conv', label: 'Mobile Conversion Rate', value: '2.9%', change: '+0.4pp', pos: true, desc: 'Conversion rate on mobile App platform' },
    { id: 'guest_bounce', label: 'Guest Bounce Rate', value: '54%', change: '+3%', pos: false, desc: 'Sessions from Guest users that exit without action' },
    { id: 'new_user_activation', label: 'New User Activation Rate', value: '28%', change: '-1pp', pos: false, desc: 'New users who complete a second event within 7 days' },
  ]},
  { category: 'Retention & Engagement', items: [
    { id: 'app_retention_d7', label: 'App Retention D7', value: '41%', change: '+3pp', pos: true, desc: 'Share of app users active on day 7 after install' },
    { id: 'loyal_retention', label: 'Loyal User Retention', value: '84%', change: '+2pp', pos: true, desc: '30-day retention rate for Loyal User persona' },
    { id: 'collector_30d', label: 'Collector 30-day Return Rate', value: '71%', change: '-1pp', pos: false, desc: 'Collectors who placed a second order within 30 days' },
    { id: 'sessions_per_user', label: 'Sessions per User', value: '4.2', change: '+0.3', pos: true, desc: 'Average sessions per unique user in the period' },
  ]},
]

export default function MetricsPage({ platform, onNavigate }) {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Metrics Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">All tracked metrics — pin any to your Home watchlist</p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg hover:bg-slate-50 transition-colors"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
        <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ borderColor: '#E2E8F0' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-xs text-slate-400">Search metrics…</span>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#6366F1' }}>
            {platform === 'combined' ? 'All Platforms' : platform === 'web' ? 'Web' : 'App'}
          </span>
        </div>
      </div>

      {ALL_METRICS.map(group => (
        <div key={group.category}>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{group.category}</p>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            {group.items.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-slate-900">{m.value}</p>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: m.pos ? '#ECFDF5' : '#FEF2F2', color: m.pos ? '#059669' : '#DC2626' }}
                  >
                    {m.pos ? '↑' : '↓'} {m.change}
                  </span>
                </div>
                <button
                  className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-indigo-50 transition-colors"
                  style={{ borderColor: '#E2E8F0', color: '#6366F1' }}
                  onClick={() => onNavigate('home')}
                  title="Pin to Home watchlist"
                >
                  + Pin
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
