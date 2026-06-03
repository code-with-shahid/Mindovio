import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { HiPlus, HiDocumentText, HiMagnifyingGlass } from "react-icons/hi2"
import DashboardLayout from "../components/layout/DashboardLayout"
import { DashboardTopbar } from "../components/layout/Navbar"
import FinalResult from "../components/FinalResult"
import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Spinner from "../components/ui/Spinner"
import { serverUrl } from "../config"

export default function History() {
  const [topics, setTopics] = useState([])
  const [search, setSearch] = useState("")
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(serverUrl + "/api/notes/getnotes", { withCredentials: true })
        setTopics(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error(error)
      } finally {
        setListLoading(false)
      }
    }
    fetchNotes()
  }, [])

  const openNote = async (noteId) => {
    setLoading(true)
    setActiveNoteId(noteId)
    try {
      const res = await axios.get(serverUrl + `/api/notes/${noteId}`, { withCredentials: true })
      setSelectedNote(res.data.content)
    } catch (error) {
      console.error(error)
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar list */}
        <div className="lg:col-span-1 space-y-4">
          <Button
            variant="primary"
            className="w-full"
            icon={<HiPlus />}
            onClick={() => navigate("/notes")}
          >
            New Notes
          </Button>

          <Card glass padding="p-4" className="max-h-[70vh] overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
              {listLoading ? (
                <div className="py-8"><Spinner className="mx-auto" /></div>
              ) : filtered.length === 0 ? (
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

        {/* Content panel */}
        <div className="lg:col-span-3">
          <Card padding="p-0" className="min-h-[60vh] overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex items-center justify-center"
                >
                  <Spinner />
                </motion.div>
              ) : !selectedNote ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
                    <HiDocumentText className="text-2xl text-brand-600 dark:text-brand-400" />
                  </div>
                  <p className="text-[var(--color-text-primary)] font-medium">Select a note</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Choose a topic from the sidebar to view its content
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeNoteId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FinalResult result={selectedNote} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
