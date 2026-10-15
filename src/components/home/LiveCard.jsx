// src/components/home/LiveCard.jsx
import { Card } from './shared'
import { useLiveStream } from '../../hooks/useLiveStream'
import { LiveBadge, Sparkline, FeedRow } from '../live/liveShared'

export default function LiveCard({ onNavigate }) {
  const { events, active, history, status, now } = useLiveStream()
  const perMin = events.filter((e) => now - e.ts < 60000).length

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-base font-bold text-slate-900">Live now</p>
          <LiveBadge status={status} />
        </div>
        <button
          onClick={() => onNavigate?.('live')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="text-4xl font-bold text-slate-900">{active}</p>
          <p className="mb-2 text-xs text-slate-400">active users · last 5 min</p>
          <Sparkline data={history} />
          <p className="mt-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{perMin}</span> events in the last minute
          </p>
        </div>

        <div className="md:col-span-3">
          {events.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">Waiting for activity…</p>
          ) : (
            events.slice(0, 6).map((ev) => <FeedRow key={ev.id} ev={ev} now={now} />)
          )}
        </div>
      </div>
    </Card>
  )
}
