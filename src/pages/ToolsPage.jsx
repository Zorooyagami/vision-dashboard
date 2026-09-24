import { useState } from 'react'
import HeatmapPage from '../components/tools/heatmaps/HeatmapPage'
import SessionReplayPage from '../components/tools/replay/SessionReplayPage'

export default function ToolsPage({ platform, selectedPersonas }) {
  const [tab, setTab] = useState('heatmaps')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b shrink-0" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center px-6">
          {([['heatmaps', 'Heatmaps'], ['replay', 'Session Replay']]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-3.5 text-sm font-semibold transition-colors relative"
              style={{ color: tab === id ? '#6366F1' : '#64748B' }}
            >
              {label}
              {tab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#6366F1' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'heatmaps' && <HeatmapPage platform={platform} selectedPersonas={selectedPersonas} />}
      {tab === 'replay'   && <SessionReplayPage selectedPersonas={selectedPersonas} />}
    </div>
  )
}
