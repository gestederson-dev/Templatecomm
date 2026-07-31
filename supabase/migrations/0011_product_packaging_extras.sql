-- Cada produto escolhe quais itens do catálogo de embalagem (pricing_settings.packaging_extras)
-- ele usa — embalagem varia por produto (um kit grande não leva a mesma caixa
-- de uma caneta avulsa), então aplicar o catálogo inteiro em todo produto tava errado.
alter table public.product_costs
  add column packaging_extra_ids jsonb not null default '[]';
-- formato: ["id-do-item-1", "id-do-item-2"] — ids referenciam pricing_settings.packaging_extras[].id
