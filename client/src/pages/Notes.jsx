import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { HiDocumentText, HiCreditCard } from "react-icons/hi2"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import TopicForm from "../components/TopicForm"
import Sidebar from "../components/Sidebar"
import FinalResult from "../components/FinalResult"
import Card from "../components/ui/Card"
import Alert from "../components/ui/Alert"
import EmptyState from "../components/ui/EmptyState"
import Button from "../components/ui/Button"
import { NotesResultSkeleton } from "../components/ui/Skeleton"

export default function Notes() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [noteId, setNoteId] = useState(null)
  const [error, setError] = useState("")
  const [lowCredits, setLowCredits] = useState(false)
  const navigate = useNavigate()

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
          setNoteId={setNoteId}
          setLoading={setLoading}
          setError={setError}
          setLowCredits={setLowCredits}
        />

        <AnimatePresence>
          {error && (
            <Alert
              variant="error"
              onDismiss={() => {
                setError("")
                setLowCredits(false)
              }}
            >
              <div className="space-y-2">
                <p>{error}</p>
                {lowCredits && (
                  <Button size="sm" onClick={() => navigate("/pricing")} icon={<HiCreditCard />}>
                    Buy credits
                  </Button>
                )}
              </div>
            </Alert>
          )}
        </AnimatePresence>

        {loading && (
          <Card padding="p-0" className="overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400 animate-pulse">
                Generating exam-focused notes…
              </p>
            </div>
            <NotesResultSkeleton />
          </Card>
        )}

        {!result && !loading && (
          <Card glass padding="p-0">
            <EmptyState
              icon={HiDocumentText}
              title="No notes yet"
              description="Enter a topic above and click Generate to get started"
            />
          </Card>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-4 gap-4 sm:gap-6 min-w-0"
          >
            <div className="lg:col-span-1 order-2 lg:order-1 min-w-0">
              <Sidebar result={result} />
            </div>
            <div className="lg:col-span-3 order-1 lg:order-2 min-w-0">
              <Card padding="p-0" className="overflow-hidden min-w-0">
                <FinalResult result={result} noteId={noteId} />
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
