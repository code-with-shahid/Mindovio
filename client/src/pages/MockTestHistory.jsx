import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, Trophy } from "lucide-react"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import Alert from "../components/ui/Alert"
import { listMockTests } from "../services/api"

function formatDate(d) {
  try {
    return new Date(d).toLocaleString()
  } catch {
    return "—"
  }
}

export default function MockTestHistory() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await listMockTests()
        setTests(Array.isArray(data) ? data : [])
      } catch {
        setError("Couldn’t load mock test history")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <DashboardLayout>
      <DashboardTopbar
        title="Mock Tests"
        subtitle="Track every attempt, score, and improvement streak"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center type-sm text-[var(--color-text-muted)] animate-pulse">
          Loading history…
        </Card>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No mock tests yet"
          description="Generate notes, then start an optional AI mock test to assess your understanding."
          action={
            <Button onClick={() => navigate("/dashboard")}>Generate notes</Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tests.map((t) => (
            <Card
              key={t._id}
              className="!p-4 sm:!p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                <Trophy size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-text-primary)] truncate">
                  {t.topic}
                </p>
                <p className="type-caption mt-0.5">
                  {formatDate(t.submittedAt || t.createdAt)} · {t.difficulty} ·{" "}
                  {t.questionCount} Qs
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {t.score?.percentage ?? 0}%
                </p>
                <p className="type-caption">
                  {t.score?.correct}/{t.score?.total} · Grade {t.score?.grade}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/mock-test/${t._id}`)}>
                View results
              </Button>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
