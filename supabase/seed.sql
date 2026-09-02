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
