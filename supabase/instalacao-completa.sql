-- =============================================================================
-- Do Pé Calçados — instalação completa do banco
-- =============================================================================
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- Cria as tabelas, as regras de acesso, a pasta das fotos e as marcas e
-- categorias da loja. Os produtos são cadastrados pelo painel (/admin).
--
-- Pode rodar de novo sem medo: nada é duplicado.
-- =============================================================================

-- ####################  1/5 — ESTRUTURA  ####################
-- =============================================================================
-- Do Pé Calçados — estrutura do catálogo
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

-- ####################  2/5 — REGRAS DE ACESSO  ####################
-- =============================================================================
-- Do Pé Calçados — políticas de acesso (Row Level Security)
-- =============================================================================
-- Regra geral:
--   • qualquer visitante pode LER o catálogo (é uma vitrine pública);
--   • só quem estiver cadastrado em public.admins pode ESCREVER.
-- A chave `anon` usada no site é pública por natureza: quem protege os dados
-- são estas políticas, não a chave.
-- =============================================================================

alter table public.brands         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.admins         enable row level security;

-- Quem é administrador?
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- Leitura pública -------------------------------------------------------------
drop policy if exists "leitura publica de marcas" on public.brands;
create policy "leitura publica de marcas"
  on public.brands for select using (true);

drop policy if exists "leitura publica de categorias" on public.categories;
create policy "leitura publica de categorias"
  on public.categories for select using (true);

-- Produtos inativos só aparecem para administradores.
drop policy if exists "leitura publica de produtos ativos" on public.products;
create policy "leitura publica de produtos ativos"
  on public.products for select using (is_active or public.is_admin());

drop policy if exists "leitura publica de fotos" on public.product_images;
create policy "leitura publica de fotos"
  on public.product_images for select using (true);

drop policy if exists "leitura publica de numeracoes" on public.product_sizes;
create policy "leitura publica de numeracoes"
  on public.product_sizes for select using (true);

-- Escrita restrita aos administradores ----------------------------------------
drop policy if exists "administradores gerenciam marcas" on public.brands;
create policy "administradores gerenciam marcas"
  on public.brands for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "administradores gerenciam categorias" on public.categories;
create policy "administradores gerenciam categorias"
  on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "administradores gerenciam produtos" on public.products;
create policy "administradores gerenciam produtos"
  on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "administradores gerenciam fotos" on public.product_images;
create policy "administradores gerenciam fotos"
  on public.product_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "administradores gerenciam numeracoes" on public.product_sizes;
create policy "administradores gerenciam numeracoes"
  on public.product_sizes for all using (public.is_admin()) with check (public.is_admin());

-- Cada administrador enxerga a própria linha (usado pelo painel para saber se
-- a pessoa logada tem permissão). A tabela `admins` só é alterada pelo painel
-- do Supabase / SQL Editor.
drop policy if exists "administrador ve o proprio cadastro" on public.admins;
create policy "administrador ve o proprio cadastro"
  on public.admins for select using (user_id = auth.uid());

-- ####################  3/5 — FOTOS (STORAGE)  ####################
-- =============================================================================
-- Do Pé Calçados — armazenamento das fotos
-- =============================================================================
-- Bucket público `catalogo`: leitura livre (as fotos aparecem no site),
-- upload e remoção apenas para administradores.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('catalogo', 'catalogo', true)
on conflict (id) do update set public = true;

drop policy if exists "leitura publica das fotos do catalogo" on storage.objects;
create policy "leitura publica das fotos do catalogo"
  on storage.objects for select
  using (bucket_id = 'catalogo');

drop policy if exists "administradores enviam fotos" on storage.objects;
create policy "administradores enviam fotos"
  on storage.objects for insert
  with check (bucket_id = 'catalogo' and public.is_admin());

drop policy if exists "administradores atualizam fotos" on storage.objects;
create policy "administradores atualizam fotos"
  on storage.objects for update
  using (bucket_id = 'catalogo' and public.is_admin());

drop policy if exists "administradores removem fotos" on storage.objects;
create policy "administradores removem fotos"
  on storage.objects for delete
  using (bucket_id = 'catalogo' and public.is_admin());

-- ####################  4/5 — PROMOÇÃO E ETIQUETA  ####################
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

-- ####################  5/5 — MARCAS E CATEGORIAS  ####################
-- Gerado por `npm run seed:sql` — não edite à mão.
-- Reexecutar é seguro: os registros são atualizados pelo slug (upsert).

-- Marcas ---------------------------------------------------------------
insert into public.brands (slug, name, logo_url, color, description, is_partner, sort_order) values
  ('penalty', 'Penalty', null, '#111827', 'Chuteiras, bolas e artigos esportivos.', true, 1),
  ('comfortflex', 'Comfortflex', null, '#c8102e', 'Calçados femininos com foco em conforto.', true, 2),
  ('olympikus', 'Olympikus', null, '#1b2f8a', 'Tênis esportivos e de caminhada.', true, 3),
  ('via-marte', 'Via Marte', null, '#c2185b', 'Sandálias e tamancos femininos.', true, 4),
  ('macboot', 'Macboot', null, '#6d9b00', 'Botas e calçados para trilha e uso diário.', true, 5),
  ('ramarim', 'Ramarim', null, '#141619', 'Calçados femininos para o dia a dia.', true, 6),
  ('umbro', 'Umbro', null, '#111111', 'Artigos esportivos e confecções.', true, 7),
  ('dakota', 'Dakota', null, '#e2231a', 'Calçados femininos e infantis.', true, 8),
  ('freeway', 'Freeway', null, '#141619', 'Calçados casuais para toda a família.', true, 9),
  ('outras-marcas', 'Outras marcas', null, '#545a63', 'Itens diversos disponíveis na loja.', false, 10)
on conflict (slug) do update set
  name = excluded.name, logo_url = excluded.logo_url, color = excluded.color,
  description = excluded.description, is_partner = excluded.is_partner, sort_order = excluded.sort_order;

-- Categorias -----------------------------------------------------------
insert into public.categories (slug, name, tagline, description, image_url, sort_order) values
  ('tenis', 'Tênis', 'Confira nossos modelos', 'Tênis esportivos, casuais e de caminhada para adultos e crianças, das marcas que a loja trabalha há décadas.', null, 1),
  ('chuteira', 'Chuteira', 'Para quem leva o jogo a sério', 'Chuteiras de campo, society e futsal em numerações adulto e infantil.', null, 2),
  ('sandalia', 'Sandália', 'Conforto para o dia a dia', 'Sandálias femininas, masculinas e infantis para todos os momentos.', null, 3),
  ('tamanco', 'Tamanco', 'Leveza e estilo', 'Tamancos confortáveis, do modelo básico ao salto bloco.', null, 4),
  ('calcado', 'Calçado', 'Do trabalho ao passeio', 'Sapatos, botas, sapatilhas e mocassins para o dia a dia.', null, 5),
  ('artigos-esportivos', 'Artigos esportivos', 'Bolas, meiões e acessórios', 'Tudo para treinar e jogar: bolas, caneleiras, meiões e acessórios.', null, 6),
  ('confeccoes', 'Confecções', 'Roupas para toda a família', 'Camisetas, shorts, agasalhos e conjuntos esportivos.', null, 7),
  ('brinquedos', 'Brinquedos', 'Diversão para a criançada', 'Bolas, brinquedos de praia e itens para brincar dentro e fora de casa.', null, 8),
  ('diversos', 'Diversos', 'Um pouco de tudo na loja', 'Palmilhas, cadarços, produtos de limpeza e cuidado para calçados.', null, 9)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  image_url = excluded.image_url, sort_order = excluded.sort_order;

-- Produtos -------------------------------------------------------------
-- (nenhum produto no arquivo local — cadastre pelo painel em /admin)


-- Fotos dos produtos ---------------------------------------------------
-- (nenhuma foto cadastrada ainda — os produtos usam o placeholder do site)

-- Estoque por numeração ------------------------------------------------
-- Cada numeração começa com 1 par em estoque; ajuste no painel administrativo.
