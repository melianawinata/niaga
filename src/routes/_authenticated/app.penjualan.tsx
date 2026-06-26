import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPenjualan } from "@/lib/niaga.functions";
import { Section, DataTable, StatusBadge, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/penjualan")({
  component: PenjualanPage,
});

function PenjualanPage() {
  const fn = useServerFn(listPenjualan);
  const { data = [] } = useQuery({ queryKey: ["penjualan"], queryFn: () => fn({}) });
  return (
    <div>
      <Section number="03" title="Riwayat Penjualan" action={
        <Link to="/app/penjualan/baru"><Button className="bg-[var(--navy-900)] hover:bg-[var(--navy-700)]">+ Transaksi Baru</Button></Link>
      } />
      <DataTable
        data={data}
        empty={<EmptyState title="Belum ada penjualan" action={<Link to="/app/penjualan/baru"><Button>Buat transaksi pertama</Button></Link>} />}
        columns={[
          { key: "nomor", label: "Nomor", render: (r: any) => <span className="font-mono text-xs">{r.nomor}</span> },
          { key: "tanggal", label: "Tanggal", render: (r: any) => <span className="text-xs">{formatTanggalJam(r.tanggal)}</span> },
          { key: "pelanggan", label: "Pelanggan", render: (r: any) => r.pelanggan?.nama ?? <span className="text-[var(--ink-soft)]">— umum —</span> },
          { key: "jenis", label: "Bayar", render: (r: any) => <StatusBadge status={r.jenis_bayar} /> },
          { key: "total", label: "Total", align: "right", render: (r: any) => formatRupiah(r.total) },
        ]}
      />
    </div>
  );
}
