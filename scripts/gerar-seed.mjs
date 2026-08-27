/**
 * Gera `supabase/seed.sql` a partir dos arquivos de `src/data`.
 *
 * Uso: npm run seed:sql
 *
 * Serve para levar o catálogo que está no código para dentro do banco —
 * seja o catálogo demonstrativo, seja o catálogo real depois que você o
 * cadastrar em `src/data/products.ts`.
 */
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })

const { brands } = await server.ssrLoadModule('/src/data/brands.ts')
const { categories } = await server.ssrLoadModule('/src/data/categories.ts')
const { products } = await server.ssrLoadModule('/src/data/products.ts')

await server.close()

/** Escapa um valor para SQL (string, número, booleano ou null). */
const sql = (value) => {
  if (value === undefined || value === null || value === '') return 'null'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return `'${String(value).replace(/'/g, "''")}'`
}

const textArray = (items) =>
  items && items.length > 0
    ? `array[${items.map((item) => sql(item)).join(', ')}]::text[]`
    : `'{}'::text[]`

const numberArray = (items) =>
  items && items.length > 0 ? `array[${items.join(', ')}]::smallint[]` : `'{}'::smallint[]`

const lines = []
lines.push('-- Gerado por `npm run seed:sql` — não edite à mão.')
lines.push('-- Reexecutar é seguro: os registros são atualizados pelo slug (upsert).')
lines.push('')

lines.push('-- Marcas ---------------------------------------------------------------')
lines.push('insert into public.brands (slug, name, logo_url, color, description, is_partner, sort_order) values')
lines.push(
  brands
    .map((brand, index) =>
      `  (${sql(brand.slug)}, ${sql(brand.name)}, ${sql(brand.logo)}, ${sql(brand.color)}, ${sql(brand.description)}, ${sql(brand.partner)}, ${index + 1})`,
    )
    .join(',\n') + '\non conflict (slug) do update set',
)
lines.push('  name = excluded.name, logo_url = excluded.logo_url, color = excluded.color,')
lines.push('  description = excluded.description, is_partner = excluded.is_partner, sort_order = excluded.sort_order;')
lines.push('')

lines.push('-- Categorias -----------------------------------------------------------')
lines.push('insert into public.categories (slug, name, tagline, description, image_url, sort_order) values')
lines.push(
  categories
    .map(
      (category, index) =>
        `  (${sql(category.slug)}, ${sql(category.name)}, ${sql(category.tagline)}, ${sql(category.description)}, ${sql(category.image)}, ${category.order ?? index + 1})`,
    )
    .join(',\n') + '\non conflict (slug) do update set',
)
lines.push('  name = excluded.name, tagline = excluded.tagline, description = excluded.description,')
lines.push('  image_url = excluded.image_url, sort_order = excluded.sort_order;')
lines.push('')

lines.push('-- Produtos -------------------------------------------------------------')
lines.push(
  'insert into public.products (slug, name, brand_id, category_id, gender, price, availability, description, highlights, sizes, featured, sku, created_at) values',
)
lines.push(
  products
    .map(
      (product) =>
        `  (${sql(product.slug)}, ${sql(product.name)},\n` +
        `   (select id from public.brands where slug = ${sql(product.brandId)}),\n` +
        `   (select id from public.categories where slug = ${sql(product.categoryId)}),\n` +
        `   ${sql(product.gender)}, ${product.price}, ${sql(product.availability)}, ${sql(product.description)},\n` +
        `   ${textArray(product.highlights)}, ${numberArray(product.sizes)}, ${sql(Boolean(product.featured))}, ${sql(product.sku)}, ${sql(product.createdAt ?? null)})`,
    )
    .join(',\n') + '\non conflict (slug) do update set',
)
lines.push('  name = excluded.name, brand_id = excluded.brand_id, category_id = excluded.category_id,')
lines.push('  gender = excluded.gender, price = excluded.price, availability = excluded.availability,')
lines.push('  description = excluded.description, highlights = excluded.highlights, sizes = excluded.sizes,')
lines.push('  featured = excluded.featured, sku = excluded.sku;')
lines.push('')

lines.push('-- Fotos dos produtos ---------------------------------------------------')
const imageRows = products.flatMap((product) =>
  product.images
    .filter((image) => image.src)
    .map(
      (image, index) =>
        `  ((select id from public.products where slug = ${sql(product.slug)}), ${sql(image.src)}, ${sql(image.alt)}, ${index + 1})`,
    ),
)
if (imageRows.length > 0) {
  lines.push('insert into public.product_images (product_id, url, alt, sort_order) values')
  lines.push(imageRows.join(',\n') + '\non conflict do nothing;')
} else {
  lines.push('-- (nenhuma foto cadastrada ainda — os produtos usam o placeholder do site)')
}
lines.push('')

lines.push('-- Estoque por numeração ------------------------------------------------')
lines.push('-- Cada numeração começa com 1 par em estoque; ajuste no painel administrativo.')
const sizeRows = products.flatMap((product) =>
  product.sizes.map(
    (size) =>
      `  ((select id from public.products where slug = ${sql(product.slug)}), ${size}, ${product.availability === 'em-estoque' ? 1 : 0})`,
  ),
)
if (sizeRows.length > 0) {
  lines.push('insert into public.product_sizes (product_id, size, stock) values')
  lines.push(sizeRows.join(',\n') + '\non conflict (product_id, size) do nothing;')
}
lines.push('')

writeFileSync('supabase/seed.sql', lines.join('\n'))
console.log(
  `seed.sql gerado: ${brands.length} marcas, ${categories.length} categorias, ${products.length} produtos, ${imageRows.length} fotos, ${sizeRows.length} numerações.`,
)
