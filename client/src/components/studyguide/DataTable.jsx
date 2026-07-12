export default function DataTable({ title, headers = [], rows = [] }) {
  if (!headers.length || !rows.length) return null

  return (
    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)] min-w-0">
      {title && (
        <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <h4 className="type-h4">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto scroll-x">
        <table className="ui-table min-w-[min(100%,320px)] w-full">
          <thead className="sticky top-0 z-[1] bg-[var(--color-surface-muted)]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td key={ci} className="align-top">
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
