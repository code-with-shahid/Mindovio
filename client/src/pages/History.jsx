import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { HiPlus, HiDocumentText, HiMagnifyingGlass, HiArrowPath } from "react-icons/hi2"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import FinalResult from "../components/FinalResult"
import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import EmptyState from "../components/ui/EmptyState"
import { HistoryListSkeleton, NotesResultSkeleton } from "../components/ui/Skeleton"
import { useToast } from "../context/ToastContext"
import { fetchMyNotes, fetchNoteById } from "../services/api"

export default function History() {
  const [topics, setTopics] = useState([])
  const [search, setSearch] = useState("")
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [noteError, setNoteError] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchNotes = async () => {
    setListLoading(true)
    setListError("")
    try {
      const data = await fetchMyNotes()
      setTopics(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setListError("Couldn’t load your notes. Check your connection and try again.")
      toast("Failed to load note history", "error")
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const openNote = async (noteId) => {
    setLoading(true)
    setActiveNoteId(noteId)
    setNoteError("")
    try {
      const data = await fetchNoteById(noteId)
      setSelectedNote(data.content)
    } catch (error) {
      console.error(error)
      setSelectedNote(null)
      setNoteError("Couldn’t open this note. Please try again.")
      toast("Failed to open note", "error")
    } finally {
      setLoading(false)
    }
  }

  const filtered = topics.filter((t) =>
    t.topic?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <DashboardTopbar title="Note History" subtitle="Browse and review your previously generated notes" />

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
        <div className="lg:col-span-1 space-y-4 min-w-0">
          <Button
            variant="primary"
            className="w-full"
            icon={<HiPlus />}
            onClick={() => navigate("/notes")}
          >
            New Notes
          </Button>

          <Card glass padding="p-3 sm:p-4" className="max-h-[40vh] lg:max-h-[70vh] overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                placeholder="Search topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 ui-input"
              />
            </div>

            {listError && (
              <Alert variant="error" className="mb-3" onDismiss={() => setListError("")}>
                <div className="space-y-2">
                  <p>{listError}</p>
                  <Button size="sm" variant="outline" icon={<HiArrowPath />} onClick={fetchNotes}>
                    Retry
                  </Button>
                </div>
              </Alert>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
              {listLoading ? (
                <HistoryListSkeleton />
              ) : filtered.length === 0 && !listError ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
                  {search ? "No matching notes" : "No notes created yet"}
                </p>
              ) : (
                filtered.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => openNote(t._id)}
                    className={`
                      w-full text-left rounded-xl p-3 border transition-all duration-200
                      ${activeNoteId === t._id
                        ? "border-brand-500/50 bg-brand-500/10 shadow-sm"
                        : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                      }
                    `}
                  >
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{t.topic}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {t.classLevel && <Badge color="brand">{t.classLevel}</Badge>}
                      {t.examType && <Badge color="neutral">{t.examType}</Badge>}
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
                      {t.revisionMode && <span>Revision</span>}
                      {t.includeDiagram && <span>Diagram</span>}
                      {t.includeChart && <span>Chart</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 min-w-0">
          <Card padding="p-0" className="min-h-[50vh] sm:min-h-[60vh] overflow-hidden min-w-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <NotesResultSkeleton />
                </motion.div>
              ) : noteError ? (
                <motion.div key="note-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <EmptyState
                    icon={HiDocumentText}
                    title="Couldn’t load note"
                    description={noteError}
                    action={
                      activeNoteId && (
                        <Button icon={<HiArrowPath />} onClick={() => openNote(activeNoteId)}>
                          Try again
                        </Button>
                      )
                    }
                  />
                </motion.div>
              ) : !selectedNote ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <EmptyState
                    icon={HiDocumentText}
                    title="Select a note"
                    description="Choose a topic from the sidebar to view its content"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeNoteId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FinalResult result={selectedNote} noteId={activeNoteId} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
