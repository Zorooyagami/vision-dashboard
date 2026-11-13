import { useLocation, useNavigate } from 'react-router-dom'

/** Route-backed tabs: direct links, browser history and filters all survive switching. */
export default function SectionTabs({ tabs, children }) {
  const location = useLocation()
  const navigate = useNavigate()
  return <div className="flex flex-col min-h-full">
    <nav aria-label="Section tabs" className="flex shrink-0 flex-wrap gap-1 border-b border-slate-200 bg-white px-4 sm:px-6">
      {tabs.map(t => <button type="button" key={t.path}
        aria-current={location.pathname === t.path ? 'page' : undefined}
        onClick={() => navigate(t.path)}
        className={`px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${location.pathname === t.path ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t.label}</button>)}
    </nav>{children}
  </div>
}
