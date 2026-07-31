"use client";

import { useState } from "react";

export function PricingTabs({ simulator, settings }: { simulator: React.ReactNode; settings: React.ReactNode }) {
  const [tab, setTab] = useState<"simulador" | "config">("simulador");

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-line">
        <button
          type="button"
          onClick={() => setTab("simulador")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === "simulador" ? "border-wine text-wine" : "border-transparent text-ink/52 hover:text-ink"}`}
        >
          Simulador
        </button>
        <button
          type="button"
          onClick={() => setTab("config")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === "config" ? "border-wine text-wine" : "border-transparent text-ink/52 hover:text-ink"}`}
        >
          Configuração
        </button>
      </div>
      <div className={tab === "simulador" ? "" : "hidden"}>{simulator}</div>
      <div className={tab === "config" ? "" : "hidden"}>{settings}</div>
    </div>
  );
}
