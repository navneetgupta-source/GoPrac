interface PerformanceChartProps {
  value: number
  maxValue: number
  color: string
}

export function PerformanceChart({ value, maxValue, color }: PerformanceChartProps) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="h-40 w-full rounded-md border bg-white p-4">
      <div className="flex h-full flex-col justify-end">
        <div className="relative h-full w-full">
          {/* Y-axis labels */}
          <div className="absolute -left-2 top-0 text-xs text-slate-400">{maxValue}</div>
          <div className="absolute -left-2 bottom-0 text-xs text-slate-400">0</div>

          {/* Industry expectation line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-slate-300"
            style={{ bottom: `${(6 / maxValue) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 text-xs text-slate-400">Industry Expectation</span>
          </div>

          {/* Bar */}
          <div
            className="absolute bottom-0 w-12"
            style={{ height: `${percentage}%`, backgroundColor: color, left: "40%" }}
          >
            <span className="absolute -top-5 left-0 right-0 text-center text-xs font-medium">{value}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
