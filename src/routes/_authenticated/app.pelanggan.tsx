import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPelanggan, upsertPelanggan } from "@/lib/niaga.functions";
import { Section, DataTable, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/pelanggan")({ component: PelangganPage });

function PelangganPage() {
  const lp = useServerFn(listPelanggan);
  const up = useServerFn(upsertPelanggan);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const { data = [] } = useQuery({ queryKey: ["pelanggan"], queryFn: () => lp({}) });
  const mut = useMutation({
    mutationFn: (d: any) => up({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pelanggan"] }); setOpen(false); setEdit(null); toast.success("Tersimpan"); },
  });
  return (
    <div>
      <Section number="02" title="Pelanggan" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setEdit({})} className="bg-[var(--navy-900)]">+ Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{edit?.id ? "Ubah" : "Tambah"} Pelanggan</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); mut.mutate({ id: edit?.id, nama: String(fd.get("nama")), kontak: String(fd.get("kontak") || "") }); }} className="space-y-3">
              <div><Label>Nama</Label><Input name="nama" defaultValue={edit?.nama} required /></div>
              <div><Label>Kontak</Label><Input name="kontak" defaultValue={edit?.kontak} /></div>
              <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <DataTable data={data} empty={<EmptyState title="Belum ada pelanggan" />}
        columns={[
          { key: "nama", label: "Nama", render: (r: any) => <button onClick={() => { setEdit(r); setOpen(true); }} className="hover:underline text-left">{r.nama}</button> },
          { key: "kontak", label: "Kontak", render: (r: any) => <span className="text-xs font-mono">{r.kontak ?? "—"}</span> },
          { key: "saldo", label: "Saldo Piutang", align: "right", render: (r: any) => formatRupiah(r.saldo_piutang) },
        ]} />
    </div>
  );
}
