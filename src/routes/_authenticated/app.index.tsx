import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/")({
  component: () => <div className="text-sm text-[var(--ink-soft)]">Mengarahkan…</div>,
});
