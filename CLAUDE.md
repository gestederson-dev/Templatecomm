# Salmar Brindes — E-commerce Híbrido

> Constituição do projeto. Regras aqui têm precedência sobre pedidos pontuais.
> O spec detalhado está importado abaixo — leia-o antes de decisões de arquitetura.

@.claude/docs/salmar-brindes-spec.md

## O que é
Loja da **Salmar Brindes**: e-commerce **híbrido** de brindes corporativos.
- **Venda direta (B2C):** carrinho + checkout.
- **Orçamento (B2B):** produto personalizável → cliente solicita cotação → admin precifica → cliente aprova → vira pedido.
Um mesmo produto pode ter os dois fluxos (`allow_direct_sale` e `allow_quote`).

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind + shadcn/ui + lucide-react
- Supabase (Postgres + Auth + Storage)
- Mercado Pago (PIX + boleto + cartão) — isolado em `lib/payments/`
- Melhor Envio (frete) — isolado em `lib/shipping/`
- Zustand (carrinho), Zod (validação), Recharts (dashboard)
- Deploy: Vercel

## Regras imutáveis
1. **Construir fase a fase.** Nunca pular fase nem "fazer tudo de uma vez". Ordem das fases está no spec. Ao terminar cada fase, listar o que ficou pronto e o que falta, e esperar confirmação antes de avançar.
2. **RLS sempre.** Toda tabela com Row Level Security. Cliente só acessa os próprios dados; admin acessa tudo. RLS é a segunda camada — não confiar só no middleware.
3. **Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client.** Só em código server-side.
4. **Pagamento e frete atrás de interfaces** (`lib/payments`, `lib/shipping`) para permitir troca de provedor sem reescrever o checkout.
5. **Webhook do Mercado Pago é a fonte de verdade do pagamento.** Nunca marcar pedido como pago pelo retorno do frontend.
6. **Server Components por padrão.** Client Components só onde há interatividade.
7. **Migrations versionadas** em `supabase/migrations/`. Mostrar o SQL para revisão antes de aplicar.
8. **Commits pequenos e frequentes.** Deploy na Vercel ao fim de cada fase e validar.

## Contexto Brasil (não esquecer)
- PIX obrigatório no checkout; boleto e cartão parcelado também.
- Validar CPF (PF) e CNPJ (PJ). B2B geralmente é PJ.
- CEP com autocompletar via ViaCEP.
- NF-e fica fora do MVP, mas manter `orders` preparado para dados fiscais.

## Terminologia (usar sempre)
- "Orçamento" (não "quote" na UI em pt-BR).
- "Pedido" para venda; numeração `PED-000001`.
- "Orçamento" numeração `ORC-000001`.

## Onde as coisas ficam
- Spec completo: `.claude/docs/salmar-brindes-spec.md`
- Schema inicial: `supabase/migrations/0001_initial_schema.sql`
- Este arquivo (`CLAUDE.md`): regras + índice.
