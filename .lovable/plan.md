
# Niaga ERP — Aplikasi Web (Full Build)

Landing tetap di `/`. Aplikasi di bawah `/app/*` (terproteksi), `/auth` untuk login.

## 1. Lovable Cloud (Supabase) — Skema

Enable Cloud, lalu migration tunggal yang membuat semua tabel dengan `tenant_id`, RLS, dan GRANT.

**Enum & RBAC**
- `app_role`: `pemilik | kasir | gudang | keuangan`
- `user_roles(user_id, role, tenant_id)` + fungsi `has_role(uid, role)` & `current_tenant(uid)` (SECURITY DEFINER).

**Tabel inti** (semua dengan `tenant_id uuid not null` + RLS `tenant_id = current_tenant(auth.uid())`):
`tenants`, `profiles(id→auth.users, nama, tenant_id)`, `kategori`, `produk`, `supplier`, `pelanggan`, `akun_kas`, `pembelian`, `penjualan`, `detail_transaksi`, `pergerakan_stok`, `hutang_piutang`, `pembayaran`, `audit_log`.

**Atomic logic** dilakukan via Postgres functions (`SECURITY DEFINER`) — satu RPC = satu transaksi DB:
- `rpc_buat_penjualan(items[], jenis_bayar, pelanggan_id?, jatuh_tempo?, akun_kas_id?)` → insert `penjualan` + `detail_transaksi`, kurangi `produk.stok`, insert `pergerakan_stok`, jika tunai update `akun_kas.saldo`, jika kredit buat `hutang_piutang(tipe=piutang)`, tulis `audit_log`. Reject bila stok kurang.
- `rpc_buat_pembelian(...)` mirror untuk pembelian → stok naik, HPP (`harga_beli`) weighted avg, hutang/kas keluar.
- `rpc_terima_pembayaran(hutpiut_id, jumlah, akun_kas_id)` → kurangi `sisa`, update status `LUNAS/SEBAGIAN`, gerakan kas.
- `rpc_opname(produk_id, qty_fisik, alasan)` → adjust + audit.

**Trigger**: `handle_new_user` membuat `profiles` + `tenants` baru bila signup pertama, atau menempel ke tenant via invite (MVP: tiap signup = pemilik tenant baru). Seed Demo: tombol di `/auth` "Coba akun demo" memanggil edge-less server fn yang melakukan `signInWithPassword` ke 2 akun tersemai via migration seed.

**Seed (di migration)**: tenant "Toko Sumber Rejeki", 2 user (bu-sri@demo.niaga / andi@demo.niaga, password `demo1234`) + role, 12 produk sembako, 4 supplier, 6 pelanggan (sebagian piutang lewat tempo), 1 akun kas "Kas Toko" (Rp 5jt), 18 penjualan + 4 pembelian historis (memakai RPC supaya semua turunan konsisten).

## 2. Routing & Auth Gate

```
src/routes/
  __root.tsx           (font links, onAuthStateChange)
  index.tsx            (landing — existing)
  auth.tsx             (login + tombol demo Admin/Kasir)
  _authenticated/
    route.tsx          (managed gate, ssr:false)
    app.tsx            (AppShell layout: Sidebar + Topbar + <Outlet/>)
    app.index.tsx      → redirect ke /app/dashboard atau /app/beranda berdasar role
    app.dashboard.tsx           (Admin)
    app.produk.tsx / app.produk.$id.tsx
    app.kategori.tsx
    app.supplier.tsx
    app.pelanggan.tsx
    app.import.tsx              (wizard CSV — placeholder parsing real)
    app.penjualan.tsx           (riwayat)
    app.penjualan.baru.tsx      (kasir mode; tersedia utk admin+kasir)
    app.pembelian.tsx
    app.pembelian.baru.tsx
    app.stok.tsx                (kartu stok)
    app.stok.opname.tsx
    app.keuangan.piutang.tsx    (Admin/keuangan)
    app.keuangan.hutang.tsx
    app.keuangan.kas.tsx
    app.laporan.tsx
    app.pengaturan.pengguna.tsx
    app.pengaturan.profil.tsx
    app.pengaturan.audit.tsx
    app.beranda.tsx             (User home tanpa laba)
    app.akun.tsx
```

Sidebar di-render dari array menu yang difilter `hasRole`. `beforeLoad` tiap rute admin-only memanggil `has_role` via context → redirect ke `/app/beranda` jika tidak berhak (RBAC server-side juga ditegakkan via RLS + RPC permission check).

## 3. Server Functions (TanStack)

`src/lib/niaga.functions.ts` — semua pakai `requireSupabaseAuth`:
- queries: `getDashboard`, `listProduk`, `getKartuStok`, `listPiutang(aging)`, `listHutang`, `listPenjualan`, `getAuditLog`, `listPengguna`, dll.
- mutations: wrappers utk RPC di atas + CRUD master data.

Query layer: TanStack Query + `useSuspenseQuery`, invalidate setelah mutasi.

## 4. Design System (Swiss)

Tambah token di `src/styles.css`:
- `--navy-900/700/500`, `--surface #F5F7FB`, `--line #E2E8F0`, `--ink/-soft/-faint`, `--accent #FFD43B`, semantik `--up/--down/--warn/--info`.
- Tipografi: Space Grotesk (heading), Inter (body), IBM Plex Mono (label/angka — `font-variant-numeric: tabular-nums`). Loaded via `<link>` di `__root.tsx`.

Komponen reusable di `src/components/niaga/`:
- `AppShell`, `Sidebar`, `Topbar`, `KpiCard`, `DataTable` (header mono uppercase, hairline rows, sticky, pagination, filter, search), `StatusBadge`, `MoneyCell`, `EmptyState`, `Section` (numbered editorial heading), `FormField`, `ConfirmDialog`, `Drawer` (pakai shadcn Sheet), `Toaster` (sonner).
- Mobile: sidebar → Sheet drawer; tabel jadi card list di < md.

Aturan: tanpa gradient/shadow tebal; flat fill + hairline; accent kuning hanya badge state aktif.

## 5. Halaman — Cakupan Fungsional

**Admin (8 area)** — semuanya wired end-to-end via RPC di atas:
1. Dashboard: KPI (Penjualan hari ini, Saldo kas, Piutang JT, Stok menipis), tren 30 hari (chart sederhana — recharts), produk terlaris, daftar aksi cepat.
2. Data Induk: CRUD produk/kategori/supplier/pelanggan + halaman Import (UI wizard 3 langkah; parsing CSV via PapaParse client-side, insert batch via server fn).
3. Penjualan: riwayat (filter tanggal/pelanggan/produk) + kasir baru (cart, pencarian SKU/nama, tunai/kredit + jatuh tempo, kembalian, tombol "Cetak Nota" → window.print view, "Kirim WA" placeholder).
4. Pembelian: PO draft → dikirim → diterima; penerimaan memicu RPC pembelian.
5. Stok: kartu stok per produk (riwayat gerakan, link ke transaksi sumber), opname dengan alasan wajib, daftar stok ≤ min.
6. Keuangan: Piutang (aging 0–30/31–60/61–90/>90, color-coded, catat pembayaran, kirim reminder placeholder), Hutang (mirror), Kas & Bank (jurnal kas, biaya operasional manual).
7. Laporan: penjualan/persediaan/laba kotor/AR-AP; ekspor CSV (PDF placeholder).
8. Pengaturan: pengguna & peran (invite via email + role select), profil usaha, audit log (read-only timeline).

**User (5 area)** — menu & route admin tidak ter-register di sidebar; route admin redirect ke `/app/beranda`:
1. Beranda: penjualan hari ini (jumlah & nilai — tanpa laba), tugas, shortcut Transaksi Baru.
2. Kasir + Riwayat saya (filter `kasir_id = auth.uid()` via RLS).
3. Stok terbatas: cek stok tanpa kolom harga_beli/HPP (server fn drop kolom sebelum return), terima barang, opname.
4. Piutang terbatas: lihat & catat pembayaran (RLS izinkan SELECT + INSERT pembayaran, blok UPDATE master).
5. Akun saya: profil + ganti password.

## 6. Lokalisasi & Format
`src/lib/format.ts`: `formatRupiah` (Intl `id-ID`, pemisah titik), `formatTanggal` (WIB), `formatJam`. Semua copy Bahasa Indonesia.

## 7. State, Validasi, A11y
- Loading: skeleton di tabel/KPI.
- Empty state per modul dengan CTA.
- Error boundary per route (errorComponent + notFoundComponent).
- Validasi Zod di setiap inputValidator; pesan error Bahasa Indonesia (qty>stok = peringatan, simpan tetap blok).
- Focus ring visible, label semua input, kontras AA.
- Mobile-first: breakpoint sm/md/lg; sentuh ≥44px.

## 8. Out of Scope / Placeholder
- Kirim WA reminder & nota: tombol dengan toast "Akan tersedia — terhubung WA Business API".
- Ekspor PDF: tombol disable + tooltip; CSV aktif.
- Multi-tenant invite: MVP 1 tenant per signup; halaman Pengguna bisa tambah user via email magic-link sederhana.

## 9. Urutan Kerja
1. Enable Lovable Cloud.
2. Migration: enum, tabel, RLS, GRANT, fungsi `has_role/current_tenant`, RPC transaksi, trigger user, seed.
3. Buat akun demo via Supabase admin (signup programmatic dalam migration `DO` block) — atau halaman /auth dengan tombol "Buat akun demo" yang idempotent.
4. Routes + AppShell + design tokens + komponen Niaga.
5. Server fns + Query wiring per modul (Admin dulu, lalu mode User).
6. Seed riwayat transaksi via RPC supaya dashboard/laporan berisi.
7. Verifikasi: typecheck + Playwright login dua peran, jalankan 1 transaksi penjualan dan pastikan stok+kas+piutang berubah.
