-- =============================================================================
-- Do Pé Calçado — estrutura do catálogo
-- =============================================================================
-- Tabelas: brands, categories, products, product_images, product_sizes, admins.
-- Rode este arquivo primeiro (SQL Editor do Supabase ou `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "unaccent";   -- busca sem acento
create extension if not exists "pg_trgm";    -- índice para busca por trecho

-- `unaccent` não é marcada como imutável, então não pode ser usada direto em
-- coluna gerada. Este wrapper resolve isso.
create or replace function public.f_unaccent(text)
  returns text
  language sql
  immutable
  strict
  parallel safe
as $$
  select public.unaccent('public.unaccent', $1)
$$;

-- Mantém `updated_at` sempre atualizado.
create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Marcas ----------------------------------------------------------------------
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  logo_url    text,
  color       text,
  description text,
  -- true = marca parceira, exibida na seção "Marcas" do site.
  is_partner  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Categorias ------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tagline     text not null default '',
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Produtos --------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  brand_id     uuid not null references public.brands(id) on delete restrict,
  category_id  uuid not null references public.categories(id) on delete restrict,
  gender       text not null default 'unissex'
               check (gender in ('masculino', 'feminino', 'infantil', 'unissex')),
  price        numeric(10, 2) not null check (price >= 0),
  availability text not null default 'em-estoque'
               check (availability in ('em-estoque', 'indisponivel')),
  description  text not null default '',
  highlights   text[] not null default '{}',
  -- Numerações com estoque. Mantida automaticamente a partir de product_sizes
  -- (ver trigger abaixo); produtos sem numeração — bolas, confecções — ficam
  -- com o array vazio.
  sizes        smallint[] not null default '{}',
  featured     boolean not null default false,
  sku          text,
  -- false = produto oculto do site, sem precisar apagar o histórico.
  is_active    boolean not null default true,
  -- Texto normalizado (sem acento, minúsculo) usado pela busca.
  search_text  text generated always as (
                 lower(public.f_unaccent(
                   coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(description, '')
                 ))
               ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fotos dos produtos ----------------------------------------------------------
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Estoque por numeração -------------------------------------------------------
create table if not exists public.product_sizes (
  product_id uuid not null references public.products(id) on delete cascade,
  size       smallint not null check (size between 10 and 50),
  stock      integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, size)
);

-- Quem pode administrar o catálogo -------------------------------------------
-- Cadastre aqui o usuário criado em Authentication → Users:
--   insert into public.admins (user_id, name)
--   values ('<uuid-do-usuario>', 'Nome da pessoa');
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);

-- Índices ---------------------------------------------------------------------
create index if not exists products_category_idx     on public.products (category_id);
create index if not exists products_brand_idx        on public.products (brand_id);
create index if not exists products_price_idx        on public.products (price);
create index if not exists products_availability_idx on public.products (availability);
create index if not exists products_active_idx       on public.products (is_active);
create index if not exists products_sizes_idx        on public.products using gin (sizes);
create index if not exists products_search_idx       on public.products using gin (search_text gin_trgm_ops);
create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

-- Triggers --------------------------------------------------------------------
drop trigger if exists brands_updated_at on public.brands;
create trigger brands_updated_at before update on public.brands
  for each row execute function public.set_updated_at();

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Mantém `products.sizes` igual às numerações com estoque > 0.
create or replace function public.sync_product_sizes()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  target uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products
     set sizes = coalesce(
           (select array_agg(size order by size)
              from public.product_sizes
             where product_id = target and stock > 0),
           '{}'
         )
   where id = target;
  return null;
end;
$$;

drop trigger if exists product_sizes_sync on public.product_sizes;
create trigger product_sizes_sync
  after insert or update or delete on public.product_sizes
  for each row execute function public.sync_product_sizes();

-- Permissões ------------------------------------------------------------------
-- O Supabase já concede acesso às tabelas novas do schema `public` por padrão;
-- deixamos explícito para o caso de o projeto ter outra configuração.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema public to anon, authenticated;
    grant select on public.brands, public.categories, public.products,
                    public.product_images, public.product_sizes to anon, authenticated;
    grant select on public.admins to authenticated;
    grant insert, update, delete on public.brands, public.categories, public.products,
                                    public.product_images, public.product_sizes to authenticated;
  end if;
end;
$$;
