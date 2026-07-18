import { useEffect, useState } from "react"
import { fetchPayments } from "../services/adminApi"
import { AdminPageHeader, Panel, SkeletonGrid, StatCard } from "../components/AdminUI"

export default function AdminPayments() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchPayments().then(setData).catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <>
        <AdminPageHeader title="Payments" />
        <SkeletonGrid />
      </>
    )
  }

  return (
    <>
      <AdminPageHeader title="Payments" subtitle="Credits economy overview" />
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Users with credits" value={data.usersWithCredits} />
        <StatCard label="Low credit users" value={data.lowCreditUsers} />
        <StatCard label="Credits in circulation" value={data.totalCreditsInCirculation} />
      </div>
      <Panel title="Stripe credit packs">
        <ul className="space-y-2 mb-4">
          {(data.stripePlans || []).map((p) => (
            <li
              key={p.amountInr}
              className="flex justify-between type-sm border-b border-[var(--color-border)] pb-2"
            >
              <span>₹{p.amountInr}</span>
              <span className="font-semibold">{p.credits} credits</span>
            </li>
          ))}
        </ul>
        <p className="type-sm text-[var(--color-text-secondary)]">{data.message}</p>
        <p className="type-caption mt-2 text-[var(--color-text-muted)]">
          Note generation: {data.noteGenerationCost} credits · Mock tests: free (
          {data.mockTestCost})
        </p>
      </Panel>
    </>
  )
}
