import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAudit } from "@/lib/niaga.functions";
import { Section, DataTable, EmptyState } from "@/components/niaga-app/parts";
import { formatTanggalJam } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/audit")({ component: AuditPage });

function AuditPage() {
  const fn = useServerFn(listAudit);
  const { data = [] } = useQuery({ queryKey: ["audit"], queryFn: () => fn({}) });
  return (
    <div>
      <Section number="08" title="Audit Log" />
      <DataTable data={data} empty={<EmptyState title="Belum ada aktivitas tercatat" />}
        columns={[
          { key: "tgl", label: "Waktu", render: (r: any) => <span className="text-xs">{formatTanggalJam(r.created_at)}</span> },
          { key: "aksi", label: "Aksi", render: (r: any) => <span className="font-mono text-xs uppercase">{r.aksi}</span> },
          { key: "entitas", label: "Entitas", render: (r: any) => r.entitas },
          { key: "detail", label: "Detail", render: (r: any) => <span className="text-xs font-mono text-[var(--ink-soft)]">{JSON.stringify(r.detail)}</span> },
        ]} />
    </div>
  );
}
