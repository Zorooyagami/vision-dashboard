
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts'

function formatDateLabel(value) {
  if (!value) return ''

  // Already formatted labels such as "Jul 01"
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value
  }

  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function formatTooltipDate(value) {
  if (!value) return ''

  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value
  }

  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatYAxis(value) {
  return `$${Math.round(value)}K`
}

function CustomTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]
  const marker = item.payload?.marker

  return (
    <div
      className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl"
      style={{ border: 'none' }}
    >
      <p className="text-[10px] font-semibold text-slate-300 mb-0.5">
        {formatTooltipDate(label)}
      </p>

      <p className="text-sm font-bold text-white">
        {formatValue(item.value)}
      </p>

      {marker?.text && (
        <p className="text-[10px] text-emerald-400 mt-1">
          ↑ {marker.text}
        </p>
      )}
    </div>
  )
}

export default function AreaChart({
  data,
  color = '#6366F1',
  height = 180,
  formatValue,
}) {
  if (!data?.length) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-400"
        style={{ height }}
      >
        No revenue data available
      </div>
    )
  }

  const fmtValue =
    formatValue ?? ((value) => `$${Math.round(value)}K`)

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 8,
            right: 12,
            left: 0,
            bottom: 4,
          }}
        >
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={0.18}
              />

              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="#F1F5F9"
            strokeWidth={1}
          />

          <XAxis
            dataKey="label"
            tickFormatter={formatDateLabel}
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 10,
              fill: '#94A3B8',
            }}
            minTickGap={24}
          />

          <YAxis
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{
              fontSize: 10,
              fill: '#94A3B8',
            }}
          />

          <Tooltip
            cursor={{
              stroke: color,
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
            content={
              <CustomTooltip formatValue={fmtValue} />
            }
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={{
              r: 2.5,
              fill: color,
              fillOpacity: 0.5,
              strokeWidth: 0,
            }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: '#FFFFFF',
              strokeWidth: 2,
            }}
            animationDuration={500}
          />

          {/* Logged decision markers */}
          {data.map((item, index) => {
            if (!item.marker) return null

            const markerColor =
              item.marker.outcome === 'success'
                ? '#10B981'
                : item.marker.outcome === 'failed'
                  ? '#EF4444'
                  : '#94A3B8'

            return (
              <ReferenceDot
                key={`decision-${index}`}
                x={item.label}
                y={item.value}
                r={6}
                fill={markerColor}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                ifOverflow="visible"
              />
            )
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
