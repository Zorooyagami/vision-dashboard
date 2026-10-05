import MiniSparkline from '../MiniSparkline'
import { Card, InfoIcon, RevenueIcon, UsersIcon, ConversionIcon, AovIcon } from './shared'

const ICONS = [<RevenueIcon key="r" />, <UsersIcon key="u" />, <ConversionIcon key="c" />, <AovIcon key="a" />]

function KpiCard({ icon, label, def, value, change, pos, spark }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{icon}</span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
          <InfoIcon tooltip={def} />
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: pos ? '#ECFDF5' : '#FEF2F2', color: pos ? '#047857' : '#B91C1C' }}
        >
          {change}
        </span>
      </div>
      <p className="text-[28px] font-black tracking-tight text-slate-900 leading-none">{value}</p>
      <div className="flex items-end justify-between mt-3">
        <p className="text-xs text-slate-500">vs last month</p>
        <MiniSparkline data={spark} color="#6366F1" width={56} height={22} />
      </div>
    </Card>
  )
}

function KpiCardSkeleton() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="h-3 w-20 bg-slate-200 rounded mb-4" />
      <div className="h-7 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-4 w-full bg-slate-100 rounded" />
    </Card>
  )
}

export default function KpiRow({ kpis, loading, error }) {
  if (error) {
    return (
      <div className="grid grid-cols-4 gap-4 kpi-grid">
        <Card className="col-span-2 p-5 text-sm text-red-600 md:col-span-4">
          Couldn't load KPIs: {error.message ?? String(error)}
        </Card>
      </div>
    )
  }

  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-4 gap-4 kpi-grid">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4 kpi-grid">
      {kpis.map((k, i) => (
        <KpiCard key={k.label} icon={ICONS[i]} {...k} />
      ))}
    </div>
  )
}