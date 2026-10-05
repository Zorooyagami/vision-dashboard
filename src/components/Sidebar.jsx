import { useState, useEffect } from 'react'
import VisionLogo from './VisionLogo'


function HomeIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}
function ProjectsIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 5V3m8 2V3M4 10h16" /></svg>
}
function FunnelIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V20a1 1 0 01-.553.894l-4-2A1 1 0 018 18v-4.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
}
function ExploreIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
}
function RevenueIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function PersonasIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function BehaviorIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
}
function DecisionIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
}
function AlertIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
}
function SettingsIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}

const NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'projects', label: 'Projects', icon: ProjectsIcon },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { id: 'conversion', label: 'Conversion', icon: FunnelIcon },
      { id: 'explore', label: 'Explore', icon: ExploreIcon },
      { id: 'revenue', label: 'Revenue', icon: RevenueIcon },
      { id: 'personas', label: 'Personas', icon: PersonasIcon },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { id: 'tools', label: 'Behavior', icon: BehaviorIcon },
      { id: 'decisions', label: 'Decisions', icon: DecisionIcon },
      { id: 'alerts', label: 'Alerts & Insights', icon: AlertIcon },
    ],
  },
  {
    label: 'ADMIN',
    items: [{ id: 'settings', label: 'Settings', icon: SettingsIcon }],
  },
]

export default function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setCollapsed(e.matches)
    setCollapsed(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <aside
      className="flex flex-col h-screen shrink-0 transition-all duration-200"
      style={{ width: collapsed ? 56 : 220, background: '#0F1117', borderRight: '1px solid #1E2230' }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center px-3 py-4 shrink-0" style={{ borderBottom: '1px solid #1E2230', minHeight: 57 }}>
        <div className="shrink-0">
          <VisionLogo size={28} theme="color" showWordmark={!collapsed} wordmarkColor="#fff" />
        </div>
        {!collapsed && (
          <div className="ml-auto shrink-0">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#1E2230', color: '#6366F1' }}>BETA</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="shrink-0 rounded-md p-2 transition-colors hover:bg-white/5 touch-target"
          style={{ color: '#94A3B8', marginLeft: collapsed ? 0 : 4 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {NAV.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[11px] font-semibold tracking-widest px-2 mb-1.5" style={{ color: '#64748B' }}>{section.label}</p>
            )}
            {collapsed && <div className="h-px mx-1 mb-2" style={{ background: '#1E2230' }} />}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const isActive = active === item.id
                return (
                  <li key={item.id} className="relative group">
                    <button
                      onClick={() => onNavigate(item.id)}
                      className="w-full flex items-center rounded-lg text-sm font-medium transition-all"
                      style={{
                        gap: collapsed ? 0 : 10,
                        padding: collapsed ? '8px' : '8px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: isActive ? '#fff' : '#94A3B8',
                        background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                        borderLeft: collapsed ? 'none' : `2px solid ${isActive ? '#6366F1' : 'transparent'}`,
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget).style.color = '#CBD5E1' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget).style.color = '#94A3B8' }}
                    >
                      <span className="shrink-0"><item.icon /></span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.id === 'alerts' && (
                        <span className="ml-auto text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: '#EF4444', color: '#fff' }}>3</span>
                      )}
                      {collapsed && item.id === 'alerts' && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                      )}
                    </button>
                    {collapsed && (
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
                        style={{ background: '#1E293B' }}>
                        {item.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 shrink-0" style={{ borderTop: '1px solid #1E2230' }}>
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center rounded-lg transition-all hover:bg-white/5 group relative"
          style={{ gap: collapsed ? 0 : 10, padding: collapsed ? '10px 8px' : '10px', justifyContent: collapsed ? 'center' : 'flex-start', marginTop: 12 }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>AP</div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white text-xs font-medium truncate">Andy Phillips</p>
                <p className="text-[11px] truncate" style={{ color: '#64748B' }}>Analytics Admin</p>
              </div>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#64748B" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </>
          )}
          {collapsed && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
              style={{ background: '#1E293B' }}>
              Settings
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
