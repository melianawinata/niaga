import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProduk, listPelanggan, buatPenjualan } from "@/lib/niaga.functions";
import { Section } from "@/components/niaga-app/parts";
import { formatRupiah } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/penjualan/baru")({
  component: KasirPage,
});

type CartItem = { produk_id: string; nama: string; sku: string; qty: number; harga: number; stok: number; satuan: string };

function KasirPage() {
  const lp = useServerFn(listProduk);
  const ll = useServerFn(listPelanggan);
  const buat = useServerFn(buatPenjualan);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [jenisBayar, setJenisBayar] = useState<"tunai" | "kredit">("tunai");
  const [pelangganId, setPelangganId] = useState<string>("");
  const [jatuhTempo, setJatuhTempo] = useState<string>("");
  const [bayar, setBayar] = useState<string>("");

  const { data: produk = [] } = useQuery({ queryKey: ["produk"], queryFn: () => lp({}) });
  const { data: pelanggan = [] } = useQuery({ queryKey: ["pelanggan"], queryFn: () => ll({}) });

  const filtered = useMemo(() => {
    if (!q) return [];
    return produk.filter((p: any) =>
      p.nama.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
  }, [q, produk]);

  const total = cart.reduce((a, b) => a + b.qty * b.harga, 0);
  const kembalian = jenisBayar === "tunai" ? Math.max(0, Number(bayar || 0) - total) : 0;

  function addToCart(p: any) {
    setCart((c) => {
      const idx = c.findIndex((x) => x.produk_id === p.id);
      if (idx >= 0) { const n = [...c]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; return n; }
      return [...c, { produk_id: p.id, nama: p.nama, sku: p.sku, qty: 1, harga: Number(p.harga_jual), stok: Number(p.stok), satuan: p.satuan }];
    });
    setQ("");
  }

  function changeQty(idx: number, delta: number) {
    setCart((c) => {
      const n = [...c]; n[idx] = { ...n[idx], qty: Math.max(0, n[idx].qty + delta) };
      return n.filter((x) => x.qty > 0);
    });
  }

  const mut = useMutation({
    mutationFn: () => buat({
      data: {
        items: cart.map((c) => ({ produk_id: c.produk_id, qty: c.qty, harga: c.harga })),
        jenis_bayar: jenisBayar,
        pelanggan_id: jenisBayar === "kredit" ? pelangganId : null,
        jatuh_tempo: jenisBayar === "kredit" ? jatuhTempo : null,
      },
    }),
    onSuccess: () => {
      toast.success("Penjualan tersimpan — stok & kas terbarui");
      setCart([]); setBayar(""); setPelangganId(""); setJatuhTempo("");
      nav({ to: "/app/penjualan" });
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan"),
  });

  return (
    <div>
      <Section number="03" title="Kasir — Transaksi Baru" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-[var(--line)] bg-white p-4">
            <Label>Cari Produk (nama atau SKU)</Label>
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mis. beras, MGR-1L..." />
            {filtered.length > 0 && (
              <div className="mt-2 border border-[var(--line)] divide-y divide-[var(--line)]">
                {filtered.map((p: any) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="w-full flex justify-between items-center px-3 py-2 hover:bg-[var(--off-white)] text-left text-sm">
                    <div>
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs font-mono text-[var(--ink-soft)]">{p.sku} · stok {p.stok} {p.satuan}</div>
                    </div>
                    <div className="font-mono tabular-nums">{formatRupiah(p.harga_jual)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[var(--line)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--off-white)]">
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Produk</th>
                  <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)] w-32 text-center">Qty</th>
                  <th className="text-right px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Harga</th>
                  <th className="text-right px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Subtotal</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-[var(--ink-soft)] py-8">Keranjang kosong — cari produk di atas</td></tr>
                ) : cart.map((c, i) => (
                  <tr key={c.produk_id} className="border-t border-[var(--line)]">
                    <td className="px-3 py-2">
                      <div className="font-medium">{c.nama}</div>
                      <div className="text-xs font-mono text-[var(--ink-soft)]">{c.sku}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(i, -1)}><Minus className="h-3 w-3" /></Button>
                        <span className="font-mono tabular-nums w-10 text-center">{c.qty}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(i, +1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      {c.qty > c.stok && <div className="text-[10px] text-[var(--danger)] mt-0.5">⚠ Lebih dari stok ({c.stok})</div>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{formatRupiah(c.harga)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{formatRupiah(c.qty * c.harga)}</td>
                    <td><Button size="icon" variant="ghost" onClick={() => changeQty(i, -c.qty)}><Trash2 className="h-3 w-3 text-[var(--danger)]" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 border border-[var(--navy-900)] bg-[var(--navy-900)] text-white p-5 h-fit sticky top-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] opacity-60">Total</div>
          <div className="font-mono tabular-nums text-4xl font-display mt-1">{formatRupiah(total)}</div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Jenis Bayar</div>
              <div className="grid grid-cols-2 gap-1 p-1 bg-white/5">
                <button onClick={() => setJenisBayar("tunai")} className={`py-2 text-xs ${jenisBayar === "tunai" ? "bg-[var(--brand-accent)] text-[var(--navy-900)] font-semibold" : ""}`}>TUNAI</button>
                <button onClick={() => setJenisBayar("kredit")} className={`py-2 text-xs ${jenisBayar === "kredit" ? "bg-[var(--brand-accent)] text-[var(--navy-900)] font-semibold" : ""}`}>KREDIT</button>
              </div>
            </div>

            {jenisBayar === "tunai" ? (
              <>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Uang Diterima</div>
                  <Input type="number" value={bayar} onChange={(e) => setBayar(e.target.value)} className="bg-white text-[var(--navy-900)]" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs opacity-60">Kembalian</span>
                  <span className="font-mono tabular-nums text-lg">{formatRupiah(kembalian)}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Pelanggan</div>
                  <select value={pelangganId} onChange={(e) => setPelangganId(e.target.value)}
                    className="w-full bg-white text-[var(--navy-900)] h-9 px-2 text-sm">
                    <option value="">— pilih pelanggan —</option>
                    {pelanggan.map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Jatuh Tempo</div>
                  <Input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="bg-white text-[var(--navy-900)]" />
                </div>
              </>
            )}

            <Button
              disabled={cart.length === 0 || mut.isPending || (jenisBayar === "kredit" && (!pelangganId || !jatuhTempo))}
              onClick={() => mut.mutate()}
              className="w-full bg-[var(--brand-accent)] text-[var(--navy-900)] hover:bg-[var(--brand-accent)]/90 font-semibold mt-2">
              {mut.isPending ? "Menyimpan..." : "SIMPAN TRANSAKSI"}
            </Button>
            <div className="text-[10px] font-mono opacity-50 text-center">Stok, kas, dan piutang akan diperbarui otomatis</div>
          </div>
        </div>
      </div>
    </div>
  );
}
