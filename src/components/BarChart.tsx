interface BarChartProps {
  data: { label: string; value: number }[]
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="bars" role="img" aria-label="Graphique des ventes">
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }} />
          </div>
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  )
}
