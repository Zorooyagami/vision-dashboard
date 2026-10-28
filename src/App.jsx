// src/App.jsx

import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import Live from './pages/Live'
import Sidebar from './components/Sidebar'
import TopbarHost from './components/TopbarHost'

import Home from './pages/Home'
import PersonasPage from './pages/Personas'
import DecisionsPage from './pages/Decisions'
import RevenuePage from './pages/Revenue'
import RevenueOpportunityRadar from './pages/RevenueOpportunityRadar'
import AlertsPage from './pages/Alerts'
import ConversionPage from './pages/Conversion'
import SettingsPage from './pages/Settings'
import MetricsPage from './pages/Metrics'
import ToolsPage from './pages/ToolsPage'
import ExplorePage from './pages/ExplorePage'
import AuthPage from './pages/AuthPage'

import CreateProject from './components/projects/CreateProject'
import ProjectsPage from './components/projects/ProjectsPage'
import RequireProject from './components/projects/RequireProject'
import RequireAuth from './components/RequireAuth'

import AtAGlancePage from './pages/AtAGlance'
import AskDashboard from './pages/AskDashboard'
import RevenueInvestigator from './pages/RevenueInvestigator'
import JourneyComparison from './pages/JourneyComparison'
import ProductIntelligence from './pages/ProductIntelligence'
import AudienceIntelligence from './pages/AudienceIntelligence'

import {
  FiltersProvider,
  useFilters,
} from './context/FiltersContext'

import {
  ProjectProvider,
  useProject,
} from './context/ProjectContext'

const SCREEN_TITLES = {
  home: 'Overview',
  'at-a-glance': 'At a glance',
  'ask-dashboard': 'Ask the dashboard',
  'revenue-investigator': 'Revenue investigator',
  'journey-comparison': 'Journey comparison',
  personas: 'Personas Explorer',
  decisions: 'Decision Tracking',
  revenue: 'Revenue by Persona',
  opportunities: 'Revenue Opportunity Radar',
  products: 'Product Intelligence',
  audience: 'Audience Intelligence',
  alerts: 'Alerts & Insights',
  conversion: 'Conversion Funnel',
  settings: 'Settings',
  metrics: 'Metrics Library',
  tools: 'Behavior',
  explore: 'Explore',
  projects: 'Projects',
  live: 'Live',
}

/* =========================================================
   AUTHENTICATED APP
========================================================= */

function AuthenticatedApp() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    platform,
    selectedPersonas,
  } = useFilters()

  const {
    projectId,
  } = useProject()

  /*
   * Examples:
   *
   * /home            -> home
   * /revenue         -> revenue
   * /projects        -> projects
   * /projects/create -> projects
   */
  const screen =
    location.pathname
      .slice(1)
      .split('/')[0] ||
    'home'

  const [
    decisions,
    setDecisions,
  ] = useState([])

  const [
    settingsTab,
    setSettingsTab,
  ] = useState('thresholds')

  const [
    decisionPrefill,
    setDecisionPrefill,
  ] = useState()

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const addDecision = (decision) => {
    setDecisions((current) => [
      decision,
      ...current,
    ])
  }

  const navigateTo = (
    screenName,
    extra
  ) => {
    if (extra?.settingsTab) {
      setSettingsTab(
        extra.settingsTab
      )
    }

    if (
      screenName ===
      'decisions'
    ) {
      setDecisionPrefill(
        undefined
      )
    }

    navigate(
      `/${screenName}`
    )
  }

  const navigateToDecisions = (
    prefill
  ) => {
    setDecisionPrefill(
      prefill
    )

    navigate(
      '/decisions'
    )
  }

  const onNavigate = (
    screenName
  ) => {
    navigateTo(
      screenName
    )
  }

  const onLogDecision = (
    prefill
  ) => {
    navigateToDecisions(
      prefill
    )
  }

  /* =======================================================
     LAYOUT
  ======================================================= */

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* SIDEBAR */}

      <Sidebar
        active={screen}
        onNavigate={
          navigateTo
        }
      />

      {/* MAIN APP */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        <TopbarHost
          title={
            SCREEN_TITLES[
              screen
            ] || 'Vision'
          }
          showFilters={
            !location.pathname.startsWith(
              '/projects'
            )
          }
        />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            background:
              '#F4F6FB',
          }}
        >
          <Routes
            key={
              projectId ||
              'no-project'
            }
          >

            {/* =============================================
                PROJECTS

                User is logged in,
                but project selection is NOT required.
            ============================================= */}

            <Route
              path="/projects"
              element={
                <ProjectsPage />
              }
            />

            <Route
              path="/projects/create"
              element={
                <CreateProject />
              }
            />

            {/* =============================================
                PROJECT-SCOPED DASHBOARD

                These routes require an active project.
            ============================================= */}

            <Route
              element={
                <RequireProject />
              }
            >

              <Route
                path="/home"
                element={
                  <Home
                    decisions={
                      decisions
                    }
                    onNavigate={
                      onNavigate
                    }
                    onLogDecision={
                      onLogDecision
                    }
                  />
                }
              />

              <Route
                              path="/at-a-glance" element={<AtAGlancePage />} />
                            <Route path="/ask-dashboard" element={<AskDashboard />} />
                            <Route path="/revenue-investigator" element={<RevenueInvestigator />} />
                            <Route path="/journey-comparison" element={<JourneyComparison />} />
                            <Route path="/products" element={<ProductIntelligence />} />
                            <Route path="/audience" element={<AudienceIntelligence />} />
                            <Route path="/live"
                              element={<Live onNavigate={onNavigate} />}
                            />
                          
            
              <Route
                path="/personas"
                element={
                  <PersonasPage
                    onNavigateSettings={() =>
                      navigateTo(
                        'settings',
                        {
                          settingsTab:
                            'thresholds',
                        }
                      )
                    }
                  />
                }
              />

              <Route
                path="/decisions"
                element={
                  <DecisionsPage
                    decisions={
                      decisions
                    }
                    onAddDecision={
                      addDecision
                    }
                    prefill={
                      decisionPrefill
                    }
                  />
                }
              />

              <Route
                path="/opportunities"
                element={<RevenueOpportunityRadar />}
              />

              <Route
                path="/revenue"
                element={
                  <RevenuePage
                    platform={
                      platform
                    }
                    selectedPersonas={
                      selectedPersonas
                    }
                  />
                }
              />

              <Route
                path="/alerts"
                element={
                  <AlertsPage
                    onNavigateSettings={() =>
                      navigateTo(
                        'settings',
                        {
                          settingsTab:
                            'thresholds',
                        }
                      )
                    }
                    onNavigateDecisions={
                      navigateToDecisions
                    }
                  />
                }
              />

              <Route
                path="/conversion"
                element={
                  <ConversionPage
                    platform={
                      platform
                    }
                    selectedPersonas={
                      selectedPersonas
                    }
                  />
                }
              />

              <Route
                path="/settings"
                element={
                  <SettingsPage
                    initialTab={
                      settingsTab
                    }
                  />
                }
              />

              <Route
                path="/metrics"
                element={
                  <MetricsPage
                    platform={
                      platform
                    }
                    onNavigate={
                      navigateTo
                    }
                  />
                }
              />

              <Route
                path="/explore"
                element={
                  <ExplorePage
                    platform={
                      platform
                    }
                    selectedPersonas={
                      selectedPersonas
                    }
                  />
                }
              />

              <Route
                path="/tools/*"
                element={
                  <ToolsPage
                    platform={
                      platform
                    }
                    selectedPersonas={
                      selectedPersonas
                    }
                  />
                }
              />

            </Route>

            {/* =============================================
                DEFAULT
            ============================================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to={
                    projectId
                      ? '/home'
                      : '/projects'
                  }
                  replace
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to={
                    projectId
                      ? '/home'
                      : '/projects'
                  }
                  replace
                />
              }
            />

          </Routes>
        </main>

      </div>
    </div>
  )
}

/* =========================================================
   ROOT ROUTING

   Login/signup live OUTSIDE the dashboard layout.
========================================================= */

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC AUTH ROUTES */}

      <Route
        path="/"
        element={
          <AuthPage
            view="signin"
          />
        }
      />

      <Route
        path="/signup"
        element={
          <AuthPage
            view="signup"
          />
        }
      />

      {/* ===============================================
          EVERYTHING ELSE REQUIRES LOGIN
      =============================================== */}

      <Route
        element={
          <RequireAuth />
        }
      >
        <Route
          path="/*"
          element={
            <AuthenticatedApp />
          }
        />
      </Route>

    </Routes>
  )
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>

      <ProjectProvider>

        <FiltersProvider>

          <AppRoutes />

        </FiltersProvider>

      </ProjectProvider>

    </BrowserRouter>
  )
}