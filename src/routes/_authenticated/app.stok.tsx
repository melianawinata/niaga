import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProduk, kartuStok } from "@/lib/niaga.functions";
import { Section, DataTable, EmptyState } from "@/components/niaga-app/parts";
import { formatRupiah, formatAngka, formatTanggalJam } from "@/lib/format";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/app/stok")({ component: StokPage });

function StokPage() {
  const lp = useServerFn(listProduk);
  const ks = useServerFn(kartuStok);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lp({}) });
  const { data: kartu } = useQuery({
    queryKey: ["kartu", sel], queryFn: () => ks({ data: { produk_id: sel! } }), enabled: !!sel,
  });
  const filtered = rows.filter((r: any) => !q || r.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <Section number="05" title="Kartu Stok" action={<Input placeholder="Cari produk..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable data={filtered} empty={<EmptyState title="Belum ada produk" />}
          columns={[
            { key: "nama", label: "Produk", render: (r: any) => <button onClick={() => setSel(r.id)} className={`text-left hover:underline ${sel === r.id ? "font-semibold text-[var(--navy-700)]" : ""}`}>{r.nama}</button> },
            { key: "stok", label: "Stok", align: "right", render: (r: any) => <span className={Number(r.stok) <= Number(r.stok_min) ? "text-[var(--danger)]" : ""}>{formatAngka(r.stok)} {r.satuan}</span> },
            { key: "hb", label: "HPP", align: "right", render: (r: any) => formatRupiah(r.harga_beli) },
          ]} />
        <div className="border border-[var(--line)] bg-white p-5">
          {!sel ? <div className="text-sm text-[var(--ink-soft)]">Pilih produk untuk melihat kartu stok.</div> : kartu ? (
            <>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">{kartu.produk?.sku}</div>
              <div className="font-display text-xl">{kartu.produk?.nama}</div>
              <div className="font-mono tabular-nums text-sm mt-1">Stok kini: {formatAngka(kartu.produk?.stok)} {kartu.produk?.satuan}</div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Pergerakan</div>
              <ul className="mt-2 divide-y divide-[var(--line)] text-sm">
                {kartu.gerakan.length === 0 ? <li className="text-xs text-[var(--ink-soft)] py-2">Belum ada gerakan</li> : kartu.gerakan.map((g: any) => (
                  <li key={g.id} className="py-1.5 flex justify-between">
                    <span><span className="font-mono uppercase text-[10px] tracking-widest text-[var(--ink-soft)]">{g.tipe}</span> · {formatTanggalJam(g.tanggal)} {g.alasan && <span className="text-xs text-[var(--ink-soft)]">— {g.alasan}</span>}</span>
                    <span className={`font-mono tabular-nums ${g.tipe === "out" ? "text-[var(--danger)]" : g.tipe === "in" ? "text-[var(--success)]" : ""}`}>{g.tipe === "out" ? "−" : g.tipe === "in" ? "+" : "±"}{formatAngka(Math.abs(Number(g.qty)))}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : <div className="text-sm text-[var(--ink-soft)]">Memuat...</div>}
        </div>
      </div>
    </div>
  );
}
