import { useState } from "react"
import { motion } from "motion/react"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import TopicForm from "../components/TopicForm"
import Sidebar from "../components/Sidebar"
import FinalResult from "../components/FinalResult"
import Card from "../components/ui/Card"
import { HiDocumentText } from "react-icons/hi2"

export default function Notes() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  return (
    <DashboardLayout>
      <DashboardTopbar
        title="Generate Notes"
        subtitle="Create AI-powered exam notes with diagrams and revision points"
      />

      <div className="space-y-6">
        <TopicForm
          loading={loading}
          setResult={setResult}
          setLoading={setLoading}
          setError={setError}
        />

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400 animate-pulse">
              Generating exam-focused notes…
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {!result && !loading && (
          <Card glass className="h-64 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <HiDocumentText className="text-2xl text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-[var(--color-text-primary)] font-medium mb-1">No notes yet</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Enter a topic above and click Generate to get started
            </p>
          </Card>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-4 gap-6"
          >
            <div className="lg:col-span-1">
              <Sidebar result={result} />
            </div>
            <div className="lg:col-span-3">
              <Card padding="p-0" className="overflow-hidden">
                <FinalResult result={result} />
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
