"use client";

import { useTransition } from "react";

export function ToggleActiveButton({
  id,
  isActive,
  action,
  label,
}: {
  id: string;
  isActive: boolean;
  action: (id: string, next: boolean) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label ?? (isActive ? "Desativar" : "Ativar")}
      disabled={pending}
      onClick={() => startTransition(() => action(id, !isActive))}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
        isActive ? "bg-ok" : "bg-ink/18"
      }`}
    >
      <span
        className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform ${isActive ? "translate-x-[18px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}
