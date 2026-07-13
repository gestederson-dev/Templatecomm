# Salmar Brindes — E-commerce Híbrido (B2C + B2B)
### Documento-mestre de projeto / prompt para o Claude Code

> **Como usar:** cole este documento no início da sua sessão do Claude Code como briefing do projeto. Peça pra ele começar pela **Fase 0** (setup + schema) e só avançar de fase quando a anterior estiver rodando. Não peça tudo de uma vez numa mensagem só — vá fase a fase.

---

## 1. Contexto e objetivo

A **Salmar Brindes** vende brindes corporativos e itens promocionais. O negócio é **híbrido**:

- **Venda direta (B2C):** produtos prontos, cliente compra pelo carrinho + checkout normal.
- **Orçamento (B2B):** produtos personalizáveis (logo, gravação, cor, quantidade mínima). O cliente **solicita cotação**, o admin responde com preço, o cliente aprova e vira pedido.

Precisamos de: **loja pública**, **painel administrativo** (CRUD de produtos, gestão de pedidos e orçamentos, clientes) e um **dashboard de insights**. Tudo em produção, com deploy na Vercel.

Um mesmo produto pode ser vendido **das duas formas**: ter preço para compra direta *e* aceitar pedido de orçamento personalizado.

---

## 2. Stack técnica

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + lucide-react
- **Banco / Auth / Storage:** Supabase (Postgres, Supabase Auth, Supabase Storage para imagens/artes)
- **Pagamento:** Mercado Pago (PIX + boleto + cartão). Isolar num módulo `lib/payments/` com interface genérica, para permitir trocar de gateway depois sem reescrever o checkout.
- **Frete:** Melhor Envio (cálculo de frete Correios/transportadoras). Também isolar em `lib/shipping/`.
- **Deploy:** Vercel
- **Validação:** Zod
- **Estado/carrinho:** Zustand (carrinho persistido em localStorage + sincronizado com o banco quando logado)
- **Gráficos do dashboard:** Recharts

---

## 3. Modelo de dados (Supabase / Postgres)

Criar como migrations SQL versionadas em `supabase/migrations/`. Habilitar **RLS** em todas as tabelas.

### Tabelas principais

**`profiles`** (estende auth.users)
- `id` (uuid, FK auth.users), `role` (enum: `admin`, `customer`), `full_name`, `phone`, `person_type` (enum: `pf`, `pj`), `cpf`, `cnpj`, `company_name`, `created_at`

**`categories`**
- `id`, `name`, `slug` (unique), `description`, `parent_id` (self-FK, subcategorias), `image_url`, `sort_order`, `is_active`

**`products`**
- `id`, `name`, `slug` (unique), `description`, `category_id` (FK)
- `base_price` (numeric, preço venda direta — nullable se só orçamento)
- `sku`, `stock_quantity`, `weight_grams`, `dimensions` (jsonb: altura/largura/comprimento p/ frete)
- `allow_direct_sale` (bool), `allow_quote` (bool)  ← controla os dois fluxos por produto
- `min_quote_quantity` (int, quantidade mínima p/ orçamento)
- `is_active`, `is_featured`, `created_at`, `updated_at`

**`product_images`**
- `id`, `product_id` (FK), `url`, `alt`, `sort_order`, `is_primary`

**`product_customization_options`** (opções de personalização p/ orçamento)
- `id`, `product_id` (FK), `name` (ex: "Cor", "Tipo de gravação"), `type` (enum: `select`, `text`, `color`, `logo_upload`), `options` (jsonb, valores possíveis), `required` (bool)

**`price_tiers`** (preço por quantidade — B2B)
- `id`, `product_id` (FK), `min_quantity`, `max_quantity` (nullable), `unit_price`

**`addresses`**
- `id`, `profile_id` (FK), `label`, `cep`, `street`, `number`, `complement`, `district`, `city`, `state`, `is_default`

### Carrinho e venda direta

**`carts`** — `id`, `profile_id` (nullable p/ convidado), `session_id`, `created_at`
**`cart_items`** — `id`, `cart_id` (FK), `product_id` (FK), `quantity`, `unit_price`, `customization` (jsonb)

**`orders`**
- `id`, `order_number` (sequencial legível), `profile_id` (FK)
- `status` (enum: `pending`, `paid`, `processing`, `shipped`, `delivered`, `canceled`)
- `origin` (enum: `direct`, `quote` — se veio de venda direta ou de orçamento aprovado)
- `subtotal`, `shipping_cost`, `discount`, `total`
- `shipping_address` (jsonb, snapshot), `payment_method`, `payment_id` (id no Mercado Pago), `payment_status`
- `tracking_code`, `notes`, `created_at`, `updated_at`

**`order_items`** — `id`, `order_id` (FK), `product_id`, `product_name` (snapshot), `quantity`, `unit_price`, `customization` (jsonb), `total`

### Orçamentos (fluxo B2B)

**`quotes`**
- `id`, `quote_number` (sequencial), `profile_id` (FK)
- `status` (enum: `requested`, `quoted`, `approved`, `rejected`, `expired`, `converted`)
- `customer_message`, `admin_response`, `quoted_total` (nullable), `valid_until`
- `converted_order_id` (FK orders, nullable), `created_at`, `updated_at`

**`quote_items`** — `id`, `quote_id` (FK), `product_id`, `product_name`, `quantity`, `customization` (jsonb, inclui logo/arte), `requested_notes`, `unit_price` (preenchido pelo admin)

### Configuração e conteúdo

**`site_settings`** (linha única ou key-value)
- logo_url, cores primária/secundária, nome, contato (email/telefone/whatsapp), redes sociais, textos de políticas, CNPJ da loja, endereço

**`banners`** — `id`, `title`, `image_url`, `link`, `sort_order`, `is_active`
**`coupons`** — `id`, `code`, `type` (percent/fixed), `value`, `min_order`, `usage_limit`, `used_count`, `valid_until`, `is_active`

### RLS (regras de acesso)
- `profiles`, `orders`, `quotes`, `addresses`, `carts`: cliente só enxerga os próprios registros.
- `admin` (role) enxerga e edita tudo.
- `products`, `categories`, `banners`, `site_settings`: leitura pública; escrita só admin.

---

## 4. Áreas da aplicação

### 4.1 Loja pública (storefront)
- **Home:** banners, categorias em destaque, produtos em destaque, chamada para "Peça seu orçamento".
- **Catálogo `/produtos`:** grid com filtros (categoria, faixa de preço, personalizável), busca, ordenação, paginação.
- **Categoria `/categoria/[slug]`**
- **Produto `/produto/[slug]`:** galeria, descrição, preço; se `allow_direct_sale` → botão "Adicionar ao carrinho"; se `allow_quote` → bloco de personalização + "Solicitar orçamento". Um produto pode mostrar os dois.
- **Carrinho `/carrinho`**
- **Checkout `/checkout`:** endereço + cálculo de frete (Melhor Envio) + pagamento (Mercado Pago: PIX/boleto/cartão) + revisão.
- **Confirmação `/pedido/[order_number]`**
- **Solicitar orçamento:** formulário com itens, quantidades, personalização, upload de logo/arte, mensagem.
- **Conta do cliente `/conta`:** dados, endereços, **histórico de pedidos**, **meus orçamentos** (acompanhar status, aprovar/rejeitar cotação recebida).
- **Páginas institucionais:** sobre, contato, políticas (conteúdo de `site_settings`).

### 4.2 Painel administrativo `/admin`
Rota protegida (role = admin). Layout com sidebar.
- **Dashboard** (ver seção 6).
- **Produtos:** listagem + CRUD completo, upload de imagens (Supabase Storage), opções de personalização, faixas de preço por quantidade, ativar/desativar.
- **Categorias:** CRUD + ordenação + subcategorias.
- **Pedidos:** listagem com filtros por status, detalhe do pedido, mudança de status, código de rastreio.
- **Orçamentos:** fila de cotações. Abrir → preencher preços dos itens/total → enviar cotação ao cliente → acompanhar aprovação → **converter em pedido** com 1 clique.
- **Clientes:** listagem, detalhe (PF/PJ), histórico.
- **Cupons:** CRUD.
- **Configurações do site:** editar `site_settings` (logo, cores, contato, banners da home, textos). É a "configuração do ecommerce" que o cliente pediu.

---

## 5. Fluxos-chave

### Venda direta
Produto → adicionar ao carrinho → checkout → escolhe endereço → calcula frete → paga (Mercado Pago) → webhook confirma pagamento → `order.status = paid` → e-mail de confirmação → admin processa/envia.

### Orçamento B2B
Produto personalizável → cliente monta pedido (quantidade + personalização + upload de arte) → cria `quote` (status `requested`) → admin recebe notificação → admin precifica item a item → cotação enviada (status `quoted`, `valid_until`) → cliente aprova (`approved`) → sistema **gera `order`** com `origin = quote` → cliente paga → segue como pedido normal.

> Detalhe importante: o **webhook do Mercado Pago** é a fonte de verdade do pagamento. Nunca marcar pedido como pago só no retorno do frontend.

---

## 6. Dashboard de insights

Cards de métricas + gráficos (Recharts). Filtro por período (7/30/90 dias, custom).

**Métricas:**
- Faturamento no período + comparação com período anterior
- Nº de pedidos + ticket médio
- **Orçamentos pendentes** (precisam de resposta) — destaque, é o gargalo do B2B
- **Taxa de conversão orçamento → venda** (quotes `converted` / quotes totais)
- Novos clientes

**Gráficos:**
- Faturamento ao longo do tempo (linha)
- Pedidos por status (barras/pizza)
- Top 10 produtos mais vendidos
- Funil de orçamentos: solicitados → cotados → aprovados → convertidos

---

## 7. Autenticação e permissões
- Supabase Auth (email/senha + magic link opcional).
- Trigger no signup cria linha em `profiles` com `role = customer`.
- Primeiro admin: criar manualmente via SQL ou seed.
- Middleware Next.js protege `/admin/*` (checa role) e `/conta/*` (autenticado).
- RLS no banco como segunda camada de segurança (não confiar só no middleware).

---

## 8. Considerações Brasil (não pular)
- **PIX** obrigatório no checkout (Mercado Pago gera QR + copia-e-cola).
- **Boleto** e **cartão** (parcelamento) também.
- Validar **CPF** (PF) e **CNPJ** (PJ) no cadastro. B2B geralmente é PJ.
- **CEP** com autocompletar endereço (ViaCEP).
- Frete via **Melhor Envio** (sandbox primeiro).
- **NF-e:** fora do MVP, mas deixar `order` preparado para receber dados fiscais depois.

---

## 9. Estrutura de pastas sugerida
```
/app
  /(store)        → loja pública
  /(auth)         → login/cadastro
  /conta          → área do cliente
  /admin          → painel (protegido)
  /api            → webhooks (mercadopago), rotas server
/components
  /ui             → shadcn
  /store, /admin  → componentes por área
/lib
  /supabase       → clients (server/client/admin)
  /payments       → abstração Mercado Pago
  /shipping       → abstração Melhor Envio
  /validators     → schemas Zod
/supabase
  /migrations     → SQL versionado
  /seed.sql
/stores           → Zustand (carrinho)
```

---

## 10. Variáveis de ambiente (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MELHOR_ENVIO_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

---

## 11. Ordem de implementação (fases)

Mesmo sendo build completo, construa **nesta ordem** — cada fase deve rodar antes da próxima:

- **Fase 0 — Setup:** Next.js + Tailwind + shadcn + clients Supabase. Migrations com **todas** as tabelas + RLS + seed (1 admin, categorias e produtos de exemplo). Deploy inicial na Vercel funcionando.
- **Fase 1 — Storefront:** home, catálogo, categoria, página de produto (com os dois botões), busca/filtros.
- **Fase 2 — Auth + conta:** cadastro/login (PF/PJ), área do cliente, endereços.
- **Fase 3 — Carrinho + checkout + Mercado Pago:** carrinho, frete (Melhor Envio), pagamento PIX/boleto/cartão, webhook, confirmação.
- **Fase 4 — Fluxo de orçamento:** solicitação, área do cliente p/ acompanhar, aprovação.
- **Fase 5 — Admin (CRUD):** produtos, categorias, pedidos, orçamentos (responder + converter), clientes, cupons.
- **Fase 6 — Dashboard de insights.**
- **Fase 7 — Configurações do site + banners + páginas institucionais.**
- **Fase 8 — Polimento:** SEO, responsivo, e-mails transacionais, tratamento de erros, loading states.

---

## 12. Instruções para o Claude Code
1. Comece pela Fase 0 e me mostre as migrations antes de aplicar.
2. Use Server Components por padrão; Client Components só onde precisar de interatividade.
3. Toda query sensível passa pelo Supabase com RLS; nunca exponha a service_role key no client.
4. Isole Mercado Pago e Melhor Envio atrás de interfaces (`lib/payments`, `lib/shipping`).
5. Commits pequenos e frequentes; após cada fase, faça deploy na Vercel e valide.
6. Ao final de cada fase, liste o que ficou pronto e o que falta antes de seguir.
