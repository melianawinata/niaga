import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/niaga.functions";
import { Section } from "@/components/niaga-app/parts";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/akun")({ component: AkunPage });

function AkunPage() {
  const me = useServerFn(getMe);
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => me({}) });
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function ubahPassword() {
    if (pw.length < 6) return toast.error("Minimal 6 karakter");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) toast.error(error.message); else { toast.success("Kata sandi diubah"); setPw(""); }
  }

  async function keluar() { await supabase.auth.signOut(); nav({ to: "/auth", replace: true }); }

  return (
    <div>
      <Section number="09" title="Akun Saya" />
      <div className="max-w-md border border-[var(--line)] bg-white p-6 space-y-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Nama</div>
          <div className="font-display text-lg">{data?.profile?.nama}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Email</div>
          <div className="text-sm font-mono">{data?.profile?.email}</div>
        </div>
        <div className="border-t border-[var(--line)] pt-4">
          <Label>Ubah Kata Sandi</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="kata sandi baru" />
          <Button className="mt-2 bg-[var(--navy-900)] hover:bg-[var(--navy-700)]" onClick={ubahPassword} disabled={loading}>
            {loading ? "..." : "Simpan"}
          </Button>
        </div>
        <div className="border-t border-[var(--line)] pt-4">
          <Button variant="outline" onClick={keluar}>Keluar dari Akun</Button>
        </div>
      </div>
    </div>
  );
}
