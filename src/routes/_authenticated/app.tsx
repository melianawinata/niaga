import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { getMe } from "@/lib/niaga.functions";
import { Sidebar } from "@/components/niaga-app/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const me = useServerFn(getMe);
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => me({}),
    staleTime: 60_000,
  });

  // Redirect from /app to role-appropriate landing
  useEffect(() => {
    if (!data) return;
    const path = window.location.pathname;
    if (path === "/app" || path === "/app/") {
      nav({ to: data.isAdmin ? "/app/dashboard" : "/app/beranda", replace: true });
    }
  }, [data, nav]);

  if (isLoading) return <div className="min-h-screen grid place-items-center text-sm text-[var(--ink-soft)]">Memuat…</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen flex bg-[var(--off-white)]">
      <Sidebar isAdmin={data.isAdmin} namaUsaha={data.tenant?.nama_usaha ?? ""} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[var(--line)] bg-white flex items-center justify-between px-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--ink-soft)]">
            {data.tenant?.nama_usaha} <span className="opacity-50 mx-2">/</span> {data.isAdmin ? "Admin" : "Operasional"}
          </div>
          <div className="text-xs font-mono text-[var(--ink-soft)]">
            {data.profile?.nama} · <span className="uppercase tracking-widest">{data.roles[0]}</span>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-[1280px] w-full">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
