# Salmar — Correções de front-end + Auditoria completa
### Prompt para o Claude Code

> Três frentes: (1) mobile do painel, (2) gráficos idênticos ao protótipo, (3) auditoria
> de TODAS as telas para o design system estar aplicado por completo — o checkout ainda
> está na versão antiga. Faça na ordem abaixo, mostrando cada etapa antes de seguir.

---

## Parte 1 — Mobile do painel (sidebar vira drawer)

No mobile a barra lateral está empilhando em cima do conteúdo. Corrija no **shell do admin** (o layout compartilhado por todas as telas do `/admin`, não só o dashboard):

- Em telas ≥ 861px: sidebar fixa de 250px, como está.
- Em telas ≤ 860px: sidebar vira **off-canvas** — `position:fixed`, `transform:translateX(-100%)`, e desliza para dentro (`translateX(0)`) quando aberta.
- Adicionar um botão **hambúrguer** no topo (visível só no mobile) que abre a sidebar.
- Adicionar um **overlay** escuro que cobre o conteúdo quando a sidebar está aberta; tocar nele fecha.
- Fechar a sidebar também ao navegar para outro item.

Referência de comportamento e CSS: o arquivo `salmar-admin-dashboard-mobile.html` (classes `.side.open`, `.overlay`, `.menu-btn` e as funções `openNav()/closeNav()`). Reproduza esse comportamento no componente `<AdminShell>` para valer em Produtos, Orçamentos, Pedidos, etc.

---

## Parte 2 — Gráficos idênticos ao protótipo (NÃO usar biblioteca de gráfico)

Os gráficos do dashboard ficaram diferentes porque foram recriados com uma biblioteca (Recharts/Chart.js). **Isso é a causa.** Para ficarem idênticos ao aprovado:

- **Use o SVG exato do protótipo `salmar-admin-dashboard.html`, copiado verbatim**, para os três gráficos:
  1. **Faturamento no período** — área com `<path>` + gradiente `#860531` e ponto final âmbar. Copie o `<path d="...">` exatamente.
  2. **Pedidos por status** — donut feito com `<circle>` e `stroke-dasharray`/`stroke-dashoffset`. Copie os valores exatos.
  3. **Funil de orçamentos** — barras `<div>` com larguras decrescentes (100/75/40/34%), última em âmbar.
- **Não** substitua por Recharts, Chart.js, nem "melhore" as curvas/cores. O SVG é a fonte da verdade.
- Componentize como `<RevenueAreaChart>`, `<StatusDonut>`, `<QuoteFunnel>`, mas o conteúdo interno deve ser o SVG do protótipo.
- Quando ligar dados reais depois, apenas gere o `path`/`dasharray` a partir dos números mantendo **exatamente** o mesmo estilo visual (cores, espessuras, gradiente, ponto âmbar).

Cores obrigatórias dos gráficos: linha/área `#860531`; ponto e destaque `#f39a00`; donut nas cores `#1a7a4f` (pago), `#f39a00` (processando), `#2563a8` (enviado), `#860531` (entregue), `#b3261e` (cancelado).

---

## Parte 3 — Auditoria completa (o design system em TODAS as telas)

O visual novo foi aplicado só nas partes principais. **O checkout ("finalizar compra") ainda está na versão antiga**, e provavelmente outras telas também. Faça uma varredura rota por rota.

**Para cada rota, verifique e corrija:**
- Usa os tokens de cor da marca (`--wine`, `--amber`, `--paper`…) — nada de cinza/azul padrão do template.
- Usa as fontes corretas (Bricolage Grotesque, Fraunces, Inter).
- Inclui `<SiteHeader>` e `<SiteFooter>` (ou o `<AdminShell>` no admin).
- Usa os componentes do design system (botões, cards, inputs) — sem estilos soltos legados.
- Responsivo (mobile-first) e com foco de teclado visível.

**Checklist de rotas (loja):**
- [ ] `/` Home
- [ ] `/produtos` Catálogo
- [ ] `/categoria/[slug]`
- [ ] `/produto/[slug]`
- [ ] `/carrinho`
- [ ] **`/checkout` — PRIORIDADE: está na versão antiga.** Endereço, frete, pagamento (PIX/boleto/cartão), revisão — tudo com o visual novo.
- [ ] `/pedido/[order_number]` Confirmação
- [ ] Solicitar orçamento (formulário + upload de arte)
- [ ] `/login` e cadastro (PF/PJ)
- [ ] `/conta` (perfil, endereços, **meus pedidos**, **meus orçamentos**)
- [ ] Institucionais: sobre, contato, políticas

**Checklist de rotas (admin) — todas dentro do `<AdminShell>` com o drawer mobile:**
- [ ] `/admin` Dashboard (gráficos da Parte 2)
- [ ] `/admin/produtos` (lista + editor) — ref. `salmar-admin-produtos.html`
- [ ] `/admin/orcamentos` (fila + cotação) — ref. `salmar-admin-orcamentos.html`
- [ ] `/admin/pedidos`
- [ ] `/admin/categorias`
- [ ] `/admin/clientes`
- [ ] `/admin/cupons`
- [ ] `/admin/configuracoes`

**Entregável da auditoria:** uma lista do estado de cada rota (✅ atualizada / ⚠️ parcial / ❌ antiga) **antes** de corrigir. Comece pelas ❌, priorizando o checkout. Corrija, faça deploy e me mostre.

---

## Ordem de execução
1. Parte 1 (drawer mobile no AdminShell) → mostrar.
2. Parte 2 (gráficos com SVG exato) → mostrar o dashboard.
3. Parte 3 — rodar a auditoria e me dar a **lista de estado** de todas as rotas.
4. Corrigir as telas ❌/⚠️ começando pelo checkout.
5. Deploy e revisão final.

Não pule para corrigir tudo de uma vez: quero ver a lista de estado da Parte 3 antes das correções em massa.
