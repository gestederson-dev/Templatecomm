import Link from "next/link";

export function PeriodFilter({ period, from, to }: { period: string; from: string; to: string }) {
  const presets = [
    { value: "7", label: "7 dias" },
    { value: "30", label: "30 dias" },
    { value: "90", label: "90 dias" },
  ];

  const dateFieldStyle =
    "rounded-[9px] border border-line bg-white px-2.5 py-1.5 text-sm outline-none transition-shadow focus:border-wine focus:ring-[3px] focus:ring-wine-tint";

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex gap-1.5 rounded-[10px] border border-line bg-white p-1">
        {presets.map((preset) => (
          <Link
            key={preset.value}
            href={`/admin?period=${preset.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${period === preset.value ? "bg-wine text-white" : "text-ink/52 hover:bg-wine-tint hover:text-wine"}`}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <form action="/admin" method="get" className="flex items-end gap-2">
        <input type="hidden" name="period" value="custom" />
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] font-semibold text-ink/52">De</label>
          <input type="date" name="from" defaultValue={from} className={dateFieldStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] font-semibold text-ink/52">Até</label>
          <input type="date" name="to" defaultValue={to} className={dateFieldStyle} />
        </div>
        <button
          type="submit"
          className={`rounded-[10px] px-3.5 py-[9px] text-sm font-semibold transition-colors ${period === "custom" ? "bg-wine text-white" : "border border-line text-ink/52 hover:border-wine hover:text-wine"}`}
        >
          Aplicar
        </button>
      </form>
    </div>
  );
}
