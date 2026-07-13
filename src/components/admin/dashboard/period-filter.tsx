import Link from "next/link";

export function PeriodFilter({ period, from, to }: { period: string; from: string; to: string }) {
  const presets = [
    { value: "7", label: "7 dias" },
    { value: "30", label: "30 dias" },
    { value: "90", label: "90 dias" },
  ];

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex gap-2">
        {presets.map((preset) => (
          <Link
            key={preset.value}
            href={`/admin?period=${preset.value}`}
            className={`rounded-md px-3 py-1.5 text-sm ${period === preset.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <form action="/admin" method="get" className="flex items-end gap-2">
        <input type="hidden" name="period" value="custom" />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">De</label>
          <input type="date" name="from" defaultValue={from} className="rounded-md border border-input bg-background px-2 py-1 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Até</label>
          <input type="date" name="to" defaultValue={to} className="rounded-md border border-input bg-background px-2 py-1 text-sm" />
        </div>
        <button type="submit" className={`rounded-md px-3 py-1.5 text-sm ${period === "custom" ? "bg-foreground text-background" : "border text-muted-foreground hover:bg-muted"}`}>
          Aplicar
        </button>
      </form>
    </div>
  );
}
