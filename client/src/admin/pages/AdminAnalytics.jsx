import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { fetchAnalytics } from "../services/adminApi"
import { AdminPageHeader, Panel, SkeletonGrid, StatCard } from "../components/AdminUI"

export default function AdminAnalytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <>
        <AdminPageHeader title="Analytics" />
        <SkeletonGrid />
      </>
    )
  }

  return (
    <>
      <AdminPageHeader title="Analytics" subtitle="Usage trends and subject popularity" />
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Avg mock score" value={`${data.averageScore}%`} />
        <StatCard label="Success rate (≥50%)" value={`${data.successRate}%`} />
        <StatCard
          label="Avg completion"
          value={`${Math.round((data.averageCompletionSec || 0) / 60)}m`}
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Notes over time">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.notesOverTime}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Mock attempts">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mockAttempts}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F8BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Most generated topics">
          <ul className="space-y-2">
            {(data.topTopics || []).map((t) => (
              <li
                key={t.topic}
                className="flex justify-between gap-3 type-sm border-b border-[var(--color-border)] pb-2"
              >
                <span className="truncate">{t.topic}</span>
                <span className="font-semibold tabular-nums">{t.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Popular mock subjects">
          <ul className="space-y-2">
            {(data.popularSubjects || []).map((t) => (
              <li
                key={t.topic}
                className="flex justify-between gap-3 type-sm border-b border-[var(--color-border)] pb-2"
              >
                <span className="truncate">{t.topic}</span>
                <span className="font-semibold tabular-nums">{t.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
