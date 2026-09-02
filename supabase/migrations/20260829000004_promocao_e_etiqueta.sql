-- =============================================================================
-- Do Pé Calçados — preço promocional e etiqueta do produto
-- =============================================================================
-- Acrescenta:
--   • promo_price   → preço em promoção (o antigo aparece riscado no site);
--   • badge_text    → etiqueta livre: "Lançamento", "Novo", "Últimas peças"…
--   • badge_color   → cor da etiqueta;
--   • effective_price → coluna calculada com o preço que vale hoje, usada
--     pelos filtros e pela ordenação por preço.
--
-- Pode rodar mais de uma vez sem problema.
-- =============================================================================

alter table public.products
  add column if not exists promo_price numeric(10, 2)
    check (promo_price is null or promo_price >= 0),
  add column if not exists badge_text text,
  add column if not exists badge_color text
    check (badge_color is null or badge_color in ('vermelho', 'preto', 'verde', 'azul', 'dourado'));

alter table public.products
  add column if not exists effective_price numeric(10, 2)
    generated always as (coalesce(promo_price, price)) stored;

create index if not exists products_effective_price_idx on public.products (effective_price);
