export default function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function HistoryListSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-3 space-y-2">
          <Skeleton className="h-4 w-[75%]" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotesResultSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-40 w-full mt-2" />
    </div>
  )
}
