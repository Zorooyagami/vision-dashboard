import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import PersonasPage from './pages/Personas'
import DecisionsPage from './pages/Decisions'
import RevenuePage from './pages/Revenue'
import AlertsPage from './pages/Alerts'
import ConversionPage from './pages/Conversion'
import SettingsPage from './pages/Settings'
import MetricsPage from './pages/Metrics'
import ToolsPage from './pages/ToolsPage'
import ExplorePage from './pages/ExplorePage'
import VisionLogo from './components/VisionLogo'
import { FiltersProvider, useFilters } from './context/FiltersContext'
import TopbarHost from './components/TopbarHost'

const SCREEN_TITLES = {
  home: 'Overview',
  personas: 'Personas Explorer',
  decisions: 'Decision Tracking',
  revenue: 'Revenue by Persona',
  alerts: 'Alerts & Insights',
  conversion: 'Conversion Funnel',
  settings: 'Settings',
  metrics: 'Metrics Library',
  tools: 'Behavior',
  explore: 'Explore',
}

const SEED_DECISIONS = [
  {
    id: 1, title: 'Free shipping threshold raised to $75', date: 'Jun 15, 2026', month: 'Jun',
    owner: 'Andy Phillips', ownerInitials: 'AP', hypothesis: 'Raising the free shipping threshold from $50 to $75 will increase AOV for Loyal Users without significantly impacting conversion rate.',
    metric: 'Avg Order Value', personas: ['loyal'], outcome: 'success',
    before: [118, 122, 119, 123, 121, 120], after: [126, 131, 134, 138, 142, 143], unit: '$',
  },
  {
    id: 2, title: 'Collector loyalty rewards program launch', date: 'May 8, 2026', month: 'May',
    owner: 'Neil Majithia', ownerInitials: 'NM', hypothesis: 'Introducing a points-based loyalty program for Collectors will improve 30-day retention from 71% to 80%.',
    metric: 'Retention Rate', personas: ['collector'], outcome: 'success',
    before: [68, 70, 71, 69, 72, 71], after: [74, 77, 79, 81, 82, 84], unit: '%',
  },
  {
    id: 3, title: 'Guest checkout flow redesign', date: 'Jun 28, 2026', month: 'Jun',
    owner: 'Luci Fitzpatrick', ownerInitials: 'LF', hypothesis: 'Simplifying the guest checkout to 2 steps will increase Guest User conversion rate.',
    metric: 'Conversion Rate', personas: ['guest'], outcome: 'neutral',
    before: [1.6, 1.8, 1.7, 1.9, 1.8, 1.8], after: [1.9, 2.0, 1.9, 2.1, 2.0, 2.1], unit: '%',
  },
  {
    id: 4, title: 'App-exclusive flash sale for Active Users', date: 'Jul 3, 2026', month: 'Jul',
    owner: 'Farhan Samnakay', ownerInitials: 'FS', hypothesis: 'A 24-hour app-exclusive flash sale will accelerate Active Users toward their second+ order.',
    metric: 'Orders per User', personas: ['active'], outcome: 'failed',
    before: [1.2, 1.3, 1.2, 1.4, 1.3, 1.3], after: [1.3, 1.2, 1.3, 1.2, 1.4, 1.3], unit: '',
  },
]

function AppInner() {
  const [screen, setScreen] = useState('home')
  const { platform, selectedPersonas } = useFilters()

  const [decisions, setDecisions] = useState([]) // however you already have this

  const [settingsTab, setSettingsTab] = useState('thresholds')
  const [decisionPrefill, setDecisionPrefill] = useState()
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('vision-welcomed'))

  useEffect(() => {
    if (!showWelcome) sessionStorage.setItem('vision-welcomed', '1')
  }, [showWelcome])

  const addDecision = (d) => setDecisions(prev => [d, ...prev])
  const onNavigate = () =>{}
  const onLogDecision = () =>{}
  const navigateTo = (s, extra) => {
    setScreen(s)
    if (extra?.settingsTab) setSettingsTab(extra.settingsTab)
    if (s === 'decisions') setDecisionPrefill(undefined)
  }

  const navigateToDecisions = (prefill) => {
    setDecisionPrefill(prefill)
    setScreen('decisions')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      {false && showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,17,23,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F8FAFC 100%)' }}>
              <div className="flex justify-center mb-5">
                <VisionLogo size={56} theme="color" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Vision</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Your AI-powered analytics platform for understanding customer personas, tracking decisions, and growing revenue.</p>
            </div>
            <div className="px-8 py-6 space-y-3">
              {[
                ['Persona Intelligence', 'See which customer segments drive the most value'],
                ['Decision Tracking', 'Measure the before/after impact of every team decision'],
                ['Revenue Breakdown', 'Understand revenue by persona across all platforms'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: '#EEF2FF', color: '#6366F1' }}>✓</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-8 pb-8">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                Explore Vision
              </button>
            </div>
          </div>
        </div>
      )}
      <Sidebar active={screen} onNavigate={s => navigateTo(s)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
               <TopbarHost />

        <main className="flex-1 overflow-y-auto" style={{ background: '#F4F6FB' }}>
          {screen === 'home' && (
                  <Home decisions={decisions} onNavigate={onNavigate} onLogDecision={onLogDecision} />

          )}
          {screen === 'personas' && (
            <PersonasPage onNavigateSettings={() => navigateTo('settings', { settingsTab: 'thresholds' })} />
          )}
          {screen === 'decisions' && (
            <DecisionsPage decisions={decisions} onAddDecision={addDecision} prefill={decisionPrefill} />
          )}
          {screen === 'revenue' && (
            <RevenuePage platform={platform} selectedPersonas={selectedPersonas} />
          )}
          {screen === 'alerts' && (
            <AlertsPage
              onNavigateSettings={() => navigateTo('settings', { settingsTab: 'thresholds' })}
              onNavigateDecisions={navigateToDecisions}
            />
          )}
          {screen === 'conversion' && (
            <ConversionPage platform={platform} selectedPersonas={selectedPersonas} />
          )}
          {screen === 'settings' && (
            <SettingsPage initialTab={settingsTab} />
          )}
          {screen === 'metrics' && (
            <MetricsPage platform={platform} onNavigate={navigateTo} />
          )}
          {screen === 'explore' && (
            <ExplorePage platform={platform} selectedPersonas={selectedPersonas} />
          )}
          {screen === 'tools' && (
            <ToolsPage platform={platform} selectedPersonas={selectedPersonas} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <FiltersProvider>
      <AppInner />
    </FiltersProvider>
  )
}
