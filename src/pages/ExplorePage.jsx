import { useState } from 'react'
import EventsTab from '../components/explore/events/EventsTab'
import FunnelsTab from '../components/explore/funnels/FunnelsTab'
import QueryBuilderTab from '../components/explore/query/QueryBuilderTab'
import JourneysTab from '../components/explore/journeys/JourneysTab'
import UsersTab from '../components/explore/users/UsersTab'


const TABS = [
  { id: 'events',   label: 'Events' },
  { id: 'users',  label: 'Users' },
  { id: 'funnels',  label: 'Funnels' },
  // { id: 'query',    label: 'Query Builder' },
  { id: 'journeys', label: 'Journeys' },
]

export default function ExplorePage({ platform, selectedPersonas }) {
  const [tab, setTab] = useState('events')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-nav */}
      <div className="bg-white border-b shrink-0" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-0 overflow-x-auto px-3 sm:px-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-3.5 text-sm font-semibold transition-colors relative"
              style={{ color: tab === t.id ? '#6366F1' : '#64748B' }}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#6366F1' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'events'   && <EventsTab />}
      {tab === 'users'   && <UsersTab />}
      {tab === 'funnels'  && <FunnelsTab />}
      {tab === 'query'    && <QueryBuilderTab />}
      {tab === 'journeys' && <JourneysTab selectedPersonas={selectedPersonas} />}
    </div>
  )
}
