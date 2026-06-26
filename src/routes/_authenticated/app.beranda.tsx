import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/niaga.functions";
import { Section, KpiCard } from "@/components/niaga-app/parts";
import { formatRupiah, formatAngka } from "@/lib/format";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/beranda")({
  component: BerandaPage,
});

function BerandaPage() {
  const fn = useServerFn(getDashboard);
  const { data } = useQuery({ queryKey: ["beranda"], queryFn: () => fn({}) });

  return (
    <div>
      <Section number="01" title="Beranda" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Penjualan Hari Ini" value={data ? formatRupiah(data.todayTotal) : "—"} />
        <KpiCard label="Piutang Jatuh Tempo" value={data ? formatAngka(data.piutangJTCount) : "—"} sub="tagihan ≤7 hari" tone="warn" />
        <KpiCard label="Stok Menipis" value={data ? formatAngka(data.stokMenipisCount) : "—"} sub="perlu restock" tone="down" />
      </div>

      <Link to="/app/penjualan/baru"
        className="block border border-[var(--navy-900)] bg-[var(--navy-900)] text-white p-6 hover:bg-[var(--navy-700)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] opacity-70">Aksi Utama</div>
            <div className="mt-1 font-display text-2xl">Transaksi Baru</div>
            <div className="mt-1 text-xs opacity-80">Target ≤ 20 detik per transaksi</div>
          </div>
          <ShoppingCart className="h-10 w-10 opacity-70" />
        </div>
      </Link>

      {data && data.stokMenipis.length > 0 && (
        <div className="mt-6 border border-[var(--line)] bg-white p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-3">Tugas — Stok perlu perhatian</div>
          <ul className="space-y-1 text-sm">
            {data.stokMenipis.map((p: any) => (
              <li key={p.id} className="flex justify-between border-b border-[var(--line)] pb-1">
                <span>{p.nama}</span>
                <span className="font-mono tabular-nums">{formatAngka(p.stok)} / min {formatAngka(p.stok_min)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
