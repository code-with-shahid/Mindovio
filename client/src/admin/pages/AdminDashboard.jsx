import { useEffect, useState } from "react"
import {
  Activity,
  Brain,
  ClipboardList,
  FileText,
  Server,
  Users,
  Zap,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { fetchAnalytics, fetchStats } from "../services/adminApi"
import { AdminPageHeader, Panel, SkeletonGrid, StatCard } from "../components/AdminUI"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [s, a] = await Promise.all([fetchStats(), fetchAnalytics()])
        if (!alive) return
        setStats(s)
        setAnalytics(a)
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "Failed to load dashboard")
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return <p className="text-rose-500 type-sm">{error}</p>
  }

  if (!stats) {
    return (
      <>
        <AdminPageHeader title="Dashboard" subtitle="Platform overview" />
        <SkeletonGrid count={8} />
      </>
    )
  }

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Live overview of Mindovio usage and health"
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Active (7d)" value={stats.activeUsers} icon={Activity} />
        <StatCard label="Today's Users" value={stats.todayUsers} icon={Zap} />
        <StatCard
          label="Premium-ish"
          value={stats.premiumUsers}
          hint={`Credits > 100 · Free: ${stats.freeUsers}`}
          icon={Users}
        />
        <StatCard label="Generated Notes" value={stats.generatedNotes} icon={FileText} />
        <StatCard
          label="Mock Tests"
          value={stats.generatedMockTests}
          hint={`${stats.submittedMockTests} submitted`}
          icon={ClipboardList}
        />
        <StatCard label="AI Requests" value={stats.aiRequests} icon={Brain} />
        <StatCard
          label="Server / API"
          value={stats.serverStatus === "ok" ? "Healthy" : "Issue"}
          hint={`API: ${stats.apiStatus}`}
          icon={Server}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Daily signups (14d)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyUsers || []}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#7C5CFF"
                  fill="#7C5CFF"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="AI usage proxy (notes + mocks)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.aiUsage || []}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4F8BFF"
                  fill="#4F8BFF"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <p className="type-caption mt-4 text-[var(--color-text-muted)]">
        {stats.estimatedRevenueNote} · Avg credits/user: {stats.avgCredits} · Held:{" "}
        {stats.totalCreditsHeld}
      </p>
    </>
  )
}
