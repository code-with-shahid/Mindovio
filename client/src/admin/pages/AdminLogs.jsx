import { useEffect, useState } from "react"
import { fetchLogs } from "../services/adminApi"
import { AdminPageHeader, DataTable, Panel } from "../components/AdminUI"

export default function AdminLogs() {
  const [data, setData] = useState({ items: [], total: 0 })

  useEffect(() => {
    fetchLogs({ limit: 100 }).then(setData).catch(() => {})
  }, [])

  return (
    <>
      <AdminPageHeader title="Activity Logs" subtitle={`${data.total} events`} />
      <Panel>
        <DataTable
          columns={[
            { key: "action", label: "Action" },
            { key: "actorEmail", label: "Admin" },
            { key: "targetType", label: "Target" },
            { key: "targetId", label: "ID", render: (r) => (r.targetId || "—").slice(0, 8) },
            { key: "ip", label: "IP" },
            {
              key: "createdAt",
              label: "When",
              render: (r) => new Date(r.createdAt).toLocaleString(),
            },
          ]}
          rows={data.items}
        />
      </Panel>
    </>
  )
}
