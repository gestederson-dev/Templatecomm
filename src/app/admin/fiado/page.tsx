import Link from "next/link";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { adminCard, adminPanel } from "@/components/admin/ui-styles";
import { getFiadoCustomers } from "@/lib/admin/fiado";
import { formatBRL } from "@/lib/format";

const TABS: { key: string; label: string; filter: (balance: number, archived: boolean) => boolean }[] = [
  { key: "aberto", label: "Em aberto", filter: (balance, archived) => balance > 0 && !archived },
  { key: "quitados", label: "Quitados", filter: (balance, archived) => balance <= 0 && !archived },
  { key: "todos", label: "Todos", filter: () => true },
];

export default async function AdminFiadoPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "aberto" } = await searchParams;
  const customers = await getFiadoCustomers();

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const filtered = customers.filter((c) => activeTab.filter(c.balance, c.is_archived));

  const totalPending = customers.filter((c) => !c.is_archived).reduce((sum, c) => sum + Math.max(c.balance, 0), 0);
  const totalReceived = customers.reduce((sum, c) => sum + c.totalPaid, 0);
  const openCount = customers.filter((c) => c.balance > 0 && !c.is_archived).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Fiado</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">Controle de vendas a prazo — clientes que levam e pagam depois.</p>
        </div>
        <Link href="/admin/fiado/novo" className="inline-flex items-center gap-2 rounded-[10px] bg-wine px-[18px] py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px">
          + Novo fiado
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Pendente no total</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-destructive">{formatBRL(totalPending)}</p>
        </div>
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Já recebido</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-ok">{formatBRL(totalReceived)}</p>
        </div>
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Clientes em aberto</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-ink">{openCount}</p>
        </div>
      </div>

      <div className="flex w-fit gap-1 rounded-[10px] border border-line bg-white p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/fiado?tab=${t.key}`}
            className={`rounded-[7px] px-4 py-2 text-[13px] font-semibold transition-colors ${t.key === activeTab.key ? "bg-wine text-white" : "text-ink/52 hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className={adminPanel}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-ink/[0.015] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
              <th className="px-4 py-3.5">Cliente</th>
              <th className="px-4 py-3.5">Total</th>
              <th className="px-4 py-3.5">Pago</th>
              <th className="px-4 py-3.5">Pendente</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Última atividade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/52">
                  Nenhum cliente nesta aba.
                </td>
              </tr>
            ) : null}
            {filtered.map((customer) => {
              const tone: PillTone = customer.balance <= 0 ? "ok" : "critical";
              return (
                <tr key={customer.id} className="cursor-pointer border-t border-line transition-colors hover:bg-wine-tint">
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/fiado/${customer.id}`} className="block">
                      <span className="font-semibold text-ink">{customer.name}</span>
                      {customer.phone ? <span className="block text-[12px] text-ink/52">{customer.phone}</span> : null}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/fiado/${customer.id}`} className="block tabular-nums text-ink/70">
                      {formatBRL(customer.totalCharged)}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/fiado/${customer.id}`} className="block tabular-nums text-ok">
                      {formatBRL(customer.totalPaid)}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/fiado/${customer.id}`} className={`block font-semibold tabular-nums ${customer.balance > 0 ? "text-destructive" : "text-ink/52"}`}>
                      {formatBRL(Math.max(customer.balance, 0))}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill tone={tone}>{customer.balance <= 0 ? "Quitado" : "Em aberto"}</StatusPill>
                  </td>
                  <td className="px-4 py-3.5 text-ink/52">{customer.lastActivityAt ? new Date(`${customer.lastActivityAt}T00:00:00`).toLocaleDateString("pt-BR") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
