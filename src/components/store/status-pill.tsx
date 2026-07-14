const TONES = {
  warn: "bg-warn-bg text-warn",
  info: "bg-info-bg text-info",
  ok: "bg-ok-bg text-ok",
  wine: "bg-wine-tint text-wine",
  critical: "bg-destructive/10 text-destructive",
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONES[tone]}`}>{children}</span>;
}
