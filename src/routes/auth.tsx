import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { seedDemo } from "@/lib/niaga-demo.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk — NiagaERP" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [namaUsaha, setNamaUsaha] = useState("");
  const [loading, setLoading] = useState(false);
  const seed = useServerFn(seedDemo);
  const seedMut = useMutation({
    mutationFn: () => seed({ data: {} }),
    onSuccess: async (r) => {
      toast.success(r.seeded ? "Akun demo dibuat — masuk dengan tombol di bawah." : "Akun demo siap.");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menyiapkan demo"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk");
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/app",
            data: { nama, nama_usaha: namaUsaha || "Usaha Saya", role: "pemilik" } },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Periksa email atau masuk langsung.");
        // Try auto-signin if email confirm is off
        await supabase.auth.signInWithPassword({ email, password });
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal");
    } finally {
      setLoading(false);
    }
  }

  async function loginAs(em: string, pw: string) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (e: any) {
      toast.error("Akun demo belum disiapkan — klik 'Siapkan Demo' dulu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--navy-900)] text-white">
        <div>
          <Link to="/" className="text-xs uppercase tracking-[0.2em] font-mono opacity-70">← NiagaERP</Link>
          <h1 className="mt-10 font-display text-4xl leading-tight">ERP mini untuk UMKM dagang.</h1>
          <p className="mt-3 text-sm opacity-80 max-w-sm">Satu input, pembaruan otomatis: stok, kas, hutang-piutang.</p>
        </div>
        <div className="space-y-2 text-xs font-mono opacity-70">
          <p className="uppercase tracking-widest">Demo siap pakai</p>
          <p>• Bu Sri (Pemilik) — dashboard penuh + laba</p>
          <p>• Andi (Kasir) — kasir + tugas harian</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-sm w-full mx-auto">
          <div className="flex gap-1 mb-8 border border-[var(--line)] p-1 rounded-md">
            <button onClick={() => setMode("signin")}
              className={`flex-1 text-sm py-2 rounded ${mode === "signin" ? "bg-[var(--navy-900)] text-white" : "text-[var(--ink-soft)]"}`}>
              Masuk
            </button>
            <button onClick={() => setMode("signup")}
              className={`flex-1 text-sm py-2 rounded ${mode === "signup" ? "bg-[var(--navy-900)] text-white" : "text-[var(--ink-soft)]"}`}>
              Daftar Baru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && <>
              <div><Label>Nama Anda</Label><Input value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
              <div><Label>Nama Usaha</Label><Input value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} placeholder="Toko Saya" /></div>
            </>}
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label>Kata Sandi</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
            <Button type="submit" disabled={loading} className="w-full bg-[var(--navy-900)] hover:bg-[var(--navy-700)]">
              {loading ? "Memproses..." : (mode === "signin" ? "Masuk" : "Daftar")}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[var(--ink-soft)] font-mono">
            <div className="flex-1 h-px bg-[var(--line)]" />Coba akun demo<div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
              <span>1. Siapkan Akun Demo</span>
              <span className="text-xs font-mono text-[var(--ink-soft)]">{seedMut.isPending ? "..." : "→"}</span>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => loginAs("bu.sri@demo.niaga", "password")} disabled={loading}>
              <span>2a. Masuk sebagai <strong>Bu Sri</strong></span>
              <span className="text-xs font-mono text-[var(--ink-soft)]">PEMILIK</span>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => loginAs("andi@demo.niaga", "password")} disabled={loading}>
              <span>2b. Masuk sebagai <strong>Andi</strong></span>
              <span className="text-xs font-mono text-[var(--ink-soft)]">KASIR</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
