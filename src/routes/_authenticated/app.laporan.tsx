import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPenjualan, listProduk } from "@/lib/niaga.functions";
import { Section, KpiCard } from "@/components/niaga-app/parts";
import { formatRupiah, formatAngka } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/laporan")({ component: LaporanPage });

function LaporanPage() {
  const lp = useServerFn(listPenjualan);
  const lpr = useServerFn(listProduk);
  const { data: penjualan = [] } = useQuery({ queryKey: ["penjualan"], queryFn: () => lp({}) });
  const { data: produk = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lpr({}) });

  const total = penjualan.reduce((a: number, b: any) => a + Number(b.total), 0);
  const nilaiStok = produk.reduce((a: number, p: any) => a + Number(p.stok) * Number(p.harga_beli), 0);
  const jumlahProduk = produk.length;

  function exportCsv() {
    const rows = [["Nomor", "Tanggal", "Pelanggan", "Bayar", "Total"]];
    for (const p of penjualan as any[]) rows.push([p.nomor, p.tanggal, p.pelanggan?.nama ?? "", p.jenis_bayar, String(p.total)]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "laporan-penjualan.csv"; a.click();
  }

  return (
    <div>
      <Section number="07" title="Laporan" action={<Button variant="outline" onClick={exportCsv}>Ekspor CSV</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Total Penjualan (100 transaksi terakhir)" value={formatRupiah(total)} />
        <KpiCard label="Nilai Persediaan (HPP × Stok)" value={formatRupiah(nilaiStok)} />
        <KpiCard label="Jumlah Produk Aktif" value={formatAngka(jumlahProduk)} />
      </div>
      <div className="mt-6 text-xs text-[var(--ink-soft)] border border-[var(--line)] p-3 bg-[var(--off-white)]">
        Ekspor PDF dan laporan periodik per produk/pelanggan akan tersedia setelah integrasi cetak.
      </div>
    </div>
  );
}
