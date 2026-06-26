import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProduk, opnameProduk } from "@/lib/niaga.functions";
import { Section } from "@/components/niaga-app/parts";
import { formatAngka } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/opname")({ component: OpnamePage });

function OpnamePage() {
  const lp = useServerFn(listProduk);
  const op = useServerFn(opnameProduk);
  const qc = useQueryClient();
  const [produkId, setProdukId] = useState("");
  const [qty, setQty] = useState("");
  const [alasan, setAlasan] = useState("");
  const { data: produk = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lp({}) });
  const sel = produk.find((p: any) => p.id === produkId);
  const mut = useMutation({
    mutationFn: () => op({ data: { produk_id: produkId, qty_fisik: Number(qty), alasan } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produk"] });
      toast.success("Opname tercatat — stok disesuaikan dan masuk audit log");
      setProdukId(""); setQty(""); setAlasan("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal"),
  });

  return (
    <div>
      <Section number="05" title="Opname / Penyesuaian Stok" />
      <div className="max-w-xl border border-[var(--line)] bg-white p-6 space-y-4">
        <div>
          <Label>Produk</Label>
          <select value={produkId} onChange={(e) => setProdukId(e.target.value)} className="w-full h-9 border border-[var(--line)] rounded-md px-2 text-sm">
            <option value="">— pilih produk —</option>
            {produk.map((p: any) => <option key={p.id} value={p.id}>{p.nama} (stok kini {formatAngka(p.stok)})</option>)}
          </select>
        </div>
        {sel && (
          <div className="text-xs font-mono text-[var(--ink-soft)] bg-[var(--off-white)] p-2 border border-[var(--line)]">
            Stok kini: <span className="font-semibold text-[var(--navy-900)]">{formatAngka(sel.stok)} {sel.satuan}</span>
          </div>
        )}
        <div>
          <Label>Jumlah Fisik (hasil hitungan)</Label>
          <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          {sel && qty !== "" && (
            <div className="text-xs mt-1">
              Selisih: <span className={`font-mono ${Number(qty) - Number(sel.stok) < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                {Number(qty) - Number(sel.stok) > 0 ? "+" : ""}{formatAngka(Number(qty) - Number(sel.stok))}
              </span>
            </div>
          )}
        </div>
        <div>
          <Label>Alasan (wajib)</Label>
          <Input value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Mis. barang rusak, hilang, hasil opname rutin..." />
        </div>
        <Button disabled={!produkId || !qty || alasan.length < 2 || mut.isPending}
          onClick={() => mut.mutate()}
          className="bg-[var(--navy-900)] hover:bg-[var(--navy-700)]">
          {mut.isPending ? "Menyimpan..." : "Catat Opname"}
        </Button>
      </div>
    </div>
  );
}
