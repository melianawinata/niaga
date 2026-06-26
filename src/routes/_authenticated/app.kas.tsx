import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAkunKas } from "@/lib/niaga.functions";
import { Section, KpiCard, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/kas")({ component: KasPage });

function KasPage() {
  const fn = useServerFn(listAkunKas);
  const { data = [] } = useQuery({ queryKey: ["kas"], queryFn: () => fn({}) });
  return (
    <div>
      <Section number="06" title="Kas & Bank" />
      {data.length === 0 ? <EmptyState title="Belum ada akun kas" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((k: any) => <KpiCard key={k.id} label={k.nama} value={formatRupiah(k.saldo)} tone="up" />)}
        </div>
      )}
      <div className="mt-6 text-xs text-[var(--ink-soft)] border border-[var(--line)] p-3 bg-[var(--off-white)]">
        Saldo kas otomatis berubah setiap penjualan tunai (masuk), pembelian tunai (keluar), dan pembayaran piutang/hutang.
        Penambahan akun kas dan pencatatan biaya operasional akan tersedia di iterasi berikutnya.
      </div>
    </div>
  );
}
