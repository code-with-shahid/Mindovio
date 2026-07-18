import { useEffect, useState } from "react"
import { fetchMockTests } from "../services/adminApi"
import { AdminPageHeader, DataTable, Panel, StatCard } from "../components/AdminUI"

export default function AdminMockTests() {
  const [data, setData] = useState(null)
  const [q, setQ] = useState("")

  useEffect(() => {
    const t = setTimeout(() => {
      fetchMockTests({ q, limit: 50 }).then(setData).catch(() => setData(null))
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  return (
    <>
      <AdminPageHeader
        title="Mock Tests"
        subtitle="Attempts, scores, and completion"
        actions={
          <input
            className="ui-input !w-56 !py-2"
            placeholder="Search topics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      />
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Listed" value={data?.total ?? "—"} />
        <StatCard label="Avg score" value={`${data?.averageScore ?? 0}%`} />
        <StatCard
          label="Avg time"
          value={`${Math.round((data?.averageCompletionSec || 0) / 60)}m`}
        />
      </div>
      <Panel>
        <DataTable
          columns={[
            { key: "topic", label: "Topic" },
            { key: "difficulty", label: "Difficulty" },
            { key: "questionCount", label: "Q" },
            { key: "status", label: "Status" },
            {
              key: "score",
              label: "Score",
              render: (r) =>
                r.score?.percentage != null ? `${r.score.percentage}%` : "—",
            },
            {
              key: "user",
              label: "User",
              render: (r) => r.user?.email || "—",
            },
            {
              key: "createdAt",
              label: "Created",
              render: (r) => new Date(r.createdAt).toLocaleDateString(),
            },
          ]}
          rows={data?.items || []}
        />
      </Panel>
    </>
  )
}
