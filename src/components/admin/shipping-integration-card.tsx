import { adminBtnWine, adminCard } from "@/components/admin/ui-styles";
import { StatusPill } from "@/components/admin/status-pill";

export function ShippingIntegrationCard({
  connected,
  connectedAt,
  status,
}: {
  connected: boolean;
  connectedAt: string | null;
  status?: string;
}) {
  return (
    <div className={`${adminCard} flex flex-col gap-3.5`}>
      <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Integrações</h2>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-3.5">
        <div>
          <p className="text-sm font-semibold text-ink">Melhor Envio (frete)</p>
          {connected ? (
            <p className="mt-0.5 text-xs text-ink/52">Conectado{connectedAt ? ` em ${new Date(connectedAt).toLocaleDateString("pt-BR")}` : ""}.</p>
          ) : (
            <p className="mt-0.5 text-xs text-ink/52">Não conectado — cálculo de frete no checkout não funciona sem isso.</p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {connected ? <StatusPill tone="ok">Conectado</StatusPill> : null}
          <a href="/api/integrations/melhor-envio/authorize" className={adminBtnWine}>
            {connected ? "Reconectar" : "Conectar"}
          </a>
        </div>
      </div>

      {status === "conectado" ? <p className="text-sm font-medium text-ok">Melhor Envio conectado com sucesso.</p> : null}
      {status === "erro" ? <p className="text-sm text-destructive">Falha ao conectar com o Melhor Envio. Tente novamente.</p> : null}
    </div>
  );
}
