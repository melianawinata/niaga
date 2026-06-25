import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Niaga — ERP Mini untuk UMKM Dagang" },
      {
        name: "description",
        content:
          "Niaga: ERP mini berbasis cloud untuk UMKM dagang Indonesia. Catat sekali, stok–kas–utang langsung beres. Pengganti Excel yang berantakan.",
      },
      { property: "og:title", content: "Niaga — ERP Mini untuk UMKM Dagang" },
      {
        property: "og:description",
        content:
          "Catat sekali. Stok, kas, dan utang langsung beres. Pindah dari Excel cuma butuh 30 menit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NiagaLanding,
});

/* ---------- Helpers ---------- */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("opacity-0", "translate-y-4");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((n) => {
      n.classList.add(
        "opacity-0",
        "translate-y-4",
        "transition",
        "duration-700",
        "ease-out",
      );
      io.observe(n);
    });
    return () => io.disconnect();
  }, []);
  return ref;
}

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
      <span className="text-navy-700">{num}</span>
      <span className="h-px w-8 bg-line" />
      <span>{label}</span>
    </div>
  );
}

function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

const NAV = [
  { href: "#problem", label: "Masalah" },
  { href: "#solusi", label: "Solusi" },
  { href: "#fitur", label: "Fitur" },
  { href: "#cara", label: "Cara Kerja" },
  { href: "#demo", label: "Demo" },
  { href: "#faq", label: "FAQ" },
];

/* ---------- Navbar ---------- */

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-navy-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-navy-900 font-mono text-sm text-white">N</span>
          niaga
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-ink-soft transition-colors hover:text-navy-700">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <a href="#cta" className="inline-flex h-10 items-center rounded-lg bg-navy-900 px-4 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-navy-700">
            Coba Gratis
          </a>
        </div>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-md border border-line text-navy-900">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {NAV.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base text-navy-900 hover:bg-off-white"
                  >
                    {n.label}
                  </a>
                ))}
                <a
                  href="#cta"
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-navy-900 px-4 text-sm font-medium text-white"
                >
                  Coba Gratis
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line bg-white">
      <Container className="grid gap-14 py-16 md:grid-cols-[1.05fr_1fr] md:py-24 lg:gap-20">
        <div data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-navy-500">
            ERP Mini untuk UMKM Dagang
          </p>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.02] tracking-[-0.02em] text-navy-900 sm:text-[56px] md:text-[68px] lg:text-[78px]">
            Catat sekali.<br />
            Stok, kas, dan utang{" "}
            <span className="relative inline-block">
              langsung beres.
              <span className="absolute inset-x-0 -bottom-1 h-3 -z-0 bg-brand-accent/70" aria-hidden />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Niaga merapikan operasional tokomu — stok, pembelian, penjualan, hutang-piutang — dalam satu sistem
            yang saling nyambung. Pengganti Excel yang berantakan, tanpa kamu harus paham akuntansi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#cta" className="inline-flex h-12 items-center rounded-lg bg-navy-900 px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-navy-700">
              Coba Gratis
            </a>
            <a href="#cara" className="inline-flex h-12 items-center rounded-lg border border-navy-900 px-6 text-sm font-semibold text-navy-900 transition-colors hover:bg-off-white">
              Lihat Cara Kerjanya
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <span>✓ Tanpa kartu kredit</span>
            <span>✓ Setup ≤ 30 menit</span>
            <span>✓ Import dari Excel</span>
          </div>
        </div>

        <div data-reveal className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-off-white" aria-hidden />
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(10,26,60,0.25)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                Dashboard · Hari Ini
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <KpiTile label="Penjualan" value="Rp 4.82jt" delta="+12%" tone="success" />
              <KpiTile label="Kas Masuk" value="Rp 3.10jt" delta="+8%" tone="success" />
              <KpiTile label="Piutang Jatuh Tempo" value="Rp 1.45jt" delta="3 nota" tone="warning" highlight />
              <KpiTile label="Stok Menipis" value="7 SKU" delta="cek gudang" tone="danger" />
            </div>
            <div className="mt-4 rounded-lg border border-line p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Tren 7 Hari</p>
              <div className="mt-2 flex h-16 items-end gap-1.5">
                {[40, 62, 48, 70, 55, 82, 68].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-sm ${i === 5 ? "bg-navy-900" : "bg-navy-500/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function KpiTile({
  label,
  value,
  delta,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "danger";
  highlight?: boolean;
}) {
  const toneCls =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger";
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-brand-accent bg-brand-accent/15" : "border-line bg-white"}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tracking-tight text-navy-900">{value}</p>
      <p className={`mt-0.5 font-mono text-[11px] ${toneCls}`}>{delta}</p>
    </div>
  );
}

/* ---------- Problem ---------- */

const PROBLEMS = [
  {
    t: "Masih ngandelin Excel & catatan tangan",
    d: "Rentan salah ketik, rumus rusak, file dobel, nggak ada jejak siapa ubah apa.",
  },
  {
    t: "Stok nggak akurat",
    d: "Catatan beda sama rak. Sering kehabisan pas lagi dibutuhin, atau numpuk bikin modal mengendap.",
  },
  {
    t: "Pembelian & penjualan nggak nyambung",
    d: "Stok nggak update otomatis, margin & HPP susah dihitung tiap mau ngecek untung.",
  },
  {
    t: "Utang-piutang berantakan",
    d: "Lupa nagih pelanggan, telat bayar supplier, arus kas jadi macet tanpa kamu sadar.",
  },
];

function Problem() {
  return (
    <section id="problem" className="border-b border-line bg-off-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="01" label="Masalahnya" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Datanya kepisah-pisah, jadi nggak pernah cocok.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Akar masalahnya satu: catatan tokomu nggak terintegrasi dan nggak real-time.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {PROBLEMS.map((p, i) => (
            <div key={p.t} data-reveal className="bg-white p-7">
              <span className="font-mono text-xs text-ink-soft">0{i + 1}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-navy-900">{p.t}</h3>
              <p className="mt-2 text-ink-soft">{p.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Solution ---------- */

type Effect = { label: string; tone: "up" | "down" | "neutral" | "alert" };
const FLOWS: { trigger: string; icon: string; effects: Effect[] }[] = [
  {
    trigger: "Penjualan tunai",
    icon: "🛒",
    effects: [
      { label: "↓ Stok", tone: "down" },
      { label: "↑ Kas masuk", tone: "up" },
      { label: "✓ Margin tercatat", tone: "neutral" },
    ],
  },
  {
    trigger: "Penjualan kredit",
    icon: "📝",
    effects: [
      { label: "↓ Stok", tone: "down" },
      { label: "+ Piutang & jatuh tempo", tone: "alert" },
      { label: "🔔 Reminder terjadwal", tone: "neutral" },
    ],
  },
  {
    trigger: "Pembelian dari supplier",
    icon: "📦",
    effects: [
      { label: "↑ Stok", tone: "up" },
      { label: "↑ Hutang ke supplier", tone: "alert" },
      { label: "✓ HPP diperbarui", tone: "neutral" },
    ],
  },
  {
    trigger: "Pelunasan piutang",
    icon: "💸",
    effects: [
      { label: "↓ Piutang", tone: "down" },
      { label: "↑ Kas masuk", tone: "up" },
      { label: "✓ Status lunas", tone: "neutral" },
    ],
  },
];

function Pill({ e }: { e: Effect }) {
  const tone =
    e.tone === "up"
      ? "bg-success/20 text-success"
      : e.tone === "down"
      ? "bg-danger/20 text-danger"
      : e.tone === "alert"
      ? "bg-warning/20 text-warning"
      : "bg-white/10 text-white/80";
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${tone}`}>
      {e.label}
    </span>
  );
}

function Solution() {
  return (
    <section id="solusi" className="border-b border-line bg-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="02" label="Solusinya" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Satu input, semuanya update otomatis.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Niaga meniru logika pembukuan berpasangan — tapi kamu nggak perlu paham akuntansi. Cukup catat
          transaksi, sisanya sinkron sendiri.
        </p>

        <div data-reveal className="mt-12 overflow-hidden rounded-2xl bg-navy-900 p-2 md:p-3">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
              Ledger · Live
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
              auto-sync
            </span>
          </div>
          <ul className="divide-y divide-white/10">
            {FLOWS.map((f) => (
              <li key={f.trigger} className="grid items-center gap-4 px-4 py-5 md:grid-cols-[260px_1fr]">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-lg">
                    {f.icon}
                  </span>
                  <span className="font-display text-base font-semibold text-white">{f.trigger}</span>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {f.effects.map((e) => (
                    <Pill key={e.label} e={e} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-2xl font-display text-xl text-navy-900">
          Nggak ada lagi entri dobel di banyak sheet. <span className="bg-brand-accent/60 px-1">Catat sekali, sisanya Niaga yang urus.</span>
        </p>
      </Container>
    </section>
  );
}

/* ---------- Benefits ---------- */

const BENEFITS = [
  { n: "−50%", l: "Waktu rekap harian", d: "Dibanding cara Excel — nggak ada lagi tutup buku sampai malam." },
  { n: "≥98%", l: "Akurasi stok", d: "Sistem vs hitungan fisik. Opname jadi soal verifikasi, bukan tebak-tebakan." },
  { n: "+20%", l: "Piutang tertagih tepat waktu", d: "Berkat reminder WhatsApp otomatis ke pelanggan." },
  { n: "≤30m", l: "Setup dari nol", d: "Daftar, import Excel, siap transaksi — hari yang sama." },
  { n: "24/7", l: "Pantau dari HP", d: "Lagi di luar kota? Cek penjualan & kas kapan aja." },
  { n: "100%", l: "Data milik kamu", d: "Backup otomatis, audit trail, ekspor kapan saja." },
];

function Benefits() {
  return (
    <section className="border-b border-line bg-off-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="03" label="Kenapa Niaga" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Yang kamu dapat, dalam angka.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.l} data-reveal className="bg-white p-7">
              <p className="font-mono text-[44px] font-semibold leading-none tracking-tight text-navy-900">
                {b.n}
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-navy-700">{b.l}</p>
              <p className="mt-2 text-sm text-ink-soft">{b.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Features ---------- */

const FEATURES = [
  { t: "Master Data", d: "Produk, supplier, pelanggan. Import massal dari Excel/CSV.", i: "🗂️" },
  { t: "Stok Real-time", d: "Kartu stok per produk, alert stok menipis, opname terstruktur.", i: "📊" },
  { t: "Pembelian (PO)", d: "Pesanan ke supplier, penerimaan otomatis nambah stok & update HPP.", i: "📥" },
  { t: "Penjualan / Kasir", d: "Mode kasir cepat, cari produk & barcode, kirim nota via WhatsApp.", i: "🧾" },
  { t: "Utang & Piutang", d: "Aging + jatuh tempo, catat pembayaran, reminder WhatsApp.", i: "💳" },
  { t: "Kas & Bank", d: "Arus kas masuk-keluar + biaya operasional, selalu konsisten.", i: "🏦" },
  { t: "Laporan", d: "Penjualan, stok, laba kotor. Ekspor rapi ke Excel/PDF buat akuntan.", i: "📑" },
  { t: "Dashboard", d: "Ringkasan harian, tren penjualan, produk terlaris — muat cepat.", i: "📈" },
  { t: "Multi-user & Peran", d: "Pemilik/kasir/gudang/keuangan dengan izin beda + audit trail.", i: "👥", soon: false },
];
const SOON = ["Mode Offline / PWA", "Pembayaran QRIS"];

function Features() {
  return (
    <section id="fitur" className="border-b border-line bg-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="04" label="Fitur" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Semua yang toko kamu butuhin, nggak lebih.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} data-reveal className="bg-white p-6">
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-line text-lg">
                {f.i}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{f.t}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">Segera hadir</span>
          {SOON.map((s) => (
            <span key={s} className="inline-flex items-center rounded-md bg-brand-accent/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-navy-900">
              {s}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- How It Works ---------- */

const STEPS = [
  { t: "Daftar & buat usaha", d: "Isi profil toko, Rupiah otomatis. Nggak ada setup ribet." },
  { t: "Import produk", d: "Unggah Excel, petakan kolom, baris error langsung ketahuan." },
  { t: "Isi saldo awal", d: "Stok awal, utang & piutang berjalan — biar angka start-mu bener." },
  { t: "Transaksi pertama", d: "Sistem siap dipakai di hari yang sama. Beneran." },
];

function HowItWorks() {
  return (
    <section id="cara" className="border-b border-line bg-off-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="05" label="Cara Kerjanya" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Pindah dari Excel cuma 4 langkah.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} data-reveal className="relative bg-white p-6">
              <span className="font-mono text-5xl font-semibold tracking-tight text-navy-900/15">
                0{i + 1}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-navy-900">{s.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 font-display text-xl text-navy-900">
          <span className="bg-brand-accent/60 px-1">Beneran bisa kelar hari itu juga.</span>
        </p>
      </Container>
    </section>
  );
}

/* ---------- Social Proof ---------- */

const TESTIMONIALS = [
  {
    name: "Bu Sri",
    biz: "Grosir Sembako · Bekasi",
    initials: "SR",
    quote:
      "Dulu tutup buku bisa sampai jam 11 malam. Sekarang catat sekali, semua angka langsung pas. Anak saya nggak ngomel lagi.",
  },
  {
    name: "Andi",
    biz: "Distributor Minuman · Surabaya",
    initials: "AN",
    quote:
      "Reminder otomatis ke pelanggan kerasa banget. Piutang yang biasanya nyangkut, sekarang ditagih sistem.",
  },
  {
    name: "Lina",
    biz: "Toko Bangunan · Bandung",
    initials: "LN",
    quote:
      "Pindah dari Excel beneran cuma 30 menitan. Import produk, isi saldo awal, jualan jalan. Nggak ada drama.",
  },
];

function SocialProof() {
  return (
    <section className="border-b border-line bg-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="06" label="Kata Mereka" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Pemilik toko yang udah cobain.
        </h2>
        {/* placeholder: ganti dgn testimoni asli */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} data-reveal className="flex h-full flex-col rounded-xl border border-line bg-off-white p-6">
              <blockquote className="flex-1 font-display text-lg leading-snug text-navy-900">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-navy-900 font-mono text-xs font-semibold text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-navy-900">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{t.biz}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {[
            ["5–10", "UMKM pilot aktif"],
            ["≥ 40", "NPS target pilot"],
            ["≥ 60%", "Retensi bulan ke-1"],
          ].map(([n, l]) => (
            <div key={l} className="bg-white p-6">
              <p className="font-mono text-3xl font-semibold text-navy-900">{n}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">{l}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Demo ---------- */

function Demo() {
  return (
    <section id="demo" className="border-b border-line bg-off-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="07" label="Lihat Langsung" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Begini tampilannya.
        </h2>

        <div data-reveal className="mt-12">
          <Tabs defaultValue="dashboard">
            <TabsList className="bg-white border border-line">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="kasir">Mode Kasir</TabsTrigger>
              <TabsTrigger value="piutang">Piutang (Aging)</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <MockFrame caption="Dashboard harian: ringkasan penjualan, kas, dan stok kritis.">
                <div className="grid gap-3 md:grid-cols-4">
                  <KpiTile label="Penjualan" value="Rp 4.82jt" delta="+12%" tone="success" />
                  <KpiTile label="Kas Masuk" value="Rp 3.10jt" delta="+8%" tone="success" />
                  <KpiTile label="Piutang JT" value="Rp 1.45jt" delta="3 nota" tone="warning" highlight />
                  <KpiTile label="Stok Menipis" value="7 SKU" delta="lihat" tone="danger" />
                </div>
                <div className="mt-4 rounded-lg border border-line bg-white p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Tren penjualan 7 hari</p>
                  <div className="mt-3 flex h-24 items-end gap-2">
                    {[35, 58, 44, 70, 62, 88, 72].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${i === 5 ? "bg-navy-900" : "bg-navy-500/30"}`} />
                    ))}
                  </div>
                </div>
              </MockFrame>
            </TabsContent>

            <TabsContent value="kasir" className="mt-6">
              <MockFrame caption="Mode kasir: cari produk cepat, scan barcode, kirim nota via WhatsApp.">
                <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
                  <div className="rounded-lg border border-line bg-white p-4">
                    <input
                      readOnly
                      value="Cari produk / scan barcode…"
                      className="w-full rounded-md border border-line bg-off-white px-3 py-2 font-mono text-xs text-ink-soft"
                    />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {["Indomie Goreng", "Aqua 600ml", "Beras 5kg", "Minyak 1L", "Gula 1kg", "Telur 1kg"].map((p) => (
                        <div key={p} className="rounded-md border border-line p-3 text-xs text-navy-900 hover:bg-off-white">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-white p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Keranjang</p>
                    <ul className="mt-2 divide-y divide-line text-sm">
                      {[
                        ["Indomie Goreng × 5", "Rp 17.500"],
                        ["Aqua 600ml × 2", "Rp 8.000"],
                        ["Beras 5kg × 1", "Rp 65.000"],
                      ].map(([a, b]) => (
                        <li key={a} className="flex justify-between py-2">
                          <span className="text-navy-900">{a}</span>
                          <span className="font-mono text-ink-soft">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Total</span>
                      <span className="font-display text-xl font-bold text-navy-900">Rp 90.500</span>
                    </div>
                    <button className="mt-3 w-full rounded-md bg-navy-900 py-2 text-sm font-medium text-white">
                      Bayar & Cetak Nota
                    </button>
                  </div>
                </div>
              </MockFrame>
            </TabsContent>

            <TabsContent value="piutang" className="mt-6">
              <MockFrame caption="Daftar piutang dengan aging — yang merah ditagih duluan.">
                <div className="overflow-hidden rounded-lg border border-line bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-off-white text-left font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                      <tr>
                        <th className="px-4 py-3">Pelanggan</th>
                        <th className="px-4 py-3">Nominal</th>
                        <th className="px-4 py-3">Jatuh Tempo</th>
                        <th className="px-4 py-3">Aging</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {[
                        ["Toko Berkah", "Rp 1.250.000", "12 hr lalu", "danger", "> 30 hari"],
                        ["Warung Bu Ani", "Rp 480.000", "3 hr lalu", "warning", "8–30 hari"],
                        ["UD Sentosa", "Rp 2.100.000", "Besok", "neutral", "0–7 hari"],
                        ["Toko Maju", "Rp 750.000", "5 hr lagi", "neutral", "0–7 hari"],
                      ].map(([nm, val, due, tone, age]) => (
                        <tr key={nm}>
                          <td className="px-4 py-3 text-navy-900">{nm}</td>
                          <td className="px-4 py-3 font-mono text-navy-900">{val}</td>
                          <td className="px-4 py-3 text-ink-soft">{due}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                              tone === "danger" ? "bg-danger/15 text-danger" : tone === "warning" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                            }`}>
                              {age}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </MockFrame>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </section>
  );
}

function MockFrame({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgba(10,26,60,0.2)]">
      <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-ink-soft">niaga.app</span>
      </div>
      <div className="rounded-lg bg-off-white p-4">{children}</div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-soft">{caption}</p>
    </div>
  );
}

/* ---------- FAQ ---------- */

const FAQS = [
  ["Apakah ribet kalau saya selama ini cuma pakai Excel?", "Nggak. Import sekali klik, ada onboarding terpandu, dan baris error langsung ditandai biar kamu tinggal benerin."],
  ["Saya nggak ngerti akuntansi, bisa pakai?", "Bisa banget. Niaga nyembunyiin istilah ribet — kamu cukup catat transaksi, sistem yang nyusun debit-kreditnya di belakang layar."],
  ["Data saya aman?", "Backup otomatis, ada audit trail siapa ubah apa, dan bisa diekspor kapan saja. Datanya tetap punya kamu."],
  ["Bisa dipakai banyak orang (kasir, gudang, keuangan)?", "Bisa. Tiap user punya peran & izin sendiri — kasir nggak bisa lihat laporan laba, misalnya."],
  ["Internet saya suka putus, gimana?", "Mode offline/PWA sedang disiapkan. Operasi inti diprioritaskan tetap jalan walau koneksi naik-turun."],
  ["Cocok buat jenis usaha apa?", "UMKM dagang dengan SKU jelas — kelontong besar, grosir, distributor kecil, retail produk fisik. Bukan jasa atau manufaktur kompleks."],
  ["Harganya gimana?", "Terjangkau & berjenjang. Coba dulu gratis, bayar kalau memang kerasa manfaatnya."],
];

function FAQ() {
  return (
    <section id="faq" className="border-b border-line bg-white">
      <Container className="py-20 md:py-28">
        <SectionLabel num="08" label="FAQ" />
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
          Masih ada yang ganjel?
        </h2>
        <div className="mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map(([q, a], i) => (
              <AccordionItem key={q} value={`item-${i}`} className="border-line">
                <AccordionTrigger className="text-left font-display text-lg text-navy-900 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-ink-soft">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section id="cta" className="bg-navy-900 text-white">
      <Container className="py-24 md:py-32">
        <SectionLabel num="09" label="Mulai" />
        <h2 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
          Udah waktunya{" "}
          <span className="relative inline-block">
            pindah
            <span className="absolute inset-x-0 -bottom-1 h-3 -z-0 bg-brand-accent/80" aria-hidden />
          </span>{" "}
          dari Excel.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-white/70">
          Catat sekali, semua beres. Setup ≤ 30 menit. Coba dulu, bayar kalau memang kepake.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#" className="inline-flex h-12 items-center rounded-lg bg-brand-accent px-6 text-sm font-semibold text-navy-900 transition-all hover:-translate-y-0.5">
            Coba Gratis Sekarang
          </a>
          <a href="#" className="inline-flex h-12 items-center rounded-lg border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            Jadwalkan Demo
          </a>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
          Tanpa kartu kredit · Batalkan kapan saja
        </p>
      </Container>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/10 text-white/70">
      <Container className="grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-sm font-mono text-navy-900">N</span>
            niaga
          </div>
          <p className="mt-3 text-sm">ERP mini untuk UMKM dagang Indonesia. Catat sekali, semua beres.</p>
        </div>
        {[
          { h: "Produk", l: ["Fitur", "Cara Kerja", "Demo", "Harga"] },
          { h: "Sumber Daya", l: ["FAQ", "Panduan", "Status", "Blog"] },
          { h: "Perusahaan", l: ["Tentang", "Kontak", "Privasi", "Syarat"] },
        ].map((c) => (
          <div key={c.h}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">{c.h}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.l.map((i) => (
                <li key={i}>
                  <a href="#" className="hover:text-white">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-start justify-between gap-3 py-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Niaga. Dibuat untuk pedagang Indonesia.</p>
          <p className="font-mono uppercase tracking-widest">v0.1 · pilot</p>
        </Container>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */

function NiagaLanding() {
  const ref = useReveal();
  return (
    <div ref={ref} className="bg-white text-navy-900">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <Features />
        <HowItWorks />
        <SocialProof />
        <Demo />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
