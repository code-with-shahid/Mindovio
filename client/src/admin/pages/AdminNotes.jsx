import { useCallback, useEffect, useState } from "react"
import { deleteNote, fetchNotes } from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, DataTable, Panel } from "../components/AdminUI"

export default function AdminNotes() {
  const { toast } = useToast()
  const [q, setQ] = useState("")
  const [data, setData] = useState({ items: [], total: 0 })

  const load = useCallback(async () => {
    try {
      setData(await fetchNotes({ q, limit: 50 }))
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to load notes", "error")
    }
  }, [q, toast])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  const remove = async (id) => {
    if (!window.confirm("Delete this note?")) return
    try {
      await deleteNote(id)
      toast("Note deleted", "success")
      load()
    } catch (e) {
      toast(e?.response?.data?.message || "Delete failed", "error")
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Generated Notes"
        subtitle={`${data.total} notes`}
        actions={
          <input
            className="ui-input !w-56 !py-2"
            placeholder="Search topics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      />
      <Panel>
        <DataTable
          columns={[
            { key: "topic", label: "Topic" },
            { key: "classLevel", label: "Class" },
            { key: "examType", label: "Exam" },
            {
              key: "user",
              label: "User",
              render: (r) => r.user?.email || "—",
            },
            {
              key: "createdAt",
              label: "Created",
              render: (r) => new Date(r.createdAt).toLocaleString(),
            },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <button
                  type="button"
                  className="text-xs font-semibold text-rose-500"
                  onClick={() => remove(r._id)}
                >
                  Delete
                </button>
              ),
            },
          ]}
          rows={data.items}
        />
      </Panel>
    </>
  )
}
