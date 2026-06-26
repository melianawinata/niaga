import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listKategori, upsertKategori } from "@/lib/niaga.functions";
import { Section, DataTable, EmptyState } from "@/components/niaga-app/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/kategori")({
  component: KategoriPage,
});

function KategoriPage() {
  const lk = useServerFn(listKategori);
  const up = useServerFn(upsertKategori);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const { data = [] } = useQuery({ queryKey: ["kategori"], queryFn: () => lk({}) });
  const mut = useMutation({
    mutationFn: () => up({ data: { nama } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kategori"] }); setOpen(false); setNama(""); toast.success("Tersimpan"); },
  });
  return (
    <div>
      <Section number="02" title="Kategori" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[var(--navy-900)]">+ Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Kategori</DialogTitle></DialogHeader>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama kategori" />
            <DialogFooter><Button onClick={() => mut.mutate()} disabled={!nama}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <DataTable data={data} empty={<EmptyState title="Belum ada kategori" />}
        columns={[{ key: "nama", label: "Nama", render: (r: any) => r.nama }]} />
    </div>
  );
}
