export default function DataTable({ title, headers = [], rows = [] }) {
  if (!headers.length || !rows.length) return null

  return (
    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)]">
      {title && (
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[320px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 font-semibold text-[var(--color-text-primary)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-[var(--color-border)] last:border-0">
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-[var(--color-text-secondary)] align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
