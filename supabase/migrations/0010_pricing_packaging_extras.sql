-- Itens de embalagem que acompanham a entrega (cartão, doce, lembrancinha)
-- configurados uma vez e aplicados em todo produto, em vez de redigitar em
-- cada product_costs. "per":"unit" soma por unidade vendida; "per":"order"
-- soma uma vez por pedido e dilui pela quantidade.
alter table public.pricing_settings
  add column packaging_extras jsonb not null default '[]';
-- formato: [{"label": "Cartão de agradecimento", "amount": 0.50, "per": "unit"}, ...]
