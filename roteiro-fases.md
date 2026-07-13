# Salmar Brindes — Roteiro de Fases
### Mensagens de abertura para o Claude Code

> **Como usar:** com o `CLAUDE.md` e o spec já no repositório (carregados automaticamente),
> mande a mensagem de cada fase **uma de cada vez**. Só avance para a próxima quando a
> anterior estiver rodando, deployada na Vercel e você tiver confirmado.

---

## Regras que valem em TODA fase
(já estão no `CLAUDE.md`, mas reforce se ele esquecer)

- Não pular fase nem adiantar a próxima.
- Ao terminar, **listar o que ficou pronto e o que falta** e esperar minha confirmação.
- Deploy na Vercel ao fim de cada fase; validar que sobe sem erro.
- RLS em tudo; nunca expor a `service_role key` no client.
- Server Components por padrão; commits pequenos.

---

## 🟦 Fase 0 — Setup + Schema

> Leia o `CLAUDE.md` e o spec importado antes de começar. Faça **só a Fase 0**:
> 1. Inicialize o Next.js 14 (App Router) com Tailwind + shadcn/ui e os clients do Supabase (server, client, admin).
> 2. Coloque o schema em `supabase/migrations/0001_initial_schema.sql` e **me mostre o SQL antes de aplicar**.
> 3. Configure o deploy inicial na Vercel e confirme que a home sobe sem erro.
>
> Ao terminar, liste o que ficou pronto e o que falta. **Não avance sem eu confirmar.**

---

## 🟦 Fase 1 — Storefront (loja pública)

> Fase 0 concluída e no ar. Agora a **Fase 1 — storefront**, conforme o spec:
> - Home: banners, categorias em destaque, produtos em destaque, chamada "Peça seu orçamento".
> - Catálogo `/produtos` com filtros (categoria, faixa de preço, personalizável), busca, ordenação e paginação.
> - Página de categoria `/categoria/[slug]`.
> - Página de produto `/produto/[slug]`: galeria, descrição, preço. Se `allow_direct_sale` → botão "Adicionar ao carrinho"; se `allow_quote` → bloco de personalização + "Solicitar orçamento". Um produto pode mostrar os dois.
>
> Ainda **sem** lógica de carrinho/checkout (só a UI dos botões). Deploy e liste o que faltou.

---

## 🟦 Fase 2 — Autenticação + Área do cliente

> Fase 1 no ar. Agora a **Fase 2 — auth + conta**:
> - Cadastro e login (Supabase Auth), com escolha PF/PJ (validar CPF/CNPJ).
> - Middleware protegendo `/conta/*` (autenticado) e `/admin/*` (role admin).
> - Área do cliente `/conta`: dados do perfil, endereços (CRUD, com autocompletar CEP via ViaCEP), e as abas vazias de "Meus pedidos" e "Meus orçamentos" (preenchidas nas próximas fases).
>
> Confirme que a criação automática de profile no signup funciona. Deploy e liste o que faltou.

---

## 🟦 Fase 3 — Carrinho + Checkout + Mercado Pago

> Fase 2 no ar. Agora a **Fase 3 — carrinho, checkout e pagamento**:
> - Carrinho (Zustand, persistido e sincronizado com o banco quando logado).
> - Checkout: endereço → cálculo de frete via **Melhor Envio** (sandbox) → pagamento via **Mercado Pago** (PIX, boleto, cartão).
> - **Webhook** do Mercado Pago como fonte de verdade do pagamento (marca `order.status = paid`).
> - Página de confirmação `/pedido/[order_number]` e histórico em "Meus pedidos".
>
> Mantenha Mercado Pago e Melhor Envio atrás das interfaces em `lib/payments` e `lib/shipping`. Deploy e liste o que faltou.

---

## 🟦 Fase 4 — Fluxo de Orçamento (B2B)

> Fase 3 no ar. Agora a **Fase 4 — orçamentos**:
> - A partir de um produto com `allow_quote`, o cliente monta a solicitação (quantidade + personalização + upload de logo/arte no Supabase Storage + mensagem) → cria `quote` com status `requested`.
> - Em "Meus orçamentos", o cliente acompanha o status e, quando o admin cotar, pode **aprovar ou rejeitar**.
> - Ao aprovar, o sistema gera um `order` com `origin = 'quote'` e leva ao pagamento (reaproveitando o checkout da Fase 3).
>
> (A tela do admin para responder a cotação vem na Fase 5.) Deploy e liste o que faltou.

---

## 🟦 Fase 5 — Painel Admin (CRUD)

> Fase 4 no ar. Agora a **Fase 5 — painel admin** em `/admin` (protegido por role), com sidebar:
> - **Produtos:** CRUD completo, upload de imagens (Storage), opções de personalização, faixas de preço por quantidade, ativar/desativar.
> - **Categorias:** CRUD + ordenação + subcategorias.
> - **Pedidos:** listagem com filtros por status, detalhe, mudar status, código de rastreio.
> - **Orçamentos:** fila de cotações → abrir → precificar item a item → enviar cotação (status `quoted`, `valid_until`) → acompanhar aprovação → **converter em pedido** com 1 clique.
> - **Clientes:** listagem e detalhe (PF/PJ).
> - **Cupons:** CRUD.
>
> Deploy e liste o que faltou.

---

## 🟦 Fase 6 — Dashboard de Insights

> Fase 5 no ar. Agora a **Fase 6 — dashboard** em `/admin` (Recharts), com filtro por período (7/30/90 dias + custom):
> - Cards: faturamento (vs período anterior), nº de pedidos, ticket médio, **orçamentos pendentes**, **taxa de conversão orçamento→venda**, novos clientes.
> - Gráficos: faturamento no tempo (linha), pedidos por status, top 10 produtos, e o **funil de orçamentos** (solicitados → cotados → aprovados → convertidos).
>
> Deploy e liste o que faltou.

---

## 🟦 Fase 7 — Configurações do site + Conteúdo

> Fase 6 no ar. Agora a **Fase 7 — configuração do e-commerce**:
> - Tela admin de **Configurações** editando `site_settings`: logo, cores primária/secundária, contato (e-mail/telefone/WhatsApp), redes sociais, CNPJ e endereço da loja, textos de políticas.
> - Gestão de **banners** da home (CRUD + ordenação + ativar).
> - Páginas institucionais (sobre, contato, políticas) puxando conteúdo de `site_settings`.
>
> A loja deve refletir logo e cores definidos aqui. Deploy e liste o que faltou.

---

## 🟦 Fase 8 — Polimento

> Fase 7 no ar. Agora a **Fase 8 — polimento** para deixar pronto pra produção:
> - SEO (metadata, sitemap, Open Graph nas páginas de produto).
> - Responsivo revisado (mobile-first).
> - E-mails transacionais (confirmação de pedido, cotação enviada, pedido enviado).
> - Tratamento de erros e estados de loading em todas as telas.
> - Revisão final de segurança (RLS, rotas protegidas, nenhuma chave sensível exposta).
>
> Deploy final e checklist do que ficou pronto.

---

### Dica de ritmo
Se em alguma fase o Claude Code começar a fazer coisa demais de uma vez, corte:
**"Pare. Faça só o item X desta fase, mostre, e espere eu confirmar antes de seguir."**
