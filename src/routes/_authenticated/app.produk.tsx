import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProduk, upsertProduk, deleteProduk, listKategori } from "@/lib/niaga.functions";
import { Section, DataTable, StatusBadge, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatAngka } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/produk")({
  component: ProdukPage,
});

function ProdukPage() {
  const lp = useServerFn(listProduk);
  const lk = useServerFn(listKategori);
  const up = useServerFn(upsertProduk);
  const del = useServerFn(deleteProduk);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const { data: rows = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lp({}) });
  const { data: kategori = [] } = useQuery({ queryKey: ["kategori"], queryFn: () => lk({}) });

  const mut = useMutation({
    mutationFn: (d: any) => up({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produk"] }); setOpen(false); setEdit(null); toast.success("Tersimpan"); },
    onError: (e: any) => toast.error(e?.message ?? "Gagal"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produk"] }); toast.success("Dihapus"); },
    onError: (e: any) => toast.error(e?.message ?? "Gagal"),
  });

  const filtered = rows.filter((r: any) =>
    !q || r.nama.toLowerCase().includes(q.toLowerCase()) || r.sku.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <Section number="02" title="Produk" action={
        <div className="flex gap-2">
          <Input placeholder="Cari SKU / nama..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEdit({})} className="bg-[var(--navy-900)] hover:bg-[var(--navy-700)]">+ Tambah Produk</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{edit?.id ? "Ubah Produk" : "Tambah Produk"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                mut.mutate({
                  id: edit?.id,
                  sku: String(fd.get("sku")),
                  nama: String(fd.get("nama")),
                  kategori_id: (fd.get("kategori_id") as string) || null,
                  satuan: String(fd.get("satuan") || "pcs"),
                  harga_beli: Number(fd.get("harga_beli") || 0),
                  harga_jual: Number(fd.get("harga_jual") || 0),
                  stok: Number(fd.get("stok") || 0),
                  stok_min: Number(fd.get("stok_min") || 0),
                });
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SKU</Label><Input name="sku" defaultValue={edit?.sku} required /></div>
                  <div><Label>Satuan</Label><Input name="satuan" defaultValue={edit?.satuan ?? "pcs"} /></div>
                </div>
                <div><Label>Nama Produk</Label><Input name="nama" defaultValue={edit?.nama} required /></div>
                <div><Label>Kategori</Label>
                  <select name="kategori_id" defaultValue={edit?.kategori_id ?? ""} className="w-full border border-[var(--line)] rounded-md h-9 px-2 text-sm">
                    <option value="">— tanpa kategori —</option>
                    {kategori.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Harga Beli (Rp)</Label><Input name="harga_beli" type="number" defaultValue={edit?.harga_beli ?? 0} /></div>
                  <div><Label>Harga Jual (Rp)</Label><Input name="harga_jual" type="number" defaultValue={edit?.harga_jual ?? 0} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Stok</Label><Input name="stok" type="number" defaultValue={edit?.stok ?? 0} /></div>
                  <div><Label>Stok Minimum</Label><Input name="stok_min" type="number" defaultValue={edit?.stok_min ?? 0} /></div>
                </div>
                <DialogFooter>
                  {edit?.id && <Button type="button" variant="destructive" onClick={() => { delMut.mutate(edit.id); setOpen(false); }}>Hapus</Button>}
                  <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Menyimpan..." : "Simpan"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      } />

      <DataTable
        data={filtered}
        empty={<EmptyState title="Belum ada produk" description="Mulai dengan menambahkan satu produk untuk berjualan." />}
        columns={[
          { key: "sku", label: "SKU", render: (r: any) => <span className="font-mono text-xs">{r.sku}</span>, w: "100px" },
          { key: "nama", label: "Nama", render: (r: any) => <button onClick={() => { setEdit(r); setOpen(true); }} className="text-left hover:underline">{r.nama}</button> },
          { key: "kategori", label: "Kategori", render: (r: any) => <span className="text-xs text-[var(--ink-soft)]">{r.kategori?.nama ?? "—"}</span> },
          { key: "harga_beli", label: "Harga Beli", align: "right", render: (r: any) => formatRupiah(r.harga_beli) },
          { key: "harga_jual", label: "Harga Jual", align: "right", render: (r: any) => formatRupiah(r.harga_jual) },
          { key: "stok", label: "Stok", align: "right", render: (r: any) => (
            <span className={Number(r.stok) <= Number(r.stok_min) ? "text-[var(--danger)] font-semibold" : ""}>{formatAngka(r.stok)} {r.satuan}</span>
          )},
          { key: "stok_min", label: "Min", align: "right", render: (r: any) => formatAngka(r.stok_min) },
        ]}
      />
    </div>
  );
}
