import { useEffect, useState } from "react"
import { fetchAnalytics, fetchStats } from "../services/adminApi"
import { AdminPageHeader, Panel, SkeletonGrid, StatCard } from "../components/AdminUI"

export default function AdminAiUsage() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    Promise.all([fetchStats(), fetchAnalytics()]).then(([s, a]) => {
      setStats(s)
      setAnalytics(a)
    })
  }, [])

  if (!stats) {
    return (
      <>
        <AdminPageHeader title="AI Usage" />
        <SkeletonGrid />
      </>
    )
  }

  return (
    <>
      <AdminPageHeader
        title="AI Usage"
        subtitle="Estimated from notes + mock generation (token metering coming later)"
      />
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="AI requests (proxy)" value={stats.aiRequests} />
        <StatCard label="Notes generated" value={stats.generatedNotes} />
        <StatCard label="Mock tests generated" value={stats.generatedMockTests} />
      </div>
      <Panel title="Daily AI activity">
        <ul className="space-y-1 max-h-80 overflow-y-auto">
          {(analytics?.aiUsage || []).map((d) => (
            <li
              key={d.date}
              className="flex justify-between type-sm border-b border-[var(--color-border)] py-1.5"
            >
              <span>{d.date}</span>
              <span className="font-semibold tabular-nums">{d.count}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  )
}
