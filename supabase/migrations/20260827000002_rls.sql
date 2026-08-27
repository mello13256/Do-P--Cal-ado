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
