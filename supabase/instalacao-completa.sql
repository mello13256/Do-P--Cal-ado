-- =============================================================================
-- Do Pé Calçado — instalação completa do banco
-- =============================================================================
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- Ele cria as tabelas, as regras de acesso, a pasta das fotos e já carrega o
-- catálogo atual.
--
-- Pode rodar de novo sem medo: nada é duplicado (os registros são atualizados
-- pelo slug).
--
-- Gerado a partir de supabase/migrations/ + supabase/seed.sql.
-- Para regerar depois de mudar src/data: npm run seed:sql
-- =============================================================================

-- ####################  1/4 — ESTRUTURA  ####################
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

-- ####################  2/4 — REGRAS DE ACESSO  ####################
-- =============================================================================
-- Do Pé Calçado — políticas de acesso (Row Level Security)
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

-- ####################  3/4 — FOTOS (STORAGE)  ####################
-- =============================================================================
-- Do Pé Calçado — armazenamento das fotos
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

-- ####################  4/4 — CATÁLOGO  ####################
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
insert into public.products (slug, name, brand_id, category_id, gender, price, availability, description, highlights, sizes, featured, sku, created_at) values
  ('tenis-esportivo-corrida-leve', 'Tênis Esportivo Corrida Leve',
   (select id from public.brands where slug = 'olympikus'),
   (select id from public.categories where slug = 'tenis'),
   'masculino', 249.9, 'em-estoque', 'Tênis de corrida com entressola amortecedora e cabedal em tecido respirável. Indicado para caminhadas diárias e treinos leves.',
   array['Solado com amortecimento', 'Cabedal respirável', 'Palmilha macia removível']::text[], array[38, 39, 40, 41, 42, 43, 44]::smallint[], true, 'OLY-COR-001', '2025-02-10'),
  ('tenis-casual-retro', 'Tênis Casual Retrô',
   (select id from public.brands where slug = 'olympikus'),
   (select id from public.categories where slug = 'tenis'),
   'feminino', 219.9, 'em-estoque', 'Modelo casual de inspiração retrô, com acabamento em camurça sintética e solado de borracha antiderrapante.',
   array['Visual clássico', 'Solado antiderrapante', 'Combina com looks do dia a dia']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'OLY-RET-002', '2025-01-22'),
  ('tenis-infantil-velcro', 'Tênis Infantil com Velcro',
   (select id from public.brands where slug = 'freeway'),
   (select id from public.categories where slug = 'tenis'),
   'infantil', 149.9, 'em-estoque', 'Tênis infantil com fechamento em velcro, fácil de calçar e leve para o uso na escola e nas brincadeiras.',
   array['Fecho em velcro', 'Leve e flexível', 'Forro macio']::text[], array[25, 26, 27, 28, 29, 30, 31, 32]::smallint[], true, 'FRW-INF-003', '2025-03-04'),
  ('tenis-caminhada-conforto', 'Tênis Caminhada Conforto',
   (select id from public.brands where slug = 'comfortflex'),
   (select id from public.categories where slug = 'tenis'),
   'feminino', 259.9, 'em-estoque', 'Desenvolvido para quem passa o dia em movimento: palmilha anatômica e solado flexível que acompanha a pisada.',
   array['Palmilha anatômica', 'Solado flexível', 'Peso reduzido']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'CFX-CAM-004', '2025-02-27'),
  ('chuteira-society-tracao', 'Chuteira Society Tração',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'chuteira'),
   'masculino', 279.9, 'em-estoque', 'Chuteira para grama sintética com travas baixas, boa aderência e cabedal que oferece toque preciso na bola.',
   array['Travas para grama sintética', 'Cabedal com toque macio', 'Costura reforçada']::text[], array[37, 38, 39, 40, 41, 42, 43, 44]::smallint[], true, 'PEN-SOC-005', '2025-03-18'),
  ('chuteira-futsal-profissional', 'Chuteira Futsal Profissional',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'chuteira'),
   'masculino', 329.9, 'em-estoque', 'Modelo para quadra com solado de borracha não marcante e ajuste firme no calcanhar para mudanças rápidas de direção.',
   array['Solado não marcante', 'Ajuste firme no calcanhar', 'Indicada para quadra']::text[], array[38, 39, 40, 41, 42, 43, 44, 45]::smallint[], false, 'PEN-FUT-006', '2025-04-02'),
  ('chuteira-infantil-society', 'Chuteira Infantil Society',
   (select id from public.brands where slug = 'umbro'),
   (select id from public.categories where slug = 'chuteira'),
   'infantil', 189.9, 'indisponivel', 'Chuteira society infantil, leve e com bom encaixe no pé — pensada para as primeiras peladas.',
   array['Leve', 'Travas baixas', 'Cadarço com passadores reforçados']::text[], array[28, 29, 30, 31, 32]::smallint[], false, 'UMB-INF-007', '2025-01-15'),
  ('sandalia-anabela-conforto', 'Sandália Anabela Conforto',
   (select id from public.brands where slug = 'via-marte'),
   (select id from public.categories where slug = 'sandalia'),
   'feminino', 189.9, 'em-estoque', 'Sandália anabela com salto revestido e tiras ajustáveis, equilibrando altura e conforto para o dia todo.',
   array['Salto anabela', 'Tiras ajustáveis', 'Palmilha acolchoada']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], true, 'VMT-ANA-008', '2025-03-11'),
  ('sandalia-rasteira-trancada', 'Sandália Rasteira Trançada',
   (select id from public.brands where slug = 'ramarim'),
   (select id from public.categories where slug = 'sandalia'),
   'feminino', 129.9, 'em-estoque', 'Rasteira com tiras trançadas e solado leve, fácil de combinar com qualquer produção de verão.',
   array['Tiras trançadas', 'Solado leve', 'Fivela metálica']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'RAM-RAS-009', '2025-02-05'),
  ('sandalia-papete-masculina', 'Sandália Papete Masculina',
   (select id from public.brands where slug = 'freeway'),
   (select id from public.categories where slug = 'sandalia'),
   'masculino', 159.9, 'em-estoque', 'Papete com três pontos de ajuste em velcro e solado emborrachado — prática para o calor e para o fim de semana.',
   array['Três ajustes em velcro', 'Solado emborrachado', 'Uso casual']::text[], array[38, 39, 40, 41, 42, 43, 44]::smallint[], false, 'FRW-PAP-010', '2025-01-30'),
  ('sandalia-infantil-colorida', 'Sandália Infantil Colorida',
   (select id from public.brands where slug = 'freeway'),
   (select id from public.categories where slug = 'sandalia'),
   'infantil', 89.9, 'em-estoque', 'Sandália infantil em material macio, com fecho em velcro e solado antiderrapante para brincar com segurança.',
   array['Material macio', 'Fecho em velcro', 'Solado antiderrapante']::text[], array[22, 23, 24, 25, 26, 27, 28, 29, 30]::smallint[], false, 'FRW-SIN-011', '2025-03-25'),
  ('tamanco-salto-bloco', 'Tamanco Salto Bloco',
   (select id from public.brands where slug = 'via-marte'),
   (select id from public.categories where slug = 'tamanco'),
   'feminino', 209.9, 'em-estoque', 'Tamanco de salto bloco, estável e elegante, indicado para o trabalho e para ocasiões especiais.',
   array['Salto bloco estável', 'Acabamento em couro sintético', 'Palmilha macia']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'VMT-TAM-012', '2025-02-18'),
  ('tamanco-confort-antiderrapante', 'Tamanco Confort Antiderrapante',
   (select id from public.brands where slug = 'comfortflex'),
   (select id from public.categories where slug = 'tamanco'),
   'feminino', 179.9, 'em-estoque', 'Tamanco fechado na frente, com solado antiderrapante — bastante procurado por quem trabalha em pé.',
   array['Solado antiderrapante', 'Bico fechado', 'Uso profissional']::text[], array[34, 35, 36, 37, 38, 39, 40]::smallint[], false, 'CFX-TAM-013', '2025-01-09'),
  ('tamanco-aberto-verao', 'Tamanco Aberto Verão',
   (select id from public.brands where slug = 'dakota'),
   (select id from public.categories where slug = 'tamanco'),
   'feminino', 169.9, 'indisponivel', 'Tamanco aberto com tira larga sobre o peito do pé, leve e fresco para os dias quentes.',
   array['Tira larga', 'Modelo leve', 'Solado em EVA']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'DKT-TAM-014', '2025-04-08'),
  ('bota-coturno-trilha', 'Bota Coturno Trilha',
   (select id from public.brands where slug = 'macboot'),
   (select id from public.categories where slug = 'calcado'),
   'masculino', 399.9, 'em-estoque', 'Coturno de cano médio com solado de alta tração, feito para trilhas, trabalho externo e uso pesado.',
   array['Solado de alta tração', 'Cano médio', 'Costura reforçada']::text[], array[38, 39, 40, 41, 42, 43, 44]::smallint[], true, 'MCB-COT-015', '2025-03-30'),
  ('bota-cano-curto-feminina', 'Bota Cano Curto Feminina',
   (select id from public.brands where slug = 'macboot'),
   (select id from public.categories where slug = 'calcado'),
   'feminino', 359.9, 'em-estoque', 'Bota de cano curto com zíper lateral e salto baixo, confortável para o inverno na cidade.',
   array['Zíper lateral', 'Salto baixo', 'Forro térmico']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'MCB-BCC-016', '2025-04-15'),
  ('sapato-social-classico', 'Sapato Social Clássico',
   (select id from public.brands where slug = 'freeway'),
   (select id from public.categories where slug = 'calcado'),
   'masculino', 249.9, 'em-estoque', 'Sapato social de acabamento liso, com cadarço e solado costurado — escolha certa para o trabalho e eventos.',
   array['Acabamento liso', 'Solado costurado', 'Forro interno macio']::text[], array[38, 39, 40, 41, 42, 43, 44, 45]::smallint[], false, 'FRW-SOC-017', '2025-02-01'),
  ('sapatilha-bico-fino', 'Sapatilha Bico Fino',
   (select id from public.brands where slug = 'ramarim'),
   (select id from public.categories where slug = 'calcado'),
   'feminino', 149.9, 'em-estoque', 'Sapatilha de bico fino com elástico discreto no cano, prática para o dia a dia e para o trabalho.',
   array['Bico fino', 'Elástico no cano', 'Palmilha acolchoada']::text[], array[34, 35, 36, 37, 38, 39]::smallint[], false, 'RAM-SAP-018', '2025-01-12'),
  ('mocassim-infantil', 'Mocassim Infantil',
   (select id from public.brands where slug = 'dakota'),
   (select id from public.categories where slug = 'calcado'),
   'infantil', 119.9, 'em-estoque', 'Mocassim infantil de acabamento macio, fácil de calçar e indicado para festas e ocasiões especiais.',
   array['Fácil de calçar', 'Acabamento macio', 'Solado flexível']::text[], array[24, 25, 26, 27, 28, 29, 30, 31, 32]::smallint[], false, 'DKT-MOC-019', '2025-03-08'),
  ('bola-futsal-costurada', 'Bola de Futsal Costurada',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'artigos-esportivos'),
   'unissex', 179.9, 'em-estoque', 'Bola de futsal com gomos costurados e câmara airbility, com quique controlado para jogos em quadra.',
   array['Gomos costurados', 'Quique controlado', 'Indicada para quadra']::text[], '{}'::smallint[], true, 'PEN-BOL-020', '2025-04-20'),
  ('bola-campo-oficial', 'Bola de Campo Oficial',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'artigos-esportivos'),
   'unissex', 219.9, 'em-estoque', 'Bola de campo tamanho oficial, com revestimento resistente para uso em grama natural e sintética.',
   array['Tamanho oficial', 'Revestimento resistente', 'Campo e society']::text[], '{}'::smallint[], false, 'PEN-CAM-021', '2025-02-22'),
  ('meiao-de-futebol', 'Meião de Futebol',
   (select id from public.brands where slug = 'umbro'),
   (select id from public.categories where slug = 'artigos-esportivos'),
   'unissex', 39.9, 'em-estoque', 'Meião esportivo com punho elástico e reforço no calcanhar. Disponível em várias cores na loja.',
   array['Punho elástico', 'Reforço no calcanhar', 'Tamanho adulto']::text[], '{}'::smallint[], false, 'UMB-MEI-022', '2025-01-05'),
  ('caneleira-com-protecao', 'Caneleira com Proteção',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'artigos-esportivos'),
   'unissex', 59.9, 'em-estoque', 'Par de caneleiras com casco rígido e espuma interna, disponíveis nos tamanhos infantil e adulto.',
   array['Casco rígido', 'Espuma interna', 'Tamanhos infantil e adulto']::text[], '{}'::smallint[], false, 'PEN-CAN-023', '2025-03-02'),
  ('bomba-de-ar-com-agulhas', 'Bomba de Ar com Agulhas',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'artigos-esportivos'),
   'unissex', 34.9, 'indisponivel', 'Bomba manual compacta acompanhada de agulhas para bolas de futebol, vôlei e basquete.',
   array['Bomba manual', 'Acompanha agulhas', 'Compacta']::text[], '{}'::smallint[], false, 'PEN-BMB-024', '2025-02-14'),
  ('camiseta-dry-treino', 'Camiseta Dry Treino',
   (select id from public.brands where slug = 'umbro'),
   (select id from public.categories where slug = 'confeccoes'),
   'masculino', 79.9, 'em-estoque', 'Camiseta esportiva em tecido de secagem rápida, leve e confortável para treinar em qualquer estação.',
   array['Tecido de secagem rápida', 'Tamanhos P, M, G e GG na loja', 'Uso esportivo e casual']::text[], '{}'::smallint[], false, 'UMB-CAM-025', '2025-03-14'),
  ('agasalho-esportivo', 'Agasalho Esportivo',
   (select id from public.brands where slug = 'penalty'),
   (select id from public.categories where slug = 'confeccoes'),
   'masculino', 259.9, 'em-estoque', 'Conjunto de agasalho com jaqueta e calça, ideal para treinos ao ar livre nos dias mais frios.',
   array['Jaqueta e calça', 'Bolsos com zíper', 'Tamanhos P ao GG na loja']::text[], '{}'::smallint[], false, 'PEN-AGA-026', '2025-04-11'),
  ('short-feminino-fitness', 'Short Feminino Fitness',
   (select id from public.brands where slug = 'umbro'),
   (select id from public.categories where slug = 'confeccoes'),
   'feminino', 89.9, 'em-estoque', 'Short de treino com cós alto e tecido com elasticidade, confortável para academia e caminhada.',
   array['Cós alto', 'Tecido com elastano', 'Tamanhos P, M e G na loja']::text[], '{}'::smallint[], false, 'UMB-SHO-027', '2025-02-26'),
  ('conjunto-infantil-verao', 'Conjunto Infantil Verão',
   (select id from public.brands where slug = 'freeway'),
   (select id from public.categories where slug = 'confeccoes'),
   'infantil', 99.9, 'em-estoque', 'Conjunto infantil de camiseta e bermuda em algodão, confortável para o verão e para brincar.',
   array['Camiseta e bermuda', 'Algodão macio', 'Tamanhos 2 ao 12 anos na loja']::text[], '{}'::smallint[], false, 'FRW-CJI-028', '2025-01-28'),
  ('bola-de-vinil-infantil', 'Bola de Vinil Infantil',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'brinquedos'),
   'infantil', 29.9, 'em-estoque', 'Bola de vinil leve e colorida, segura para brincar dentro e fora de casa.',
   array['Material leve', 'Cores variadas', 'A partir de 3 anos']::text[], '{}'::smallint[], false, 'DIV-BVI-029', '2025-03-20'),
  ('kit-bola-de-praia-e-boia', 'Kit Bola de Praia e Boia',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'brinquedos'),
   'infantil', 49.9, 'em-estoque', 'Kit inflável com bola e boia para a piscina e para os dias de praia.',
   array['Bola e boia infláveis', 'Material resistente', 'Uso com supervisão']::text[], '{}'::smallint[], false, 'DIV-KIT-030', '2025-04-05'),
  ('corda-de-pular-infantil', 'Corda de Pular Infantil',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'brinquedos'),
   'infantil', 24.9, 'em-estoque', 'Corda de pular com cabo emborrachado, no tamanho certo para a criançada.',
   array['Cabo emborrachado', 'Tamanho infantil', 'Estimula a coordenação']::text[], '{}'::smallint[], false, 'DIV-COR-031', '2025-02-08'),
  ('palmilha-anatomica-gel', 'Palmilha Anatômica em Gel',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'diversos'),
   'unissex', 34.9, 'em-estoque', 'Palmilha em gel que absorve o impacto e alivia o cansaço de quem passa muitas horas em pé.',
   array['Absorve impacto', 'Recortável', 'Tamanhos 33 ao 44 na loja']::text[], '{}'::smallint[], false, 'DIV-PAL-032', '2025-01-18'),
  ('kit-cuidados-para-calcados', 'Kit Cuidados para Calçados',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'diversos'),
   'unissex', 44.9, 'em-estoque', 'Kit com graxa, escova e flanela para conservar sapatos sociais e botas por muito mais tempo.',
   array['Graxa, escova e flanela', 'Para couro e sintético', 'Conserva o brilho']::text[], '{}'::smallint[], false, 'DIV-KCC-033', '2025-03-27'),
  ('cadarco-redondo-par', 'Cadarço Redondo (par)',
   (select id from public.brands where slug = 'outras-marcas'),
   (select id from public.categories where slug = 'diversos'),
   'unissex', 14.9, 'em-estoque', 'Par de cadarços redondos resistentes, disponíveis em vários comprimentos e cores.',
   array['Vários comprimentos', 'Cores variadas', 'Ponteira reforçada']::text[], '{}'::smallint[], false, 'DIV-CAD-034', '2025-02-12')
on conflict (slug) do update set
  name = excluded.name, brand_id = excluded.brand_id, category_id = excluded.category_id,
  gender = excluded.gender, price = excluded.price, availability = excluded.availability,
  description = excluded.description, highlights = excluded.highlights, sizes = excluded.sizes,
  featured = excluded.featured, sku = excluded.sku;

-- Fotos dos produtos ---------------------------------------------------
-- (nenhuma foto cadastrada ainda — os produtos usam o placeholder do site)

-- Estoque por numeração ------------------------------------------------
-- Cada numeração começa com 1 par em estoque; ajuste no painel administrativo.
insert into public.product_sizes (product_id, size, stock) values
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 38, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 39, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 40, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 41, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 42, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 43, 1),
  ((select id from public.products where slug = 'tenis-esportivo-corrida-leve'), 44, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 34, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 35, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 36, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 37, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 38, 1),
  ((select id from public.products where slug = 'tenis-casual-retro'), 39, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 25, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 26, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 27, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 28, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 29, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 30, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 31, 1),
  ((select id from public.products where slug = 'tenis-infantil-velcro'), 32, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 34, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 35, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 36, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 37, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 38, 1),
  ((select id from public.products where slug = 'tenis-caminhada-conforto'), 39, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 37, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 38, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 39, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 40, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 41, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 42, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 43, 1),
  ((select id from public.products where slug = 'chuteira-society-tracao'), 44, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 38, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 39, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 40, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 41, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 42, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 43, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 44, 1),
  ((select id from public.products where slug = 'chuteira-futsal-profissional'), 45, 1),
  ((select id from public.products where slug = 'chuteira-infantil-society'), 28, 0),
  ((select id from public.products where slug = 'chuteira-infantil-society'), 29, 0),
  ((select id from public.products where slug = 'chuteira-infantil-society'), 30, 0),
  ((select id from public.products where slug = 'chuteira-infantil-society'), 31, 0),
  ((select id from public.products where slug = 'chuteira-infantil-society'), 32, 0),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 34, 1),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 35, 1),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 36, 1),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 37, 1),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 38, 1),
  ((select id from public.products where slug = 'sandalia-anabela-conforto'), 39, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 34, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 35, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 36, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 37, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 38, 1),
  ((select id from public.products where slug = 'sandalia-rasteira-trancada'), 39, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 38, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 39, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 40, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 41, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 42, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 43, 1),
  ((select id from public.products where slug = 'sandalia-papete-masculina'), 44, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 22, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 23, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 24, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 25, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 26, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 27, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 28, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 29, 1),
  ((select id from public.products where slug = 'sandalia-infantil-colorida'), 30, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 34, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 35, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 36, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 37, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 38, 1),
  ((select id from public.products where slug = 'tamanco-salto-bloco'), 39, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 34, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 35, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 36, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 37, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 38, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 39, 1),
  ((select id from public.products where slug = 'tamanco-confort-antiderrapante'), 40, 1),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 34, 0),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 35, 0),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 36, 0),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 37, 0),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 38, 0),
  ((select id from public.products where slug = 'tamanco-aberto-verao'), 39, 0),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 38, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 39, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 40, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 41, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 42, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 43, 1),
  ((select id from public.products where slug = 'bota-coturno-trilha'), 44, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 34, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 35, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 36, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 37, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 38, 1),
  ((select id from public.products where slug = 'bota-cano-curto-feminina'), 39, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 38, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 39, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 40, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 41, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 42, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 43, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 44, 1),
  ((select id from public.products where slug = 'sapato-social-classico'), 45, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 34, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 35, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 36, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 37, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 38, 1),
  ((select id from public.products where slug = 'sapatilha-bico-fino'), 39, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 24, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 25, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 26, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 27, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 28, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 29, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 30, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 31, 1),
  ((select id from public.products where slug = 'mocassim-infantil'), 32, 1)
on conflict (product_id, size) do nothing;
