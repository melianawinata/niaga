import { ReactNode } from "react";

export function Section({ number, title, action }: { number?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6 pb-3 border-b border-[var(--line)]">
      <div className="flex items-baseline gap-3">
        {number && <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)]">{number}</span>}
        <h1 className="text-2xl font-display font-semibold tracking-tight text-[var(--navy-900)]">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function KpiCard({ label, value, sub, tone = "default" }: {
  label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "up" | "down" | "warn";
}) {
  const toneClass =
    tone === "up" ? "text-[var(--success)]" :
    tone === "down" ? "text-[var(--danger)]" :
    tone === "warn" ? "text-[var(--warning)]" :
    "text-[var(--navy-900)]";
  return (
    <div className="border border-[var(--line)] bg-white p-5">
      <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--ink-soft)]">{label}</div>
      <div className={`mt-2 font-mono tabular-nums text-2xl font-semibold ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--ink-soft)]">{sub}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    LUNAS: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30",
    BELUM: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
    SEBAGIAN: "bg-[var(--navy-500)]/10 text-[var(--navy-700)] border-[var(--navy-500)]/30",
    JATUH_TEMPO: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30",
    TUNAI: "bg-[var(--navy-900)] text-white border-[var(--navy-900)]",
    KREDIT: "bg-[var(--brand-accent)]/30 text-[var(--navy-900)] border-[var(--brand-accent)]",
    DRAFT: "bg-[var(--line)] text-[var(--ink-soft)] border-[var(--line)]",
    DIKIRIM: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
    DITERIMA: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30",
  };
  const cls = map[status.toUpperCase().replace(" ", "_")] ?? "bg-[var(--line)] text-[var(--ink-soft)] border-[var(--line)]";
  return <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${cls}`}>{status}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-[var(--line)] p-12 text-center">
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--ink-soft)]">Belum ada data</div>
      <div className="mt-2 text-lg font-display text-[var(--navy-900)]">{title}</div>
      {description && <p className="mt-1 text-sm text-[var(--ink-soft)] max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DataTable<T>({ columns, data, empty }: {
  columns: { key: string; label: string; align?: "left" | "right" | "center"; render: (row: T) => ReactNode; w?: string }[];
  data: T[];
  empty?: ReactNode;
}) {
  if (!data.length) return <>{empty ?? <EmptyState title="Tidak ada baris" />}</>;
  return (
    <div className="border border-[var(--line)] bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--off-white)] border-b border-[var(--line)] sticky top-0">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--ink-soft)] ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"}`} style={{ width: c.w }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--off-white)]/50">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.align === "right" ? "text-right font-mono tabular-nums" : c.align === "center" ? "text-center" : ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
