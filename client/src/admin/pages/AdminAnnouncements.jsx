import { useEffect, useState } from "react"
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
} from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, EmptyState, Panel } from "../components/AdminUI"

export default function AdminAnnouncements() {
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [type, setType] = useState("info")

  const load = () =>
    fetchAnnouncements()
      .then((r) => setItems(r.items || []))
      .catch(() => toast("Failed to load", "error"))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createAnnouncement({ title, body, type, published: true })
      setTitle("")
      setBody("")
      toast("Announcement created", "success")
      load()
    } catch (err) {
      toast(err?.response?.data?.message || "Create failed", "error")
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete announcement?")) return
    await deleteAnnouncement(id)
    toast("Deleted", "success")
    load()
  }

  return (
    <>
      <AdminPageHeader title="Announcements" subtitle="Release notes & maintenance" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Create">
          <form onSubmit={submit} className="space-y-3">
            <input
              className="ui-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <select className="ui-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="info">Info</option>
              <option value="maintenance">Maintenance</option>
              <option value="release">Release</option>
              <option value="feature">Feature</option>
              <option value="warning">Warning</option>
            </select>
            <textarea
              className="ui-input min-h-[120px]"
              placeholder="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <button type="submit" className="premium-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
              Publish
            </button>
          </form>
        </Panel>
        <Panel title="Published">
          {!items.length ? (
            <EmptyState text="No announcements yet" />
          ) : (
            <ul className="space-y-3">
              {items.map((a) => (
                <li
                  key={a._id}
                  className="rounded-xl border border-[var(--color-border)] p-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <button
                      type="button"
                      className="text-xs text-rose-500"
                      onClick={() => remove(a._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="type-caption capitalize text-brand-500">{a.type}</p>
                  <p className="type-sm mt-1 text-[var(--color-text-secondary)]">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
