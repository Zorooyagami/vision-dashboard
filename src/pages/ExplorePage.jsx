import { useLocation, useNavigate } from 'react-router-dom'
import EventsTab from '../components/explore/events/EventsTab'
import FunnelsTab from '../components/explore/funnels/FunnelsTab'
import QueryBuilderTab from '../components/explore/query/QueryBuilderTab'
import JourneysTab from '../components/explore/journeys/JourneysTab'
import UsersTab from '../components/explore/users/UsersTab'
import ConversionPage from './Conversion'
import JourneyComparison from './JourneyComparison'

const TABS = [
  { path: '/explore', label: 'Events' },
  { path: '/explore/users', label: 'Users' },
  { path: '/explore/funnels', label: 'Funnels' },
  { path: '/explore/query', label: 'Query Builder' },
  { path: '/explore/journey', label: 'Journey' },
]
const SUBTABS = {
  '/explore/funnels': [
    {path:'/explore/funnels',label:'Conversion Funnel'},
    {path:'/explore/funnels/custom',label:'Custom Funnels'},
  ],
  '/explore/journey': [
    {path:'/explore/journey',label:'Journey Comparison'},
    {path:'/explore/journey/flow',label:'Customer Journey Flow'},
  ],
}
export default function ExplorePage() {
 const location=useLocation(),navigate=useNavigate(),path=location.pathname
 const group=path.startsWith('/explore/funnels')?'/explore/funnels':path.startsWith('/explore/journey')?'/explore/journey':path
 return <div className="flex flex-col min-h-full">
  <nav aria-label="Explore tabs" className="flex flex-wrap border-b bg-white px-3 sm:px-6">
   {TABS.map(t=><button key={t.path} type="button" onClick={()=>navigate(t.path)} className={`px-4 py-3 text-sm font-semibold border-b-2 ${group===t.path?'border-indigo-500 text-indigo-600':'border-transparent text-slate-500'}`}>{t.label}</button>)}
  </nav>
  {SUBTABS[group] && <nav aria-label={`${group==='/explore/funnels'?'Funnels':'Journey'} sub-tabs`} className="flex flex-wrap gap-2 bg-white px-4 py-2 border-b border-slate-100">
   {SUBTABS[group].map(t=><button type="button" key={t.path} onClick={()=>navigate(t.path)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${path===t.path?'bg-indigo-50 text-indigo-600':'text-slate-500 hover:bg-slate-100'}`}>{t.label}</button>)}
  </nav>}
  {path==='/explore' && <EventsTab />}
  {path==='/explore/users' && <UsersTab />}
  {path==='/explore/funnels' && <ConversionPage />}
  {path==='/explore/funnels/custom' && <FunnelsTab />}
  {path==='/explore/query' && <QueryBuilderTab />}
  {path==='/explore/journey' && <JourneyComparison />}
  {path==='/explore/journey/flow' && <JourneysTab />}
 </div>
}
