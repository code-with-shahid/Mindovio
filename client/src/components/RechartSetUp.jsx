import React from "react"
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"]

const tooltipStyle = {
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
}

export default function RechartSetUp({ charts }) {
  if (!charts || charts.length === 0) return null

  return (
    <div className="space-y-6">
      {charts.map((chart, index) => (
        <div
          key={index}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
        >
          <h4 className="font-semibold text-[var(--color-text-primary)] mb-4 text-sm">
            {chart.title}
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === "bar" && (
                <BarChart data={chart.data}>
                  <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chart.data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
              {chart.type === "line" && (
                <LineChart data={chart.data}>
                  <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1" }} />
                </LineChart>
              )}
              {chart.type === "pie" && (
                <PieChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={90} label>
                    {chart.data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}
