import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============== AUTH / ME ==============
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, nama, email, tenant_id").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const { data: tenant } = profile
      ? await supabase.from("tenants").select("id, nama_usaha, paket").eq("id", profile.tenant_id).maybeSingle()
      : { data: null };
    const roleList = (roles ?? []).map((r) => r.role as string);
    return {
      userId,
      profile,
      tenant,
      roles: roleList,
      isAdmin: roleList.includes("pemilik") || roleList.includes("keuangan"),
      isPemilik: roleList.includes("pemilik"),
      isKasir: roleList.includes("kasir"),
      isGudang: roleList.includes("gudang"),
    };
  });

// ============== DASHBOARD ==============
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const trenStart = new Date(Date.now() - 30 * 86400000).toISOString();

    const [salesToday, kas, piutang, stok, tren, terlaris] = await Promise.all([
      supabase.from("penjualan").select("total, hpp_total").gte("tanggal", start),
      supabase.from("akun_kas").select("saldo"),
      supabase.from("hutang_piutang").select("sisa, jatuh_tempo").eq("tipe", "piutang").neq("status", "LUNAS"),
      supabase.from("produk").select("id, nama, stok, stok_min"),
      supabase.from("penjualan").select("tanggal, total").gte("tanggal", trenStart).order("tanggal"),
      supabase.from("detail_transaksi")
        .select("qty, produk:produk_id(nama)")
        .not("penjualan_id", "is", null)
        .limit(500),
    ]);

    const todayTotal = (salesToday.data ?? []).reduce((a, b) => a + Number(b.total), 0);
    const todayLaba = (salesToday.data ?? []).reduce((a, b) => a + (Number(b.total) - Number(b.hpp_total)), 0);
    const saldoKas = (kas.data ?? []).reduce((a, b) => a + Number(b.saldo), 0);
    const piutangJT = (piutang.data ?? []).filter((p) =>
      p.jatuh_tempo && new Date(p.jatuh_tempo).getTime() < Date.now() + 7 * 86400000
    );
    const piutangJTTotal = piutangJT.reduce((a, b) => a + Number(b.sisa), 0);
    const stokMenipis = (stok.data ?? []).filter((p) => Number(p.stok) <= Number(p.stok_min));

    // bucket per hari
    const bucket: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      bucket[d.toISOString().slice(0, 10)] = 0;
    }
    (tren.data ?? []).forEach((r) => {
      const k = new Date(r.tanggal).toISOString().slice(0, 10);
      if (k in bucket) bucket[k] += Number(r.total);
    });
    const trenSeries = Object.entries(bucket).map(([d, total]) => ({ d, total }));

    const terlarisAgg: Record<string, number> = {};
    (terlaris.data ?? []).forEach((r: any) => {
      const nama = r.produk?.nama ?? "—";
      terlarisAgg[nama] = (terlarisAgg[nama] ?? 0) + Number(r.qty);
    });
    const terlarisList = Object.entries(terlarisAgg)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nama, qty]) => ({ nama, qty }));

    return {
      todayTotal, todayLaba, saldoKas,
      piutangJTCount: piutangJT.length, piutangJTTotal,
      stokMenipis: stokMenipis.slice(0, 8),
      stokMenipisCount: stokMenipis.length,
      trenSeries, terlarisList,
    };
  });

// ============== MASTER DATA ==============
export const listProduk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("produk")
      .select("id, sku, nama, satuan, harga_beli, harga_jual, stok, stok_min, kategori_id, kategori:kategori_id(nama)")
      .order("nama");
    if (error) throw error;
    return data ?? [];
  });

export const upsertProduk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    sku: z.string().min(1),
    nama: z.string().min(1),
    kategori_id: z.string().uuid().nullable().optional(),
    satuan: z.string().default("pcs"),
    harga_beli: z.number().nonnegative(),
    harga_jual: z.number().nonnegative(),
    stok: z.number(),
    stok_min: z.number().nonnegative(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof) throw new Error("Tenant tidak ditemukan");
    const payload = { ...data, tenant_id: prof.tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("produk").update(payload).eq("id", data.id).select().single()
      : await supabase.from("produk").insert(payload).select().single();
    if (error) throw error;
    return row;
  });

export const deleteProduk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("produk").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listKategori = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("kategori").select("id, nama").order("nama");
    return data ?? [];
  });

export const upsertKategori = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid().optional(), nama: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof) throw new Error("Tenant tidak ditemukan");
    const payload = { nama: data.nama, tenant_id: prof.tenant_id };
    const r = data.id
      ? await supabase.from("kategori").update(payload).eq("id", data.id).select().single()
      : await supabase.from("kategori").insert(payload).select().single();
    if (r.error) throw r.error;
    return r.data;
  });

export const listSupplier = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("supplier").select("id, nama, kontak, saldo_hutang").order("nama");
    return data ?? [];
  });

export const upsertSupplier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    nama: z.string().min(1), kontak: z.string().optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof) throw new Error("Tenant tidak ditemukan");
    const payload = { nama: data.nama, kontak: data.kontak ?? null, tenant_id: prof.tenant_id };
    const r = data.id
      ? await supabase.from("supplier").update(payload).eq("id", data.id).select().single()
      : await supabase.from("supplier").insert(payload).select().single();
    if (r.error) throw r.error;
    return r.data;
  });

export const listPelanggan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("pelanggan").select("id, nama, kontak, saldo_piutang").order("nama");
    return data ?? [];
  });

export const upsertPelanggan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    nama: z.string().min(1), kontak: z.string().optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof) throw new Error("Tenant tidak ditemukan");
    const payload = { nama: data.nama, kontak: data.kontak ?? null, tenant_id: prof.tenant_id };
    const r = data.id
      ? await supabase.from("pelanggan").update(payload).eq("id", data.id).select().single()
      : await supabase.from("pelanggan").insert(payload).select().single();
    if (r.error) throw r.error;
    return r.data;
  });

export const listAkunKas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("akun_kas").select("id, nama, saldo").order("nama");
    return data ?? [];
  });

// ============== TRANSAKSI ==============
const itemPenjualanSchema = z.object({
  produk_id: z.string().uuid(),
  qty: z.number().positive(),
  harga: z.number().nonnegative().optional(),
});

export const buatPenjualan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    items: z.array(itemPenjualanSchema).min(1),
    jenis_bayar: z.enum(["tunai", "kredit"]),
    pelanggan_id: z.string().uuid().nullable().optional(),
    jatuh_tempo: z.string().nullable().optional(),
    akun_kas_id: z.string().uuid().nullable().optional(),
    catatan: z.string().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("rpc_buat_penjualan", {
      _items: data.items as any,
      _jenis_bayar: data.jenis_bayar,
      _pelanggan_id: data.pelanggan_id ?? undefined,
      _jatuh_tempo: data.jatuh_tempo ?? undefined,
      _akun_kas_id: data.akun_kas_id ?? undefined,
      _catatan: data.catatan ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { id };
  });

export const buatPembelian = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    items: z.array(z.object({
      produk_id: z.string().uuid(),
      qty: z.number().positive(),
      harga_beli: z.number().nonnegative(),
    })).min(1),
    supplier_id: z.string().uuid(),
    jenis_bayar: z.enum(["tunai", "kredit"]),
    jatuh_tempo: z.string().nullable().optional(),
    akun_kas_id: z.string().uuid().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("rpc_buat_pembelian", {
      _items: data.items as any,
      _supplier_id: data.supplier_id,
      _jenis_bayar: data.jenis_bayar,
      _jatuh_tempo: data.jatuh_tempo ?? undefined,
      _akun_kas_id: data.akun_kas_id ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { id };
  });

export const terimaPembayaran = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    hutpiut_id: z.string().uuid(),
    jumlah: z.number().positive(),
    akun_kas_id: z.string().uuid().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("rpc_terima_pembayaran", {
      _hutpiut_id: data.hutpiut_id, _jumlah: data.jumlah, _akun_kas_id: data.akun_kas_id ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { id };
  });

export const opnameProduk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    produk_id: z.string().uuid(), qty_fisik: z.number().min(0), alasan: z.string().min(2),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("rpc_opname", {
      _produk_id: data.produk_id, _qty_fisik: data.qty_fisik, _alasan: data.alasan,
    });
    if (error) throw new Error(error.message);
    return { id };
  });

// ============== LIST PENJUALAN / PEMBELIAN ==============
export const listPenjualan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("penjualan")
      .select("id, nomor, tanggal, total, jenis_bayar, kasir_id, pelanggan:pelanggan_id(nama)")
      .order("tanggal", { ascending: false }).limit(100);
    return data ?? [];
  });

export const getPenjualan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [p, items] = await Promise.all([
      context.supabase.from("penjualan").select("*, pelanggan:pelanggan_id(nama)").eq("id", data.id).maybeSingle(),
      context.supabase.from("detail_transaksi").select("qty, harga, hpp, produk:produk_id(nama, satuan)").eq("penjualan_id", data.id),
    ]);
    return { penjualan: p.data, items: items.data ?? [] };
  });

export const listPembelian = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("pembelian")
      .select("id, nomor, tanggal, total, status, jenis_bayar, supplier:supplier_id(nama)")
      .order("tanggal", { ascending: false }).limit(100);
    return data ?? [];
  });

// ============== KARTU STOK ==============
export const kartuStok = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ produk_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [prod, gerakan] = await Promise.all([
      context.supabase.from("produk").select("id, nama, sku, stok, satuan").eq("id", data.produk_id).maybeSingle(),
      context.supabase.from("pergerakan_stok").select("*").eq("produk_id", data.produk_id).order("tanggal", { ascending: false }).limit(100),
    ]);
    return { produk: prod.data, gerakan: gerakan.data ?? [] };
  });

// ============== HUTANG/PIUTANG ==============
export const listPiutang = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("hutang_piutang")
      .select("id, total, sisa, jatuh_tempo, status, created_at, pelanggan:pelanggan_id(nama)")
      .eq("tipe", "piutang").neq("status", "LUNAS")
      .order("jatuh_tempo");
    return data ?? [];
  });

export const listHutang = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("hutang_piutang")
      .select("id, total, sisa, jatuh_tempo, status, created_at, supplier:supplier_id(nama)")
      .eq("tipe", "hutang").neq("status", "LUNAS")
      .order("jatuh_tempo");
    return data ?? [];
  });

// ============== AUDIT ==============
export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });
