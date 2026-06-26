import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPiutang, terimaPembayaran } from "@/lib/niaga.functions";
import { Section, DataTable, StatusBadge, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatTanggal, selisihHari } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/piutang")({
  component: PiutangPage,
});

function agingLabel(jt: string) {
  const d = selisihHari(jt);
  if (d < -60) return { label: ">60 hari lewat", tone: "text-[var(--danger)]" };
  if (d < -30) return { label: "31–60 hari lewat", tone: "text-[var(--danger)]" };
  if (d < 0) return { label: `${-d} hari lewat`, tone: "text-[var(--danger)]" };
  if (d < 7) return { label: `tempo ${d}h`, tone: "text-[var(--warning)]" };
  return { label: `tempo ${d}h`, tone: "text-[var(--ink-soft)]" };
}

function PiutangPage() {
  const lp = useServerFn(listPiutang);
  const bayar = useServerFn(terimaPembayaran);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [jumlah, setJumlah] = useState("");

  const { data = [] } = useQuery({ queryKey: ["piutang"], queryFn: () => lp({}) });
  const mut = useMutation({
    mutationFn: () => bayar({ data: { hutpiut_id: sel.id, jumlah: Number(jumlah) } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["piutang"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Pembayaran tercatat — kas terbarui");
      setOpen(false); setJumlah("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal"),
  });

  return (
    <div>
      <Section number="06" title="Piutang" />
      <DataTable
        data={data}
        empty={<EmptyState title="Tidak ada piutang aktif" />}
        columns={[
          { key: "pelanggan", label: "Pelanggan", render: (r: any) => r.pelanggan?.nama ?? "—" },
          { key: "tanggal", label: "Dibuat", render: (r: any) => <span className="text-xs">{formatTanggal(r.created_at)}</span> },
          { key: "jt", label: "Jatuh Tempo", render: (r: any) => {
            const a = agingLabel(r.jatuh_tempo);
            return <div><div className="text-sm">{formatTanggal(r.jatuh_tempo)}</div><div className={`text-[10px] font-mono uppercase tracking-widest ${a.tone}`}>{a.label}</div></div>;
          }},
          { key: "total", label: "Total", align: "right", render: (r: any) => formatRupiah(r.total) },
          { key: "sisa", label: "Sisa", align: "right", render: (r: any) => <span className="font-semibold">{formatRupiah(r.sisa)}</span> },
          { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { key: "aksi", label: "Aksi", align: "right", render: (r: any) => (
            <Button size="sm" variant="outline" onClick={() => { setSel(r); setJumlah(String(r.sisa)); setOpen(true); }}>Catat Pembayaran</Button>
          )},
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Pembayaran</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-3 text-sm">
              <div className="border border-[var(--line)] p-3 bg-[var(--off-white)]">
                <div className="text-xs text-[var(--ink-soft)]">{sel.pelanggan?.nama}</div>
                <div className="font-mono tabular-nums">Sisa: {formatRupiah(sel.sisa)}</div>
              </div>
              <div>
                <label className="text-xs">Jumlah Pembayaran (Rp)</label>
                <Input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} max={sel.sisa} />
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.message("Reminder WhatsApp akan tersedia setelah integrasi WA Business API")}>
                Kirim Reminder WhatsApp →
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || !Number(jumlah)}>
              {mut.isPending ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
