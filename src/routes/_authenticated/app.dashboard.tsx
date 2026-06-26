import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/niaga.functions";
import { Section, KpiCard } from "@/components/niaga-app/parts";
import { formatRupiah, formatAngka } from "@/lib/format";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fn = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn({}) });

  return (
    <div>
      <Section number="01" title="Dashboard" />
      {isLoading || !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => <div key={i} className="h-28 bg-white border border-[var(--line)] animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Penjualan Hari Ini" value={formatRupiah(data.todayTotal)} sub={`Laba kotor ${formatRupiah(data.todayLaba)}`} />
            <KpiCard label="Saldo Kas" value={formatRupiah(data.saldoKas)} tone="up" />
            <KpiCard label="Piutang Jatuh Tempo ≤7 hari" value={formatRupiah(data.piutangJTTotal)} sub={`${data.piutangJTCount} tagihan`} tone="warn" />
            <KpiCard label="Stok Menipis" value={formatAngka(data.stokMenipisCount)} sub="produk ≤ stok minimum" tone="down" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 border border-[var(--line)] bg-white p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-3">Tren Penjualan · 30 hari</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={data.trenSeries}>
                    <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--ink-soft)" }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                    <Tooltip formatter={(v: any) => formatRupiah(v)} labelStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="total" stroke="var(--navy-700)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border border-[var(--line)] bg-white p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-3">Produk Terlaris</div>
              {data.terlarisList.length === 0 ? (
                <div className="text-xs text-[var(--ink-soft)]">Belum ada data</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.terlarisList.map((p) => (
                    <li key={p.nama} className="flex justify-between border-b border-[var(--line)] pb-1.5">
                      <span className="truncate">{p.nama}</span>
                      <span className="font-mono tabular-nums">{formatAngka(p.qty)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="border border-[var(--line)] bg-white p-5">
              <div className="flex justify-between items-baseline mb-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)]">Stok Menipis</div>
                <Link to="/app/produk" className="text-xs text-[var(--navy-500)] hover:underline">Kelola →</Link>
              </div>
              {data.stokMenipis.length === 0 ? (
                <div className="text-xs text-[var(--ink-soft)]">Semua stok aman</div>
              ) : (
                <ul className="space-y-1.5">
                  {data.stokMenipis.map((p: any) => (
                    <li key={p.id} className="flex justify-between text-sm border-b border-[var(--line)] pb-1">
                      <span>{p.nama}</span>
                      <span className="font-mono tabular-nums text-[var(--danger)]">{formatAngka(p.stok)} / min {formatAngka(p.stok_min)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border border-[var(--line)] bg-white p-5">
              <div className="flex justify-between items-baseline mb-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ink-soft)]">Aksi Cepat</div>
              </div>
              <div className="space-y-2">
                <Link to="/app/penjualan/baru" className="block border border-[var(--line)] p-3 hover:bg-[var(--off-white)]">→ Buat Penjualan Baru</Link>
                <Link to="/app/pembelian" className="block border border-[var(--line)] p-3 hover:bg-[var(--off-white)]">→ Catat Pembelian</Link>
                <Link to="/app/piutang" className="block border border-[var(--line)] p-3 hover:bg-[var(--off-white)]">→ Catat Pelunasan Piutang</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
