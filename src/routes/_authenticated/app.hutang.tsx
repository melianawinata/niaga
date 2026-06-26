import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listHutang, terimaPembayaran } from "@/lib/niaga.functions";
import { Section, DataTable, StatusBadge, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatTanggal, selisihHari } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/hutang")({ component: HutangPage });

function HutangPage() {
  const lh = useServerFn(listHutang);
  const bayar = useServerFn(terimaPembayaran);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["hutang"], queryFn: () => lh({}) });
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [jumlah, setJumlah] = useState("");
  const mut = useMutation({
    mutationFn: () => bayar({ data: { hutpiut_id: sel.id, jumlah: Number(jumlah) } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hutang"] }); toast.success("Pembayaran tercatat"); setOpen(false); },
  });
  return (
    <div>
      <Section number="06" title="Hutang ke Supplier" />
      <DataTable data={data} empty={<EmptyState title="Tidak ada hutang aktif" />}
        columns={[
          { key: "sup", label: "Supplier", render: (r: any) => r.supplier?.nama ?? "—" },
          { key: "tgl", label: "Dibuat", render: (r: any) => <span className="text-xs">{formatTanggal(r.created_at)}</span> },
          { key: "jt", label: "Jatuh Tempo", render: (r: any) => {
            const d = selisihHari(r.jatuh_tempo);
            return <div><div className="text-sm">{formatTanggal(r.jatuh_tempo)}</div><div className={`text-[10px] font-mono uppercase tracking-widest ${d < 0 ? "text-[var(--danger)]" : "text-[var(--ink-soft)]"}`}>{d < 0 ? `${-d} hari lewat` : `tempo ${d}h`}</div></div>;
          }},
          { key: "sisa", label: "Sisa", align: "right", render: (r: any) => formatRupiah(r.sisa) },
          { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { key: "aksi", label: "", align: "right", render: (r: any) => <Button size="sm" variant="outline" onClick={() => { setSel(r); setJumlah(String(r.sisa)); setOpen(true); }}>Bayar</Button> },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bayar Hutang</DialogTitle></DialogHeader>
          {sel && <div className="text-sm space-y-2">
            <div className="text-xs text-[var(--ink-soft)]">Ke: {sel.supplier?.nama}</div>
            <div className="font-mono">Sisa: {formatRupiah(sel.sisa)}</div>
            <Input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} max={sel.sisa} />
          </div>}
          <DialogFooter><Button onClick={() => mut.mutate()}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
