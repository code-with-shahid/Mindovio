import { useCallback, useEffect, useState } from "react"
import {
  deleteUser,
  fetchUsers,
  patchUserCredits,
  patchUserStatus,
} from "../services/adminApi"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, DataTable, Panel } from "../components/AdminUI"

export default function AdminUsers() {
  const { toast } = useToast()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchUsers({ q, status: status || undefined, limit: 50 })
      setData(res)
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to load users", "error")
    } finally {
      setLoading(false)
    }
  }, [q, status, toast])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  const setUserStatus = async (id, next) => {
    try {
      await patchUserStatus(id, {
        status: next,
        banReason: next === "banned" ? "Banned by admin" : "",
      })
      toast(`User marked ${next}`, "success")
      load()
    } catch (e) {
      toast(e?.response?.data?.message || "Update failed", "error")
    }
  }

  const adjustCredits = async (id, current) => {
    const raw = window.prompt("Set credits to:", String(current ?? 0))
    if (raw == null) return
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) {
      toast("Invalid number", "error")
      return
    }
    try {
      await patchUserCredits(id, n)
      toast("Credits updated", "success")
      load()
    } catch (e) {
      toast(e?.response?.data?.message || "Credits update failed", "error")
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return
    try {
      await deleteUser(id)
      toast("User deleted", "success")
      load()
    } catch (e) {
      toast(e?.response?.data?.message || "Delete failed", "error")
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Users"
        subtitle={`${data.total} total`}
        actions={
          <>
            <input
              className="ui-input !w-48 !py-2"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="ui-input !w-40 !py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </>
        }
      />
      <Panel>
        {loading ? (
          <p className="type-sm text-[var(--color-text-muted)] animate-pulse">Loading…</p>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "credits", label: "Credits" },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <span className="capitalize">{r.status || "active"}</span>
                ),
              },
              {
                key: "createdAt",
                label: "Joined",
                render: (r) => new Date(r.createdAt).toLocaleDateString(),
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    <Btn onClick={() => setUserStatus(r._id, "active")}>Activate</Btn>
                    <Btn onClick={() => setUserStatus(r._id, "deactivated")}>Deactivate</Btn>
                    <Btn onClick={() => setUserStatus(r._id, "banned")}>Ban</Btn>
                    <Btn onClick={() => adjustCredits(r._id, r.credits)}>Credits</Btn>
                    <Btn danger onClick={() => remove(r._id)}>
                      Delete
                    </Btn>
                  </div>
                ),
              },
            ]}
            rows={data.items}
          />
        )}
      </Panel>
    </>
  )
}

function Btn({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2 py-1 text-[11px] font-semibold border ${
        danger
          ? "border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
          : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
      }`}
    >
      {children}
    </button>
  )
}
