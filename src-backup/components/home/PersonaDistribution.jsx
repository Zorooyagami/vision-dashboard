import DonutChart from '../DonutChart'
import { Card } from './shared'


export default function PersonaDistribution({
  selectedCount,
  visiblePersonas,
  donutData,
}) {
  return (
    <Card className="col-span-1 p-5 xl:col-span-2">
      <p className="text-sm font-bold text-slate-900 mb-0.5">Persona Distribution</p>
      <p className="text-xs text-slate-400 mb-4">
        {selectedCount > 0 ? `Filtered · ${selectedCount} persona(s)` : 'Current period · all platforms'}
      </p>

      {donutData.length > 0 ? (
        <>
          <div className="flex justify-center mb-4">
            <DonutChart data={donutData} size={130} thickness={26} />
          </div>
          <div className="space-y-2">
            {visiblePersonas.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-xs text-slate-600 font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">{p.pct}%</span>
                  <span className="text-xs text-slate-500 w-10 text-right">{(p.count / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-32 text-sm text-slate-400">No personas selected</div>
      )}
    </Card>
  )
}