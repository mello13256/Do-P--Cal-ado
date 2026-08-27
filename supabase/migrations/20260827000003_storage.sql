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
