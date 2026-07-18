import { useCallback, useEffect, useState } from "react"
import {
  createFeedback,
  deleteFeedback,
  fetchFeedback,
  updateFeedback,
} from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, EmptyState, Panel, StatCard } from "../components/AdminUI"

export default function AdminFeedback() {
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({})
  const [status, setStatus] = useState("")
  const [form, setForm] = useState({ name: "", email: "", subject: "Support", message: "" })

  const load = useCallback(async () => {
    try {
      const res = await fetchFeedback({ status: status || undefined })
      setItems(res.items || [])
      setCounts(res.counts || {})
    } catch {
      toast("Failed to load feedback", "error")
    }
  }, [status, toast])

  useEffect(() => {
    load()
  }, [load])

  const reply = async (id) => {
    const text = window.prompt("Reply (saved on the record):")
    if (text == null) return
    try {
      await updateFeedback(id, { reply: text, status: "replied" })
      toast("Reply saved", "success")
      load()
    } catch {
      toast("Update failed", "error")
    }
  }

  const setItemStatus = async (id, next) => {
    try {
      await updateFeedback(id, { status: next })
      toast(`Marked ${next}`, "success")
      load()
    } catch {
      toast("Update failed", "error")
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this feedback?")) return
    try {
      await deleteFeedback(id)
      toast("Deleted", "success")
      load()
    } catch {
      toast("Delete failed", "error")
    }
  }

  const addManual = async (e) => {
    e.preventDefault()
    if (!form.message.trim()) return
    try {
      await createFeedback(form)
      setForm({ name: "", email: "", subject: "Support", message: "" })
      toast("Feedback added", "success")
      load()
    } catch {
      toast("Create failed", "error")
    }
  }

  const exportCsv = () => {
    const rows = [
      ["name", "email", "subject", "status", "message", "reply", "source", "createdAt"],
      ...items.map((f) => [
        f.name,
        f.email,
        f.subject || "",
        f.status,
        f.message,
        f.reply || "",
        f.source || "",
        f.createdAt,
      ]),
    ]
    const csv = rows
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "")
            return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
          })
          .join(",")
      )
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mindovio-feedback.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast("CSV exported", "success")
  }

  return (
    <>
      <AdminPageHeader
        title="Feedback"
        subtitle="Messages from the contact form and manual entries"
        actions={
          <>
            <select
              className="ui-input !w-36 !py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold"
            >
              Export CSV
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="New" value={counts.new || 0} />
        <StatCard label="Read" value={counts.read || 0} />
        <StatCard label="Replied" value={counts.replied || 0} />
        <StatCard label="Archived" value={counts.archived || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Add / log feedback">
          <form onSubmit={addManual} className="space-y-3">
            <input
              className="ui-input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="ui-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <textarea
              className="ui-input min-h-[100px]"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="premium-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            >
              Save to inbox
            </button>
          </form>
        </Panel>

        <Panel title={`Inbox (${items.length})`}>
          {!items.length ? (
            <EmptyState text="No feedback yet. Submit the contact form on the landing page to see messages here." />
          ) : (
            <ul className="space-y-3 max-h-[32rem] overflow-y-auto">
              {items.map((f) => (
                <li key={f._id} className="rounded-xl border border-[var(--color-border)] p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {f.name || "Anonymous"} · {f.email || "—"}
                    </p>
                    <span className="type-caption capitalize">{f.status}</span>
                  </div>
                  <p className="type-caption mt-0.5 text-brand-500">{f.subject || "General"}</p>
                  <p className="type-sm mt-2 text-[var(--color-text-secondary)] whitespace-pre-wrap">
                    {f.message}
                  </p>
                  {f.reply && (
                    <p className="type-sm mt-2 rounded-lg bg-brand-500/10 px-3 py-2">
                      Reply: {f.reply}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Action onClick={() => setItemStatus(f._id, "read")}>Mark read</Action>
                    <Action onClick={() => reply(f._id)}>Reply</Action>
                    <Action onClick={() => setItemStatus(f._id, "archived")}>Archive</Action>
                    <Action danger onClick={() => remove(f._id)}>
                      Delete
                    </Action>
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

function Action({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold ${
        danger ? "text-rose-500" : "text-brand-500"
      }`}
    >
      {children}
    </button>
  )
}
