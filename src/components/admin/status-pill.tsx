const TONES = {
  warn: "bg-warn-bg text-warn",
  info: "bg-info-bg text-info",
  ok: "bg-ok-bg text-ok",
  wine: "bg-wine-tint text-wine",
  critical: "bg-destructive/10 text-destructive",
} as const;

export type PillTone = keyof typeof TONES;

export function StatusPill({ tone, children, className = "" }: { tone: PillTone; children: React.ReactNode; className?: string }) {
  return <span className={`inline-block rounded-full px-[11px] py-1 text-xs font-semibold ${TONES[tone]} ${className}`}>{children}</span>;
}
