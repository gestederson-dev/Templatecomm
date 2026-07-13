"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ToggleActiveButton({ id, isActive, action }: { id: string; isActive: boolean; action: (id: string, next: boolean) => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => action(id, !isActive))}
    >
      {isActive ? "Desativar" : "Ativar"}
    </Button>
  );
}
