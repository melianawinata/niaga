import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/niaga.functions";
import { Section } from "@/components/niaga-app/parts";

export const Route = createFileRoute("/_authenticated/app/pengaturan")({ component: SettingsPage });

function SettingsPage() {
  const me = useServerFn(getMe);
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => me({}) });
  return (
    <div>
      <Section number="08" title="Pengaturan" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[var(--line)] bg-white p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Profil Usaha</div>
          <div className="font-display text-xl mt-1">{data?.tenant?.nama_usaha ?? "—"}</div>
          <div className="text-xs text-[var(--ink-soft)] mt-1">Paket: {data?.tenant?.paket ?? "—"} · Zona: WIB</div>
        </div>
        <div className="border border-[var(--line)] bg-white p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-soft)]">Pengguna Anda</div>
          <div className="font-display text-xl mt-1">{data?.profile?.nama}</div>
          <div className="text-xs font-mono text-[var(--ink-soft)] mt-1">{data?.profile?.email} · peran {data?.roles?.join(", ")}</div>
        </div>
      </div>
      <div className="mt-6 text-xs text-[var(--ink-soft)] border border-[var(--line)] p-3 bg-[var(--off-white)]">
        Manajemen pengguna multi-akun (undang via email + atur peran) akan tersedia di iterasi berikutnya.
      </div>
    </div>
  );
}
