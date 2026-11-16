import { Outlet } from 'react-router-dom'
import SectionTabs from '../components/layout/SectionTabs'

export default function RevenueSection() {
  return (
    <SectionTabs tabs={[
      { path: '/revenue', label: 'Revenue by Persona' },
      { path: '/revenue/opportunity-radar', label: 'Revenue Opportunity Radar' },
      { path: '/revenue/investigator', label: 'Revenue Investigator' },
    ]}>
      <Outlet />
    </SectionTabs>
  )
}
