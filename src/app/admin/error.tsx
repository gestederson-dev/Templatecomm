"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-lg font-semibold">Erro ao carregar esta tela do admin</h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message || "Tente novamente."}</p>
      <Button type="button" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
