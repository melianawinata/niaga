
# Landing Page "Niaga" — Plan

Membangun landing page satu halaman (single-page) untuk **Niaga**, ERP Mini untuk UMKM dagang Indonesia, mengikuti brief lengkap yang kamu kirim. Estetika: **Swiss Design + twist Gen-Z** (navy/putih dominan, kuning #FFD43B sebagai aksen hemat). Semua copy Bahasa Indonesia, tone santai-ramah.

## Yang dibangun

Satu halaman di `src/routes/index.tsx` berisi **navbar sticky + 10 seksi + footer**:

1. **Hero** — headline besar "Catat sekali. Stok, kas, dan utang langsung beres." + 2 CTA + trust strip + mockup dashboard.
2. **Problem** — 4 kartu masalah (Excel, stok, pembelian-penjualan, utang-piutang).
3. **Solution** — panel "ledger" navy gelap: 4 alur otomatis (penjualan tunai/kredit, pembelian, pelunasan) dengan pill berwarna semantik (↑ hijau, ↓ merah).
4. **Benefits** — 6 kartu KPI (−50% waktu rekap, ≥98% akurasi stok, +20% piutang tertagih, ≤30 menit setup, pantau dari HP, data milikmu).
5. **Features** — 9 kartu modul (Master Data, Stok, PO, Kasir, Utang-Piutang, Kas, Laporan, Dashboard, Multi-user) + 1–2 badge kuning "Segera Hadir".
6. **How It Works** — stepper 4 langkah onboarding (nomor mono besar).
7. **Social Proof** — 3 testimoni placeholder + strip statistik pilot.
8. **Demo** — tab switcher 3 mockup HTML/CSS (Dashboard, Kasir, Aging Piutang).
9. **FAQ** — accordion 7 pertanyaan.
10. **Final CTA** — panel navy gelap full-width, headline besar + 2 CTA + reassurance.

Footer: kolom navigasi, kontak, copyright.

## Detail teknis

- **Stack:** TanStack Start (existing). Implementasi sebagai komponen React + Tailwind di `src/routes/index.tsx`. Pecah jadi sub-komponen per seksi di `src/components/niaga/*` agar rapi.
- **Design tokens:** Tambahkan ke `src/styles.css` — `--navy-900/700/500`, `--off-white`, `--accent` (kuning), `--ink-soft`, `--line`, dan semantic `--success/--warning/--danger`. Map ke `@theme inline` supaya jadi utility (`bg-navy-900`, `text-accent`, dst). **Tidak ada warna hardcoded di komponen.**
- **Font:** Space Grotesk (display), Inter (body), JetBrains Mono (eyebrow/angka) via `<link>` di `__root.tsx` head (bukan @import di CSS — sesuai aturan Tailwind v4 Lightning CSS).
- **Grid:** max-w 1180px, spacing kelipatan 8, hairline rule (`border-line`) antar seksi, nomor seksi "01/02/…" gaya editorial mono uppercase.
- **Interaksi:** Accordion FAQ pakai shadcn `Accordion`. Tab demo pakai shadcn `Tabs`. Smooth scroll via CSS `scroll-behavior`. Reveal-on-scroll pakai IntersectionObserver kecil (custom hook `useReveal`) — fade+translate halus, tanpa library motion berat.
- **Mockup UI** di Hero & Demo dibuat dengan HTML/CSS murni (kartu KPI, tabel, badge, indikator warna), bukan gambar.
- **Mobile:** Navbar collapse jadi sheet menu (shadcn `Sheet`), grid 4-col → 2-col → 1-col, headline turun ke ~40px di 360px.
- **SEO:** Update `head()` di `src/routes/index.tsx` — title "Niaga — ERP Mini untuk UMKM Dagang", meta description, og:title/description. Satu H1 (hero).
- **A11y:** semantic `<header><nav><section><footer>`, alt text, focus-visible ring navy.

## Struktur file

```text
src/styles.css                              (tambah tokens + font family vars)
src/routes/__root.tsx                       (tambah <link> Google Fonts di head)
src/routes/index.tsx                        (compose semua seksi + SEO head)
src/components/niaga/Navbar.tsx
src/components/niaga/Hero.tsx
src/components/niaga/Problem.tsx
src/components/niaga/Solution.tsx
src/components/niaga/Benefits.tsx
src/components/niaga/Features.tsx
src/components/niaga/HowItWorks.tsx
src/components/niaga/SocialProof.tsx
src/components/niaga/Demo.tsx
src/components/niaga/FAQ.tsx
src/components/niaga/FinalCTA.tsx
src/components/niaga/Footer.tsx
src/components/niaga/SectionLabel.tsx       (eyebrow + nomor seksi reusable)
src/hooks/use-reveal.ts                     (IntersectionObserver fade-in)
```

## Tidak termasuk

- Tombol "Coba Gratis" / "Jadwalkan Demo" hanya CTA visual (anchor ke `#cta` atau `href="#"`) — belum ada form/backend/auth. Bisa disambung nanti via Lovable Cloud kalau kamu mau.
- Testimoni & angka pilot ditandai `{/* placeholder */}` di JSX untuk diganti konten asli nanti.
