import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSupplier, listProduk, buatPembelian, listPembelian } from "@/lib/niaga.functions";
import { Section, DataTable, StatusBadge, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/pembelian")({ component: PembelianPage });

function PembelianPage() {
  const lp = useServerFn(listPembelian);
  const ls = useServerFn(listSupplier);
  const lpr = useServerFn(listProduk);
  const buat = useServerFn(buatPembelian);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ produk_id: string; qty: number; harga_beli: number }>>([]);
  const [supplierId, setSupplierId] = useState("");
  const [jenisBayar, setJenisBayar] = useState<"tunai" | "kredit">("kredit");
  const [jt, setJt] = useState("");

  const { data: pembelian = [] } = useQuery({ queryKey: ["pembelian"], queryFn: () => lp({}) });
  const { data: suppliers = [] } = useQuery({ queryKey: ["supplier"], queryFn: () => ls({}) });
  const { data: produk = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lpr({}) });

  const mut = useMutation({
    mutationFn: () => buat({ data: {
      items, supplier_id: supplierId, jenis_bayar: jenisBayar, jatuh_tempo: jenisBayar === "kredit" ? jt : null,
    }}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pembelian"] });
      qc.invalidateQueries({ queryKey: ["produk"] });
      toast.success("Pembelian diterima — stok & HPP diperbarui");
      setOpen(false); setItems([]); setSupplierId(""); setJt("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal"),
  });

  const total = items.reduce((a, b) => a + b.qty * b.harga_beli, 0);

  return (
    <div>
      <Section number="04" title="Pembelian" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--navy-900)]">+ Penerimaan Baru</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Penerimaan Barang</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Supplier</Label>
                  <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full h-9 border border-[var(--line)] rounded-md px-2 text-sm">
                    <option value="">— pilih —</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
                <div><Label>Jenis Bayar</Label>
                  <select value={jenisBayar} onChange={(e) => setJenisBayar(e.target.value as any)} className="w-full h-9 border border-[var(--line)] rounded-md px-2 text-sm">
                    <option value="tunai">Tunai</option><option value="kredit">Kredit / Hutang</option>
                  </select>
                </div>
              </div>
              {jenisBayar === "kredit" && (
                <div><Label>Jatuh Tempo</Label><Input type="date" value={jt} onChange={(e) => setJt(e.target.value)} /></div>
              )}

              <div className="border border-[var(--line)] p-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Item</div>
                  <Button size="sm" variant="outline" onClick={() => setItems([...items, { produk_id: "", qty: 1, harga_beli: 0 }])}>+ Baris</Button>
                </div>
                {items.length === 0 && <div className="text-xs text-[var(--ink-soft)] py-2">Belum ada item</div>}
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end py-1.5 border-b border-[var(--line)]">
                    <div className="col-span-6"><select value={it.produk_id} onChange={(e) => {
                      const p = produk.find((x: any) => x.id === e.target.value);
                      const n = [...items]; n[i] = { ...n[i], produk_id: e.target.value, harga_beli: p ? Number(p.harga_beli) : 0 }; setItems(n);
                    }} className="w-full h-8 border border-[var(--line)] rounded text-sm px-1">
                      <option value="">— produk —</option>
                      {produk.map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select></div>
                    <div className="col-span-2"><Input type="number" value={it.qty} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], qty: Number(e.target.value) }; setItems(n); }} /></div>
                    <div className="col-span-3"><Input type="number" value={it.harga_beli} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], harga_beli: Number(e.target.value) }; setItems(n); }} placeholder="Hrg beli" /></div>
                    <div className="col-span-1"><Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-mono"><span>Total</span><span className="tabular-nums">{formatRupiah(total)}</span></div>
            </div>
            <DialogFooter>
              <Button onClick={() => mut.mutate()} disabled={mut.isPending || !supplierId || items.length === 0 || items.some(i => !i.produk_id)}>
                {mut.isPending ? "Memproses..." : "Terima Barang"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <DataTable data={pembelian} empty={<EmptyState title="Belum ada pembelian" />}
        columns={[
          { key: "nomor", label: "Nomor", render: (r: any) => <span className="font-mono text-xs">{r.nomor}</span> },
          { key: "tgl", label: "Tanggal", render: (r: any) => <span className="text-xs">{formatTanggal(r.tanggal)}</span> },
          { key: "supplier", label: "Supplier", render: (r: any) => r.supplier?.nama ?? "—" },
          { key: "bayar", label: "Bayar", render: (r: any) => <StatusBadge status={r.jenis_bayar} /> },
          { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { key: "total", label: "Total", align: "right", render: (r: any) => formatRupiah(r.total) },
        ]} />
    </div>
  );
}
