import { useEffect, useState } from "react"
import { fetchSubscriptions } from "../services/adminApi"
import {
  AdminPageHeader,
  DataTable,
  Panel,
  SkeletonGrid,
  StatCard,
} from "../components/AdminUI"

export default function AdminSubscriptions() {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSubscriptions()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || "Failed to load"))
  }, [])

  if (error) return <p className="text-rose-500 type-sm">{error}</p>
  if (!data) {
    return (
      <>
        <AdminPageHeader title="Subscriptions" />
        <SkeletonGrid />
      </>
    )
  }

  const { tiers, plans, subscribers } = data

  return (
    <>
      <AdminPageHeader
        title="Subscriptions"
        subtitle="Credit packs & user tiers (inferred from balances)"
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatCard label="Free (≤50)" value={tiers.free} />
        <StatCard label="Starter-like" value={tiers.starter} />
        <StatCard label="Plus-like" value={tiers.plus} />
        <StatCard label="Pro-like" value={tiers.pro} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <Panel title="Stripe credit packs">
          <ul className="space-y-2">
            {plans.map((p) => (
              <li
                key={p.amountInr}
                className="flex justify-between type-sm border-b border-[var(--color-border)] pb-2"
              >
                <span>
                  {p.label} · ₹{p.amountInr}
                </span>
                <span className="font-semibold">{p.credits} credits</span>
              </li>
            ))}
          </ul>
          <p className="type-caption mt-3 text-[var(--color-text-muted)]">{data.note}</p>
        </Panel>
        <Panel title="Platform capacity">
          <ul className="space-y-2 type-sm">
            <li className="flex justify-between">
              <span>Total users</span>
              <strong>{data.totalUsers}</strong>
            </li>
            <li className="flex justify-between">
              <span>Low credit (&lt;10)</span>
              <strong>{data.lowCreditUsers}</strong>
            </li>
            <li className="flex justify-between">
              <span>Notes last 30 days</span>
              <strong>{data.notesLast30}</strong>
            </li>
            <li className="flex justify-between">
              <span>Est. notes remaining (credits÷10)</span>
              <strong>{data.estimatedNotesCapacity}</strong>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Users by credit balance">
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "credits", label: "Credits" },
            { key: "planHint", label: "Tier" },
            {
              key: "status",
              label: "Status",
              render: (r) => <span className="capitalize">{r.status || "active"}</span>,
            },
          ]}
          rows={subscribers}
          empty="No users yet"
        />
      </Panel>
    </>
  )
}
