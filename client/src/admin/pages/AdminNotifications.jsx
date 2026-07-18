import { useEffect, useState } from "react"
import {
  createNotification,
  deleteNotification,
  fetchNotifications,
  updateNotification,
} from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, EmptyState, Panel } from "../components/AdminUI"

export default function AdminNotifications() {
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "info",
    audience: "dashboard",
    link: "",
    published: true,
  })

  const load = () =>
    fetchNotifications()
      .then((r) => setItems(r.items || []))
      .catch(() => toast("Failed to load notifications", "error"))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createNotification(form)
      setForm({
        title: "",
        body: "",
        type: "info",
        audience: "dashboard",
        link: "",
        published: true,
      })
      toast("Notification published to users", "success")
      load()
    } catch (err) {
      toast(err?.response?.data?.message || "Create failed", "error")
    }
  }

  const togglePublish = async (item) => {
    try {
      await updateNotification(item._id, { published: !item.published })
      toast(item.published ? "Unpublished" : "Published", "success")
      load()
    } catch {
      toast("Update failed", "error")
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this notification?")) return
    await deleteNotification(id)
    toast("Deleted", "success")
    load()
  }

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        subtitle="In-app alerts shown to students on the dashboard"
      />
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Create notification">
          <form onSubmit={submit} className="space-y-3">
            <input
              className="ui-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="ui-input min-h-[110px]"
              placeholder="Message body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="ui-input"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="promo">Promo</option>
                <option value="system">System</option>
              </select>
              <select
                className="ui-input"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
              >
                <option value="dashboard">Dashboard users</option>
                <option value="all">All (dashboard)</option>
              </select>
            </div>
            <input
              className="ui-input"
              placeholder="Optional link (e.g. /pricing)"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
            <label className="flex items-center gap-2 type-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Publish immediately
            </label>
            <button
              type="submit"
              className="premium-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            >
              Send notification
            </button>
          </form>
        </Panel>

        <Panel title={`Active list (${items.length})`}>
          {!items.length ? (
            <EmptyState text="No notifications yet. Create one to show it on student dashboards." />
          ) : (
            <ul className="space-y-3 max-h-[32rem] overflow-y-auto">
              {items.map((n) => (
                <li key={n._id} className="rounded-xl border border-[var(--color-border)] p-3">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="type-caption">
                      {n.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="type-caption capitalize text-brand-500">
                    {n.type} · {n.audience}
                  </p>
                  <p className="type-sm mt-1 text-[var(--color-text-secondary)]">{n.body}</p>
                  {n.link && (
                    <p className="type-caption mt-1 text-[var(--color-text-muted)]">
                      Link: {n.link}
                    </p>
                  )}
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-500"
                      onClick={() => togglePublish(n)}
                    >
                      {n.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500"
                      onClick={() => remove(n._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
