type SpecRow = { k: string; v: string }

export default function ProductSpecTable({ rows }: { rows: SpecRow[] }) {
  if (!rows.length) return null

  return (
    <dl className="spec-table">
      {rows.map((row) => (
        <div key={row.k} className="spec-row">
          <dt>{row.k}</dt>
          <dd>
            <span className="text-on-surface-muted mr-3">—</span>
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  )
}
