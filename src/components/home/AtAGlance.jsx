import { Link } from 'react-router-dom'
import { useIntelligence } from '../../hooks/useIntelligence'
import { FactList, LoadingError, Icon, Warnings } from '../intelligence/shared'

export default function AtAGlance() {
  const { data, loading, error, retry } = useIntelligence()

  return (
    <section className="vi-card vi-home h-full">
      <div className="vi-cardhead">
        <div className="vi-titlerow">
          <h2>At a glance</h2>
          <span className="vi-spark"><Icon /></span>
        </div>
        <Link to="/at-a-glance" className="vi-viewmore text-xs">View all →</Link>
      </div>

      <LoadingError loading={loading} error={error} retry={retry} />

      {data && (
        <>
          <Warnings data={data} />
          <FactList facts={data.facts.slice(0, 3)} />
          {!data.current.sessions && (
            <p className="vi-note">
              No activity matches this selection. Change the reporting filters.
            </p>
          )}
        </>
      )}
    </section>
  )
}