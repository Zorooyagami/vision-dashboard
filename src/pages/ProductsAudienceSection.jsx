import { Outlet } from 'react-router-dom'
import SectionTabs from '../components/layout/SectionTabs'
export default function ProductsAudienceSection() {
 return <SectionTabs tabs={[
  { path:'/products-audience', label:'Products' },
  { path:'/products-audience/audience', label:'Audience' },
 ]}><Outlet /></SectionTabs>
}
