import { useEffect, useState } from "react"
import { exportReport, fetchStats } from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, Panel, SkeletonGrid, StatCard } from "../components/AdminUI"

const REPORTS = [
  {
    type: "users",
    title: "Users report",
    desc: "All registered users with credits and status",
  },
  {
    type: "notes",
    title: "Notes report",
    desc: "Every generated note with topic and exam metadata",
  },
  {
    type: "mocks",
    title: "Mock tests report",
    desc: "Mock attempts with difficulty, status, and scores",
  },
]

export default function AdminReports() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [loadingType, setLoadingType] = useState("")

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const download = async (type) => {
    setLoadingType(type)
    try {
      const blob = await exportReport(type)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mindovio-${type}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast(`${type} CSV downloaded`, "success")
    } catch (e) {
      toast(e?.response?.data?.message || "Export failed — check admin session", "error")
    } finally {
      setLoadingType("")
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Reports"
        subtitle="Generate and download CSV exports of live platform data"
      />

      {!stats ? (
        <SkeletonGrid count={3} />
      ) : (
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <StatCard label="Users to export" value={stats.totalUsers} />
          <StatCard label="Notes to export" value={stats.generatedNotes} />
          <StatCard label="Mock tests to export" value={stats.generatedMockTests} />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Panel key={r.type} title={r.title}>
            <p className="type-sm text-[var(--color-text-secondary)] mb-4">{r.desc}</p>
            <button
              type="button"
              disabled={loadingType === r.type}
              onClick={() => download(r.type)}
              className="premium-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loadingType === r.type ? "Preparing…" : "Download CSV"}
            </button>
          </Panel>
        ))}
      </div>

      <p className="type-caption mt-4 text-[var(--color-text-muted)]">
        Excel/PDF exports can be added later. CSV opens in Excel, Google Sheets, and Numbers.
      </p>
    </>
  )
}
