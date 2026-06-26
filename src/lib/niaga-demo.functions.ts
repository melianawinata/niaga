import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Demo seed: creates 2 users (admin "Bu Sri", kasir "Andi") in one tenant
// with master data + sample sales. Idempotent — safe to call multiple times.
const DEMO_ADMIN = { email: "bu.sri@demo.niaga", password: "demo1234", nama: "Bu Sri" };
const DEMO_KASIR = { email: "andi@demo.niaga", password: "demo1234", nama: "Andi" };

export const seedDemo = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).parse(d ?? {}))
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let adminId: string | undefined;
    let kasirId: string | undefined;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    for (const u of list?.users ?? []) {
      if (u.email === DEMO_ADMIN.email) adminId = u.id;
      if (u.email === DEMO_KASIR.email) kasirId = u.id;
    }

    if (!adminId) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_ADMIN.email, password: DEMO_ADMIN.password, email_confirm: true,
        user_metadata: { nama: DEMO_ADMIN.nama, nama_usaha: "Toko Sumber Rejeki", role: "pemilik" },
      });
      if (error) throw new Error("Gagal buat admin: " + error.message);
      adminId = data.user!.id;
    }
    const ADMIN_ID: string = adminId!;

    const { data: adminProf } = await supabaseAdmin.from("profiles").select("tenant_id").eq("id", ADMIN_ID).maybeSingle();
    const tenantId = adminProf?.tenant_id;
    if (!tenantId) throw new Error("Admin profile missing");

    if (!kasirId) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_KASIR.email, password: DEMO_KASIR.password, email_confirm: true,
        user_metadata: { nama: DEMO_KASIR.nama, tenant_id: tenantId, role: "kasir" },
      });
      if (error) throw new Error("Gagal buat kasir: " + error.message);
      kasirId = data.user!.id;
    }

    const { count: prodCount } = await supabaseAdmin
      .from("produk").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId);
    if ((prodCount ?? 0) > 0) {
      return { adminEmail: DEMO_ADMIN.email, kasirEmail: DEMO_KASIR.email, password: "demo1234", seeded: false };
    }

    // Kategori
    const kategoriRows = ["Sembako", "Minuman", "Bumbu", "Lain-lain"].map((nama) => ({ tenant_id: tenantId, nama }));
    const { data: kategoris } = await supabaseAdmin.from("kategori").insert(kategoriRows).select();
    const katId = (n: string) => kategoris?.find((k) => k.nama === n)?.id;

    // Produk
    const produk = [
      ["BRS-5KG", "Beras Premium 5kg", "Sembako", "karung", 58000, 68000, 40, 10],
      ["BRS-25KG", "Beras 25kg", "Sembako", "karung", 270000, 305000, 12, 5],
      ["GLA-1KG", "Gula Pasir 1kg", "Sembako", "kg", 13000, 16000, 60, 15],
      ["MGR-2L", "Minyak Goreng 2L", "Sembako", "botol", 28000, 34500, 35, 12],
      ["MGR-1L", "Minyak Goreng 1L", "Sembako", "botol", 15000, 19000, 8, 12],
      ["TLR-1KG", "Telur Ayam 1kg", "Sembako", "kg", 24000, 29000, 25, 10],
      ["MIE-IND", "Mie Instan (dus 40)", "Sembako", "dus", 96000, 118000, 6, 8],
      ["KOP-200G", "Kopi Bubuk 200g", "Minuman", "pcs", 18000, 24000, 20, 8],
      ["TEH-25", "Teh Celup isi 25", "Minuman", "kotak", 6500, 9000, 45, 15],
      ["GRM-250G", "Garam Halus 250g", "Bumbu", "pcs", 2500, 4000, 80, 30],
      ["KCP-600", "Kecap Manis 600ml", "Bumbu", "botol", 14000, 18500, 18, 10],
      ["SBN-MD", "Sabun Mandi", "Lain-lain", "pcs", 3500, 5500, 4, 20],
    ] as const;
    await supabaseAdmin.from("produk").insert(produk.map(([sku, nama, kat, sat, hb, hj, stk, min]) => ({
      tenant_id: tenantId, sku, nama, kategori_id: katId(kat) ?? null, satuan: sat,
      harga_beli: hb, harga_jual: hj, stok: stk, stok_min: min,
    })));

    await supabaseAdmin.from("supplier").insert([
      { tenant_id: tenantId, nama: "CV Sumber Pangan", kontak: "0812-1111-2222" },
      { tenant_id: tenantId, nama: "UD Berkah Jaya", kontak: "0813-3333-4444" },
      { tenant_id: tenantId, nama: "PT Sinar Sembako", kontak: "021-555-1111" },
      { tenant_id: tenantId, nama: "Toko Grosir Maju", kontak: "0856-7777-8888" },
    ]);

    const { data: pelanggan } = await supabaseAdmin.from("pelanggan").insert([
      { tenant_id: tenantId, nama: "Warung Bu Ani", kontak: "0812-9999-1111" },
      { tenant_id: tenantId, nama: "Kantin Sekolah Mawar", kontak: "0813-8888-2222" },
      { tenant_id: tenantId, nama: "Cafe Sederhana", kontak: "0856-7777-3333" },
      { tenant_id: tenantId, nama: "Warteg Pak Joko", kontak: "0857-6666-4444" },
      { tenant_id: tenantId, nama: "Toko Sembako Hidayah", kontak: "0858-5555-5555" },
      { tenant_id: tenantId, nama: "Pelanggan Umum", kontak: null },
    ]).select();

    await supabaseAdmin.from("akun_kas").update({ saldo: 5000000 }).eq("tenant_id", tenantId);
    const { data: kasList } = await supabaseAdmin.from("akun_kas").select("id").eq("tenant_id", tenantId).limit(1);
    const kasId = kasList?.[0]?.id;

    const { data: prodList } = await supabaseAdmin.from("produk")
      .select("id, harga_jual, harga_beli, nama").eq("tenant_id", tenantId);

    if (!prodList?.length || !pelanggan?.length || !kasId) {
      return { adminEmail: DEMO_ADMIN.email, kasirEmail: DEMO_KASIR.email, password: "demo1234", seeded: true };
    }

    const KAS_ID: string = kasId;
    const PROD = prodList;
    const PEL = pelanggan;
    const now = Date.now();

    const tunaiSale = async (daysAgo: number, items: Array<{ idx: number; qty: number }>) => {
      const tgl = new Date(now - daysAgo * 86400000).toISOString();
      let total = 0, hpp = 0;
      const details = items.map((it) => {
        const p = PROD[it.idx];
        total += Number(p.harga_jual) * it.qty;
        hpp += Number(p.harga_beli) * it.qty;
        return { p, qty: it.qty };
      });
      const { data: pj } = await supabaseAdmin.from("penjualan").insert({
        tenant_id: tenantId, nomor: "INV-SEED-" + Math.random().toString(36).slice(2, 8),
        tanggal: tgl, total, hpp_total: hpp, jenis_bayar: "tunai",
        akun_kas_id: KAS_ID, kasir_id: ADMIN_ID,
      }).select("id").single();
      if (!pj) return;
      for (const d of details) {
        await supabaseAdmin.from("detail_transaksi").insert({
          tenant_id: tenantId, penjualan_id: pj.id, produk_id: d.p.id,
          qty: d.qty, harga: d.p.harga_jual, hpp: d.p.harga_beli,
        });
        await supabaseAdmin.from("pergerakan_stok").insert({
          tenant_id: tenantId, produk_id: d.p.id, tipe: "out", qty: d.qty,
          sumber_tipe: "penjualan", sumber_id: pj.id, oleh: ADMIN_ID, tanggal: tgl,
        });
      }
    };

    const kreditSale = async (daysAgo: number, dueDaysFromCreate: number, pelIdx: number, items: Array<{ idx: number; qty: number }>) => {
      const tgl = new Date(now - daysAgo * 86400000).toISOString();
      let total = 0, hpp = 0;
      const details = items.map((it) => {
        const p = PROD[it.idx];
        total += Number(p.harga_jual) * it.qty;
        hpp += Number(p.harga_beli) * it.qty;
        return { p, qty: it.qty };
      });
      const due = new Date(now - daysAgo * 86400000 + dueDaysFromCreate * 86400000).toISOString().slice(0, 10);
      const { data: pj } = await supabaseAdmin.from("penjualan").insert({
        tenant_id: tenantId, nomor: "INV-SEED-" + Math.random().toString(36).slice(2, 8),
        tanggal: tgl, total, hpp_total: hpp, jenis_bayar: "kredit",
        jatuh_tempo: due, pelanggan_id: PEL[pelIdx].id, kasir_id: ADMIN_ID,
      }).select("id").single();
      if (!pj) return;
      for (const d of details) {
        await supabaseAdmin.from("detail_transaksi").insert({
          tenant_id: tenantId, penjualan_id: pj.id, produk_id: d.p.id,
          qty: d.qty, harga: d.p.harga_jual, hpp: d.p.harga_beli,
        });
        await supabaseAdmin.from("pergerakan_stok").insert({
          tenant_id: tenantId, produk_id: d.p.id, tipe: "out", qty: d.qty,
          sumber_tipe: "penjualan", sumber_id: pj.id, oleh: ADMIN_ID, tanggal: tgl,
        });
      }
      await supabaseAdmin.from("hutang_piutang").insert({
        tenant_id: tenantId, tipe: "piutang", penjualan_id: pj.id, pelanggan_id: PEL[pelIdx].id,
        total, sisa: total, jatuh_tempo: due,
      });
      await supabaseAdmin.from("pelanggan").update({ saldo_piutang: total }).eq("id", PEL[pelIdx].id);
    };

    const transaksi: Array<[number, Array<{ idx: number; qty: number }>]> = [
      [0, [{ idx: 0, qty: 2 }, { idx: 3, qty: 1 }]],
      [0, [{ idx: 2, qty: 3 }, { idx: 8, qty: 2 }]],
      [1, [{ idx: 5, qty: 2 }, { idx: 9, qty: 4 }]],
      [1, [{ idx: 0, qty: 1 }, { idx: 7, qty: 1 }]],
      [2, [{ idx: 3, qty: 2 }]],
      [3, [{ idx: 2, qty: 5 }, { idx: 9, qty: 2 }]],
      [5, [{ idx: 1, qty: 1 }]],
      [7, [{ idx: 0, qty: 3 }, { idx: 5, qty: 2 }]],
      [9, [{ idx: 10, qty: 2 }, { idx: 7, qty: 1 }]],
      [11, [{ idx: 3, qty: 3 }]],
      [14, [{ idx: 8, qty: 3 }, { idx: 9, qty: 5 }]],
      [17, [{ idx: 0, qty: 2 }]],
      [20, [{ idx: 1, qty: 1 }, { idx: 3, qty: 1 }]],
      [24, [{ idx: 5, qty: 4 }]],
    ];
    for (const [days, items] of transaksi) await tunaiSale(days, items);

    await kreditSale(40, 14, 0, [{ idx: 0, qty: 5 }, { idx: 3, qty: 3 }]);
    await kreditSale(20, 14, 1, [{ idx: 2, qty: 10 }]);
    await kreditSale(10, 14, 2, [{ idx: 5, qty: 4 }, { idx: 7, qty: 3 }]);
    await kreditSale(3, 14, 3, [{ idx: 0, qty: 2 }, { idx: 9, qty: 5 }]);

    return { adminEmail: DEMO_ADMIN.email, kasirEmail: DEMO_KASIR.email, password: "demo1234", seeded: true };
  });
