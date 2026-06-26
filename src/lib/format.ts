// Formatters Bahasa Indonesia / WIB
export function formatRupiah(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  if (!isFinite(v as number)) return "Rp 0";
  return "Rp " + (v as number).toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function formatAngka(n: number | string | null | undefined, digits = 0): string {
  const v = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  if (!isFinite(v as number)) return "0";
  return (v as number).toLocaleString("id-ID", { maximumFractionDigits: digits });
}

export function formatTanggal(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatTanggalJam(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";
}

export function selisihHari(d: string | Date): number {
  const target = typeof d === "string" ? new Date(d) : d;
  const ms = target.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
