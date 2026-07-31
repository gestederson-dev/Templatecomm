# Plano — Calculadora de Precificação (painel admin)

Baseado no levantamento de pesquisa feito com Opus 5 (custos, taxas do Mercado
Pago, comportamento fiscal do MEI, fórmulas). Este documento é o plano de
construção — aguardando aprovação antes de codar.

## Objetivo

Dado um produto (e opcionalmente uma quantidade/tier), mostrar: custo total
real, preço mínimo pra não dar prejuízo, margem/lucro ao preço praticado,
comparação por meio de pagamento (Pix/cartão/boleto), validação das faixas de
`price_tiers`, e quanto do teto anual do MEI aquele pedido consome.

## 1. Modelo de dados (migration nova)

Duas tabelas novas, ambas **admin-only** (RLS `for all using (public.is_admin())`
— dado de custo/margem é sensível, não é público nem do cliente):

### `pricing_settings` — configuração global, linha única

Custos fixos mensais (lista `{label, amount}` em jsonb), DAS mensal, volume
mensal estimado (base do rateio), valor-hora do dono (calculado a partir de
pró-labore desejado ÷ horas trabalháveis, ou manual), taxas do Mercado Pago
(Pix %, boleto fixo, cartão % por prazo de liberação D0/D14/D30, tabela de
acréscimo por parcela 2x–12x), mix de pagamento (% Pix/cartão/boleto — usado
pra taxa efetiva ponderada), taxa de refugo/perda, política de frete, teto
anual do MEI (editável, não hardcoded), margem mínima aceitável (gatilho dos
alertas).

### `product_costs` — 1:1 com `products`

Custo do produto em branco, custo do insumo de personalização, tempo de
produção (min/unidade), tempo de setup (min/pedido), tempo de máquina +
custo-hora da máquina, custo de embalagem (unitário e por pedido), fator de
complexidade (1,0/1,3/1,6), peso já embalado (pode diferir do `weight_grams`
do produto).

Produto sem linha em `product_costs` = "sem custo cadastrado", tratado como
alerta na UI, não como erro.

## 2. Módulo de cálculo — `src/lib/pricing.ts`

Funções puras, sem I/O (recebem os dados, devolvem o resultado). Espinha
dorsal:

- `calcUnitCost` — monta o breakdown completo (produto branco → personalização
  → mão de obra → máquina → embalagem → ajuste de refugo → fixo rateado)
- `calcPriceFloor` — preço mínimo pela fórmula do divisor:
  `(custo + taxa fixa) / (1 − Σ% taxas)` — **nunca soma percentual ao custo**
- `calcMarginFromPrice` / `calcTargetPriceForMargin` — os dois sentidos:
  dado o preço → qual a margem; dada a margem desejada → qual o preço
- `calcBreakEven` — ponto de equilíbrio mensal (unidades e R$)
- `calcMeiCeilingUsage` — % do teto anual consumido por um pedido/pela receita
  acumulada
- `validatePriceTiers` — avalia cada faixa de `price_tiers` na quantidade
  MÍNIMA da faixa (é onde a margem é pior), checa monotonicidade de preço e
  "cliff" de lucro entre faixas
- Tabela de cenários por meio de pagamento (Pix / cartão 1x–12x / boleto)

Segue o padrão monetário já usado no resto do projeto (`numeric(10,2)` /
`number`, não `bigint` centavos — esse projeto não usa a convenção de
centavos do financeiro-mei). Arredondamento explícito, uma única vez, no
final de cada cálculo.

## 3. Telas no admin

- **`/admin/precificacao`** (novo item de nav, grupo "Vendas") — duas partes:
  - Configuração global (formulário de `pricing_settings`)
  - Simulador: escolhe um produto, quantidade e meio de pagamento → mostra o
    breakdown, o preço mínimo, a margem ao preço atual, a tabela comparativa
    por meio de pagamento, a validação dos tiers e o consumo do teto MEI
- **Aba nova no editor de produto** (`/admin/produtos/[id]`) — campos de
  `product_costs` daquele produto, com preview do preço mínimo ali mesmo
- **Alertas**: card no dashboard admin listando produtos com preço abaixo do
  mínimo calculado ou sem custo cadastrado

## 4. O que preciso que você (ou seu contador) confirme antes de eu colocar
   valor-padrão em produção

- Taxas reais do seu Mercado Pago (Pix, boleto, cartão por prazo e por
  parcela) — vou deixar tudo configurável, com os valores da pesquisa só como
  sugestão inicial
- Valor do DAS vigente e enquadramento (comércio R$82,05 / serviços R$86,05 /
  ambos R$87,05)
- Se o frete cobrado do cliente conta pro teto de faturamento do MEI

## 5. Pendência técnica: testes automatizados

O projeto hoje não tem test runner configurado (nem Vitest nem Jest). O
levantamento recomenda fortemente testes de invariante pro módulo de cálculo
(ex.: "preço mínimo aplicado de volta na fórmula dá lucro exatamente zero",
"soma dos componentes do breakdown bate com o preço ao centavo") — é dinheiro,
vale a pena. **Isso é uma dependência nova, preciso da sua confirmação antes
de instalar** (Vitest, provavelmente — mais leve pra rodar funções puras sem
framework de UI).

## Ordem de construção proposta

1. Migration (`pricing_settings` + `product_costs`, RLS admin-only)
2. `lib/pricing.ts` + testes (se aprovado o Vitest)
3. Tela de configuração global
4. Aba de custos no editor de produto
5. Simulador/calculadora
6. Alertas no dashboard (produtos abaixo do preço mínimo)
