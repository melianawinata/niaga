import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, Tags, Truck, Users, ShoppingCart, ReceiptText,
  Boxes, Wallet, Coins, BarChart3, Settings, FileText, ClipboardList, Home, LogOut, Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

type MenuItem = { to: string; label: string; icon: any; admin?: boolean };

const MENU_ADMIN: { group: string; items: MenuItem[] }[] = [
  { group: "Ringkasan", items: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Transaksi", items: [
    { to: "/app/penjualan/baru", label: "Kasir Baru", icon: ShoppingCart },
    { to: "/app/penjualan", label: "Riwayat Penjualan", icon: ReceiptText },
    { to: "/app/pembelian", label: "Pembelian", icon: Truck },
  ]},
  { group: "Data Induk", items: [
    { to: "/app/produk", label: "Produk", icon: Package },
    { to: "/app/kategori", label: "Kategori", icon: Tags },
    { to: "/app/supplier", label: "Supplier", icon: Building2 },
    { to: "/app/pelanggan", label: "Pelanggan", icon: Users },
  ]},
  { group: "Stok", items: [
    { to: "/app/stok", label: "Kartu Stok", icon: Boxes },
    { to: "/app/opname", label: "Opname", icon: ClipboardList },
  ]},
  { group: "Keuangan", items: [
    { to: "/app/piutang", label: "Piutang", icon: Coins },
    { to: "/app/hutang", label: "Hutang", icon: Wallet },
    { to: "/app/kas", label: "Kas & Bank", icon: Wallet },
  ]},
  { group: "Manajemen", items: [
    { to: "/app/laporan", label: "Laporan", icon: BarChart3 },
    { to: "/app/audit", label: "Audit Log", icon: FileText },
    { to: "/app/pengaturan", label: "Pengaturan", icon: Settings },
  ]},
];

const MENU_USER: { group: string; items: MenuItem[] }[] = [
  { group: "Harian", items: [
    { to: "/app/beranda", label: "Beranda", icon: Home },
    { to: "/app/penjualan/baru", label: "Kasir Baru", icon: ShoppingCart },
    { to: "/app/penjualan", label: "Riwayat Saya", icon: ReceiptText },
  ]},
  { group: "Stok", items: [
    { to: "/app/stok", label: "Cek Stok", icon: Boxes },
    { to: "/app/opname", label: "Opname", icon: ClipboardList },
  ]},
  { group: "Tagihan", items: [
    { to: "/app/piutang", label: "Piutang", icon: Coins },
  ]},
  { group: "Akun", items: [
    { to: "/app/akun", label: "Akun Saya", icon: Settings },
  ]},
];

export function Sidebar({ isAdmin, namaUsaha }: { isAdmin: boolean; namaUsaha: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const menu = isAdmin ? MENU_ADMIN : MENU_USER;
  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--line)] bg-[var(--navy-900)] text-white flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-[0.25em] font-mono opacity-60">Niaga ERP</div>
        <div className="mt-1 text-sm font-display font-semibold truncate">{namaUsaha || "—"}</div>
        <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[var(--brand-accent)]">
          {isAdmin ? "Mode Admin" : "Mode Kasir"}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 text-sm">
        {menu.map((g) => (
          <div key={g.group} className="mb-3">
            <div className="px-5 mb-1 text-[10px] uppercase tracking-[0.2em] font-mono opacity-50">{g.group}</div>
            {g.items.map((it) => {
              const active = path === it.to || (it.to !== "/app/dashboard" && path.startsWith(it.to));
              const Icon = it.icon;
              return (
                <Link key={it.to} to={it.to as any}
                  className={`flex items-center gap-3 px-5 py-2 hover:bg-white/5 transition-colors ${active ? "bg-white/10 border-l-2 border-[var(--brand-accent)]" : "border-l-2 border-transparent"}`}>
                  <Icon className="h-4 w-4 opacity-80" />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Keluar
        </Button>
      </div>
    </aside>
  );
}
