# Salmar Personalizados — Design System
### Referência de implementação para o front-end (Next.js + Tailwind)

> Referência visual: o protótipo `salmar-home-v2.html`. Este documento traduz aquele
> visual em tokens e componentes para o código real. **Regra de ouro:** a ousadia mora
> num lugar só — o **coração facetado** e a linguagem de **joia lapidada**. Todo o resto
> é disciplinado e quieto. Não adicionar efeito que não sirva a essa assinatura.

---

## 1. Marca
- **Nome:** Salmar Personalizados.
- **Conceito:** joia lapidada. O símbolo é um **coração facetado** (como uma gema). Esse motivo se repete como assinatura: no hero, nos selos "sua marca", nas marcas-d'água.
- **Tom:** premium, caloroso, confiável. Corporativo sem ser frio.

## 2. Assets da logo (colocar em `public/logo/`)
- `salmar-logo-lockup.png` — lockup completo (coração + "Salmar Personalizados"). Usar no rodapé e em contextos grandes.
- `salmar-heart-mark.png` — só o coração facetado (fundo transparente). Usar no header, favicon, eyebrows e como motivo.
- Também há SVGs originais (`SalMar_sem_fundo.svg`) — preferir onde precisar de escala vetorial; senão o PNG basta.
- Favicon: gerar a partir do `salmar-heart-mark.png`.

## 3. Cores (tokens)
Definir como CSS variables em `globals.css` **e** espelhar no `tailwind.config`.

| Token | Hex | Papel |
|---|---|---|
| `wine` | `#860531` | Cor primária da marca. Títulos de destaque, botões primários, ícones. |
| `wine-deep` | `#5c0323` | Sombras/profundidade, facetas escuras. |
| `wine-lite` | `#a8214a` | Realce de faceta, hovers sutis. |
| `amber` | `#f39a00` | Acento/energia. CTAs de ação, brilhos de gema, tags "Personalizável". |
| `ink` | `#0a0a0a` | Texto principal, rodapé. |
| `paper` | `#f0f1f0` | Fundo do site. |
| `white` | `#ffffff` | Cards, superfícies. |

Tints derivados: `wine-tint = rgba(134,5,49,.06)`, `amber-tint = rgba(243,154,0,.14)`, `line = rgba(10,10,10,.10)`.

**Uso:** vinho domina, âmbar pontua (nunca o contrário). Fundo sempre `paper`; superfícies `white`; rodapé `ink`.

## 4. Tipografia
Carregar via `next/font/google` (as três estão no Google Fonts):
- **Display — Bricolage Grotesque** (700): títulos de seção (`h2`), títulos de card, headline do hero.
- **Serif — Fraunces** (500/600): wordmark "Salmar" e toques editoriais. Conversa com o serif da logo.
- **Body — Inter** (400/500/600): corpo, UI, labels, botões.

Escala do hero: `clamp(38px, 5vw, 62px)`, `line-height 1.04`, `letter-spacing -.025em`.
Títulos de seção: `clamp(26px, 3.4vw, 38px)`. Eyebrow/kicker: 12px, `letter-spacing .16em`, uppercase, cor `wine`.

## 5. Forma e profundidade
- **Raios:** botões `999px` (pílula); cards `20px`; category cards `18px`; ícones `12px`; faixa de orçamento `26px`.
- **Sombras:**
  - base: `0 1px 2px rgba(10,10,10,.04), 0 12px 30px -12px rgba(92,3,35,.18)`
  - lift (hover): `0 2px 4px rgba(10,10,10,.05), 0 24px 48px -16px rgba(92,3,35,.30)`
- **Facetas:** textura sutil nas miniaturas de produto — `repeating-linear-gradient` a 60° e -60°, branco a `.16` de opacidade, linhas a cada ~26px. Quase imperceptível.

## 6. Movimento (com moderação)
Princípio: um momento orquestrado vale mais que efeitos espalhados. Sempre respeitar `prefers-reduced-motion`.
- **Entrada do hero:** elementos sobem (`translateY 18px → 0` + fade) em cascata (delays 0.05s → 0.57s).
- **Sublinhado "brinde":** traço âmbar preenche da esquerda (`scaleX 0→1`) ~1.15s após carregar.
- **Coração (hero):** float suave em loop (±9px, 6s). Halo âmbar "respira" (scale 1↔1.08, 7s).
- **Brilhos de gema:** 3 estrelas âmbar sobre o coração, cintilando (opacity + scale) em tempos diferentes. É a assinatura — não remover.
- **Scroll reveal:** seções e grids entram com fade-up via IntersectionObserver, com stagger nos filhos.
- **Hover:** cards sobem 6–8px + sombra lift; botões sobem 2px; ícone do produto dá leve zoom/rotação.

## 7. Componentes

### Header (sticky, blur)
`salmar-heart-mark.png` (~46px) + wordmark "Salmar" (Fraunces, wine) com "Personalizados" pequeno em uppercase espaçado. Nav central. À direita: "Entrar" (ghost), "Peça seu orçamento" (outline wine), carrinho (ícone em bolha branca). Barra de categorias fina logo abaixo.

### Botões
- `btn-wine`: fundo vinho, texto branco. Ação primária de navegação (Ver catálogo).
- `btn-amber`: fundo âmbar, texto ink. Ação de conversão (Peça seu orçamento, adicionar).
- `btn-outline`: contorno vinho, preenche no hover.
- `btn-ghost`: sem fundo (Entrar).

### Hero
Split 1.05 / 0.95. Esquerda: eyebrow (com coração 17px) → headline com "brinde" destacado (sublinhado âmbar animado) → lead → dois CTAs (wine + amber) → linha de confiança com checks. Direita: o coração facetado grande, halo, 3 brilhos, e dois selos flutuantes ("Compra direta" vinho / "Sob orçamento" branco) que comunicam o modelo híbrido.

### Category card
Card branco, ícone de linha (stroke wine) em quadrado `wine-tint`, nome (Bricolage), "Ver →" âmbar no rodapé. Hover: sobe + véu `wine-tint`.

### Product card (importante — reflete o modelo híbrido)
- Miniatura com gradiente por categoria + textura de facetas + tag âmbar "Personalizável" + **selo losango facetado "SUA MARCA"** (o motivo de gema).
- Corpo: categoria (uppercase), título (Bricolage).
- Rodapé condicional:
  - Se `allow_direct_sale` → preço em vinho ("a partir de R$ XX,XX") + botão redondo vinho com "+".
  - Se só `allow_quote` → "Sob orçamento" em âmbar + botão âmbar de orçamento.
  - Se ambos → mostrar preço + permitir as duas ações.
- O selo losango é um SVG: `<path d="M24 3 45 24 24 45 3 24Z"/>` com stroke âmbar.

### Faixa de orçamento (CTA para empresas)
Bloco vinho, `border-radius 26px`, marca-d'água do coração (branco a 10%) no canto, kicker âmbar, título Bricolage, botão âmbar.

### Footer
Fundo `ink`. Lockup da logo (invertido para branco), texto sobre a marca, colunas Contato e Institucional (hover âmbar), linha de copyright.

## 8. Estrutura no código
- Tokens de cor + fontes: `globals.css` (CSS vars) e `tailwind.config.ts` (`theme.extend.colors`, `fontFamily`).
- Fontes: `next/font/google` em `app/layout.tsx`, expostas como CSS vars (`--font-display`, `--font-serif`, `--font-body`).
- Criar componentes reutilizáveis: `<Logo variant="mark|lockup" />`, `<Button variant=... />`, `<ProductCard />`, `<CategoryCard />`, `<Hero />`, `<QuoteBand />`, `<SiteHeader />`, `<SiteFooter />`.
- Animações: classes utilitárias + um hook `useReveal` (IntersectionObserver) para o scroll reveal.
- Cores da marca puxam de `site_settings` quando fizer sentido (primária/secundária), com estes valores como default.

## 9. Instruções para o Claude Code
1. Comece pelos **fundamentos**: tokens de cor no Tailwind + globals, as 3 fontes via next/font, e o componente `<Logo />` com os assets em `public/logo/`.
2. Depois **header e footer** (aparecem em todas as páginas).
3. Depois a **home**, replicando o protótipo `salmar-home-v2.html` como referência visual — hero (com coração + brilhos), categorias, cards de produto (com a lógica híbrida), faixa de orçamento.
4. **Não quebre** as rotas e a lógica já existentes (auth, carrinho, orçamento) — isto é camada visual sobre o que já funciona.
5. Garanta o piso de qualidade: responsivo (mobile-first), foco de teclado visível, `prefers-reduced-motion` respeitado.
6. Ao terminar a home, pare e me mostre para revisão antes de aplicar o mesmo sistema às páginas internas (catálogo e produto).
