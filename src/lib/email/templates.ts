import { formatBRL } from "@/lib/format";

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #0b0b0b;">
      <h1 style="font-size: 18px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 12px; color: #898781;">Salmar Brindes</p>
    </div>
  `;
}

export function orderConfirmedEmail(orderNumber: string, total: number): { subject: string; html: string } {
  return {
    subject: `Pagamento confirmado — pedido ${orderNumber}`,
    html: layout(
      "Pagamento confirmado!",
      `<p>Recebemos seu pagamento do pedido <strong>${orderNumber}</strong>, no valor de <strong>${formatBRL(total)}</strong>.</p>
       <p>Já estamos preparando tudo. Você pode acompanhar o status em "Meus pedidos".</p>`,
    ),
  };
}

export function orderShippedEmail(orderNumber: string, trackingCode: string | null): { subject: string; html: string } {
  return {
    subject: `Pedido ${orderNumber} enviado`,
    html: layout(
      "Seu pedido foi enviado!",
      `<p>O pedido <strong>${orderNumber}</strong> já está a caminho.</p>
       ${trackingCode ? `<p>Código de rastreio: <strong>${trackingCode}</strong></p>` : ""}`,
    ),
  };
}

export function quoteSentEmail(quoteNumber: string, quotedTotal: number, validUntil: string | null): { subject: string; html: string } {
  return {
    subject: `Sua cotação está pronta — ${quoteNumber}`,
    html: layout(
      "Sua cotação está pronta!",
      `<p>Preparamos uma proposta para o orçamento <strong>${quoteNumber}</strong>: <strong>${formatBRL(quotedTotal)}</strong>.</p>
       ${validUntil ? `<p>Válida até ${new Date(validUntil).toLocaleDateString("pt-BR")}.</p>` : ""}
       <p>Acesse "Meus orçamentos" para aprovar ou recusar.</p>`,
    ),
  };
}
