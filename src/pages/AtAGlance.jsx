import { useHomeSummary } from '../hooks/useHomeSummary'
import { LoadingError, Page, Stat, FactList, number, Definition } from '../components/intelligence/shared'
export default function AtAGlancePage() {
  const { data, loading, error, retry, personaFiltered } = useHomeSummary()
  return <Page title="At a glance" subtitle="A quick summary of observed activity in the selected period." data={null}>
    <LoadingError loading={loading} error={error} retry={retry}/>
    {data && <><div className="vi-stats">
      <Stat title="Sessions" value={number(data.current.sessions)} detail="Distinct tracked session IDs" />
      <Stat title="Events" value={number(data.current.events)} detail="Tracked analytics events" />
      <Stat title="Sessions with purchase" value={number(data.current.purchasingSessions)} detail="Not verified payments" />
    </div><section className="vi-card"><FactList facts={data.facts || []}/>{!data.facts?.length && <p className="vi-note">No tracked sessions were found for this selection. Try another reporting period or check SDK ingestion.</p>}</section>
    <Definition>Sessions are distinct session IDs. Purchasing sessions contain a tracked purchase event; this does not confirm settlement. {personaFiltered && 'This quick summary is project-wide; persona filtering is supported by the detailed reports.'}</Definition></>}
  </Page>
}
