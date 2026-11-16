import { Link } from 'react-router-dom'
import { useHomeSummary } from '../../hooks/useHomeSummary'
import { FactList, LoadingError, Icon } from '../intelligence/shared'

export default function AtAGlance() {
  const { data, loading, error, retry, personaFiltered } = useHomeSummary()
  return <section className="vi-card vi-home vi-home-compact h-full">
    <div className="vi-cardhead"><div className="vi-titlerow"><h2>At a glance</h2><span className="vi-spark"><Icon /></span></div><Link to="/at-a-glance" className="vi-viewmore text-xs">View all →</Link></div>
    <LoadingError loading={loading} error={error} retry={retry} />
    {data && <><FactList facts={(data.facts || []).slice(0, 2)} />{!data.current.sessions && <p className="vi-note">No tracked sessions in the selected period.</p>}{personaFiltered && <p className="vi-note">This overview is project-wide. Open a detailed report for persona-specific analysis.</p>}</>}
  </section>
}
