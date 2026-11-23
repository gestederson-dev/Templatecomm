# Salmar Brindes — Histórico completo do e-commerce

As conversas em que o site foi construído (julho e agosto de 2026) foram apagadas pela
limpeza automática de 30 dias do Claude Code. Este arquivo reconstrói o que foi feito a
partir do código, dos 69 commits, dos documentos do projeto e das conversas posteriores
que ainda existem. Reconstruído em 23/11/2026.

Leia junto com: `CLAUDE.md` (regras), `.claude/docs/salmar-brindes-spec.md` (spec
original), `roteiro-fases.md`, `identidade visual/design-system (1).md`.

---

## 1. O negócio

- **Salmar Personalizados / Salmar Brindes**: brindes personalizados e gravação a laser.
  Não atende no local nem vai até o cliente.
- Antes a marca era **Salmar Semijoias** (cliente de tráfego até agosto/2026). Desde
  outubro/2026 o foco é só brindes e personalizados.
- CNPJ: 48.616.853/0001-89. E-mail: contato@salmarbrindes.com.br.
- Perfil no Google Maps em criação desde 15/10/2026, a partir do perfil antigo da Salmar
  Personalizado.

## 2. Onde está cada coisa

| O quê | Onde |
|---|---|
| Código | `C:\Users\eders\.claude\projects\salmar-brindes` |
| GitHub | `gestederson-dev/Templatecomm` (branch `main`) |
| Site no ar | `salmarbrindes.com.br` (o domínio antigo `salmar-brindes.vercel.app` redireciona para ele, ver `src/proxy.ts`) |
| Vercel | projeto `salmar-brindes`, ligado ao GitHub desde 23/11/2026: cada push na `main` publica sozinho |
| Banco, login e arquivos | Supabase (URL e chaves no `.env.local`) |
| Protótipos HTML aprovados | `painel admin/`, `Mobile/`, `correção 1407/` |
| Logo e identidade | `identidade visual/` |
| Arquivos da marca e orçamentos em PDF | `OneDrive\Documentos\Salmar Personalizados` |

## 3. Stack e decisões que valem até hoje

- Next.js 16 (App Router) + TypeScript, Tailwind + shadcn/ui, Supabase, Zustand
  (carrinho), Zod, Resend (e-mails), Vitest (testes). Middleware se chama `src/proxy.ts`.
- **Dinheiro em `numeric(10,2)` / `number`**, não em centavos. Diferente do
  financeiro-mei, e foi decidido de propósito no plano da calculadora.
- **Gráficos do dashboard são SVG copiado do protótipo**, não Recharts (commit
  7ee2036). Motivo: a biblioteca não ficava idêntica ao aprovado.
- **Pagamento:** Mercado Pago com **Payment Brick embutido** na página (sem redirecionar).
  O webhook é a fonte da verdade do pagamento.
- **Frete:** Melhor Envio por **OAuth** (conectar em Admin > Configurações). O
  `/oauth/token` exige multipart, não urlencoded (commit 1310b7f).
- Produto tem **ativo** e **publicado no site** separados (commit eb2680e): dá para usar
  um produto em pedido manual sem mostrar na loja.
- Login do admin (`/admin/login`) é separado do login da loja.
- Visual: vinho `#860531`, âmbar `#f39a00`, fontes Bricolage Grotesque + Fraunces + Inter,
  coração facetado como assinatura.

## 4. Linha do tempo

| Data | O que aconteceu |
|---|---|
| 12/07 | Projeto criado: Next.js, Supabase, schema inicial (migration 0001), deploy na Vercel |
| 13/07 | Fases 1 a 8 do roteiro no mesmo dia: loja, login PF/PJ, carrinho e checkout, orçamentos, admin, dashboard, configurações, SEO, e-mails |
| 13–14/07 | Identidade visual aplicada em todas as telas; drawer mobile no admin; gráficos trocados por SVG; navegação mobile da loja; favicon e loader da marca (prompt em `correção 1407/`) |
| 22/07 | Recuperação e troca de senha; login do admin separado; pedido manual para vendas pelo WhatsApp; personalização (cor) também na compra direta; domínio próprio |
| 24/07 | Melhor Envio por OAuth; checkout com Payment Brick; Pix e boleto recuperam o resultado se a aba recarregar; página e lista de pedidos redesenhadas no estilo Mercado Livre |
| 31/07 | Calculadora de precificação no admin, com itens de embalagem por produto (plano em `docs/plano-calculadora-precificacao.md`) |
| 03/08 | Admin: lista de pedidos, orçamento manual, editar e excluir pedido |
| 04/08 | Área de **Fiado** (contas a receber de clientes), com edição rápida de pago e pendente |
| 06/08 | Ativo separado de publicado; gráfico de faturamento redesenhado |
| 18/09 | Frete parou: o token do Melhor Envio expirou depois de semanas sem uso. Corrigido (commit ef87b34), ver pendências |
| 23/11 | **Confirmação de pedido por link** (`/confirmar/[token]`): o cliente que fechou vê o resumo com foto, escolhe pagamento, anexa a logo, diz se quer nota fiscal e preenche os dados. Respostas em Admin > Confirmações. Primeiro uso: Compec, 130 copos térmicos a R$ 26,90 |

## 5. O que o site tem hoje

**Loja:** home, catálogo com filtros, categoria, produto (compra direta e/ou orçamento),
carrinho, checkout (endereço, frete, Pix/boleto/cartão), página do pedido, solicitar
orçamento com envio de arte, cadastro PF/PJ com CPF/CNPJ, recuperar senha, Minha conta
(dados, endereços com ViaCEP, meus pedidos, meus orçamentos), sobre, contato, políticas.

**Admin:** dashboard, produtos (imagens, personalização, preço por quantidade, ativo e
publicado), categorias, pedidos (lista, detalhe, novo manual, editar, excluir),
orçamentos (fila, cotar, converter em pedido, novo manual), clientes, cupons, banners,
fiado, precificação, configurações (dados da loja + conexão com o Melhor Envio).

**Banco:** 15 migrations em `supabase/migrations/` (0001 schema inicial até 0015
publicar produto). RLS em todas as tabelas.

**Variáveis de ambiente:** as do `.env.example`, mais `MELHOR_ENVIO_CLIENT_ID`,
`MELHOR_ENVIO_CLIENT_SECRET` e `CRON_SECRET`, que o código usa mas ainda não estão listadas
no `.env.example`.

## 6. Trabalho comercial feito fora do site

| Data | Documento |
|---|---|
| 05/2026 | Orçamento para o Instituto Veon (`OneDrive\...\Cotação Cliente - Instituto Veon`) |
| 09/10 | Orçamento de 300 copos térmicos 473 ml a R$ 27,90 + frete R$ 450 |
| 13/10 | Contraproposta: R$ 24,90 com frete grátis (R$ 7.470,00), entrega prevista 22/10 |
| 06/11 | Planilha de preços de 10 produtos (50 e 100 unidades, à vista e cartão 5x) no Google Drive |
| 06/11 | Proposta para a Compec com os 10 produtos (PDF em Downloads) |

Regra do cartão em 5x: total ÷ (1 − 7,57%), que é a conta que a maquininha faz. Exemplo:
R$ 1.995,00 vira R$ 2.158,39.

## 7. Pendências

1. **Criar `CRON_SECRET` na Vercel** (Production), se ainda não foi criada. Sem ela, a
   renovação semanal do token do Melhor Envio não roda e o frete pode travar de novo.
2. Se o frete travar: Admin > Configurações > **Reconectar** Melhor Envio, pelo site no ar.
3. Completar Configurações do site: WhatsApp, CNPJ e endereço estão vazios.
4. **Tela para gerar confirmações de pedido** no admin. Hoje cada confirmação é criada por
   SQL no Supabase (ver o insert da Compec no histórico do chat de 23/11).
5. O repositório `Templatecomm` no GitHub é público. Não tem senha nem chave, mas o código
   fica visível; dá para tornar privado sem afetar a Vercel.
6. A planilha de preços no Drive está com edição aberta para qualquer pessoa com o link e
   mostra o preço de custo. Vale restringir.
