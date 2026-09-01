import { normalizeText } from '../../lib/text'
import type {
  Brand,
  Category,
  CatalogQuery,
  Paginated,
  PriceRange,
  ProductView,
} from '../../types/catalog'
import type { CatalogService } from '../catalogService'
import { getCatalogVersion } from '../catalogSignal'
import { requireSupabase } from './client'
import { mapBrand, mapCategory, mapProduct } from './mappers'
import type { BrandRow, CategoryRow, ProductRow } from './types'

const DEFAULT_PER_PAGE = 12
const PRODUCT_SELECT =
  'id, slug, name, brand_id, category_id, gender, price, availability, description, highlights, sizes, featured, sku, is_active, created_at, product_images(id, product_id, url, alt, sort_order)'

interface Taxonomy {
  brands: (Brand & { partner: boolean })[]
  categories: Category[]
  brandById: Map<string, Brand>
  categoryById: Map<string, Category>
}

/**
 * Marcas e categorias mudam pouco e são poucas dezenas de linhas: guardamos em
 * memória para evitar um `join` em toda consulta de produto. O cache é
 * descartado sempre que o painel administrativo grava alguma alteração.
 */
let taxonomyCache: { version: number; data: Promise<Taxonomy> } | null = null

async function fetchTaxonomy(): Promise<Taxonomy> {
  const client = requireSupabase()
  const [brandsResult, categoriesResult] = await Promise.all([
    client.from('brands').select('*').order('sort_order'),
    client.from('categories').select('*').order('sort_order'),
  ])

  if (brandsResult.error) throw brandsResult.error
  if (categoriesResult.error) throw categoriesResult.error

  const brands = (brandsResult.data as BrandRow[]).map(mapBrand)
  const categories = (categoriesResult.data as CategoryRow[]).map(mapCategory)

  return {
    brands,
    categories,
    brandById: new Map(brands.map(({ partner: _partner, ...brand }) => [brand.id, brand])),
    categoryById: new Map(categories.map((category) => [category.id, category])),
  }
}

function taxonomy(): Promise<Taxonomy> {
  const version = getCatalogVersion()
  if (!taxonomyCache || taxonomyCache.version !== version) {
    taxonomyCache = { version, data: fetchTaxonomy() }
  }
  return taxonomyCache.data
}

function toView(row: ProductRow, data: Taxonomy): ProductView | null {
  const brand = data.brandById.get(row.brand_id)
  const category = data.categoryById.get(row.category_id)
  if (!brand || !category) return null
  return { ...mapProduct(row), brand, category }
}

/** Monta a consulta com todos os filtros aplicados no banco. */
function buildQuery(query: CatalogQuery, data: Taxonomy) {
  const client = requireSupabase()
  let request = client
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', true)

  if (query.categorySlugs?.length) {
    const ids = data.categories
      .filter((category) => query.categorySlugs!.includes(category.slug))
      .map((category) => category.id)
    request = request.in('category_id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
  }

  if (query.brandSlugs?.length) {
    const ids = data.brands
      .filter((brand) => query.brandSlugs!.includes(brand.slug))
      .map((brand) => brand.id)
    request = request.in('brand_id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
  }

  if (query.genders?.length) {
    // Produtos unissex servem a qualquer público selecionado.
    request = request.in('gender', [...query.genders, 'unissex'])
  }

  if (query.sizes?.length) {
    request = request.overlaps('sizes', query.sizes)
  }

  if (query.availability?.length) {
    request = request.in('availability', query.availability)
  }

  if (typeof query.minPrice === 'number') request = request.gte('price', query.minPrice)
  if (typeof query.maxPrice === 'number') request = request.lte('price', query.maxPrice)

  // Busca: cada palavra precisa aparecer no texto do produto, no nome da marca
  // ou no nome da categoria (tudo sem acento — ver coluna `search_text`).
  const term = normalizeText(query.search ?? '')
  if (term) {
    for (const word of term.split(/\s+/).filter(Boolean)) {
      const escaped = word.replace(/[%,()]/g, '')
      if (!escaped) continue
      const brandIds = data.brands
        .filter((brand) => normalizeText(brand.name).includes(escaped))
        .map((brand) => brand.id)
      const categoryIds = data.categories
        .filter((category) => normalizeText(category.name).includes(escaped))
        .map((category) => category.id)

      const conditions = [`search_text.ilike.*${escaped}*`]
      if (brandIds.length > 0) conditions.push(`brand_id.in.(${brandIds.join(',')})`)
      if (categoryIds.length > 0) conditions.push(`category_id.in.(${categoryIds.join(',')})`)
      request = request.or(conditions.join(','))
    }
  }

  switch (query.sort) {
    case 'menor-preco':
      request = request.order('price', { ascending: true })
      break
    case 'maior-preco':
      request = request.order('price', { ascending: false })
      break
    case 'nome':
      request = request.order('name', { ascending: true })
      break
    case 'novidades':
      request = request.order('created_at', { ascending: false })
      break
    default:
      // Relevância: em estoque primeiro ('em-estoque' < 'indisponivel'),
      // depois destaques e por fim ordem alfabética.
      request = request
        .order('availability', { ascending: true })
        .order('featured', { ascending: false })
        .order('name', { ascending: true })
  }

  return request
}

/**
 * Catálogo lido do Supabase (Postgres).
 *
 * Filtros, busca, ordenação e paginação acontecem no banco — a página carrega
 * só os 12 produtos que vai mostrar, o que sustenta um catálogo grande.
 */
export const supabaseCatalogService: CatalogService = {
  async listProducts(query = {}) {
    const data = await taxonomy()
    const perPage = query.perPage ?? DEFAULT_PER_PAGE
    const page = Math.max(1, query.page ?? 1)
    const from = (page - 1) * perPage

    const { data: rows, count, error } = await buildQuery(query, data).range(from, from + perPage - 1)
    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const items = (rows as ProductRow[])
      .map((row) => toView(row, data))
      .filter((item): item is ProductView => item !== null)

    // Página além do fim (ex.: filtro reduziu o total): repete na última página.
    if (page > totalPages && total > 0) {
      return supabaseCatalogService.listProducts({ ...query, page: totalPages })
    }

    const result: Paginated<ProductView> = { items, total, page, perPage, totalPages }
    return result
  },

  async getProductBySlug(slug) {
    const client = requireSupabase()
    const data = await taxonomy()
    const { data: row, error } = await client
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return row ? toView(row as ProductRow, data) : null
  },

  async getRelatedProducts(product, limit = 4) {
    const client = requireSupabase()
    const data = await taxonomy()
    const { data: rows, error } = await client
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .neq('id', product.id)
      .or(`category_id.eq.${product.categoryId},brand_id.eq.${product.brandId}`)
      .order('availability', { ascending: true })
      .limit(limit)

    if (error) throw error
    return (rows as ProductRow[])
      .map((row) => toView(row, data))
      .filter((item): item is ProductView => item !== null)
  },

  async getFeaturedProducts(limit = 8) {
    const client = requireSupabase()
    const data = await taxonomy()
    const { data: rows, error } = await client
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('availability', 'em-estoque')
      // Só os marcados como destaque: desmarcar no painel tira da vitrine.
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (rows as ProductRow[])
      .map((row) => toView(row, data))
      .filter((item): item is ProductView => item !== null)
  },

  async listCategories() {
    return (await taxonomy()).categories
  },

  async getCategoryBySlug(slug) {
    const data = await taxonomy()
    return data.categories.find((category) => category.slug === slug) ?? null
  },

  async listBrands(options = {}) {
    const data = await taxonomy()
    const list = options.onlyPartners ? data.brands.filter((brand) => brand.partner) : data.brands
    return list.map(({ partner: _partner, ...brand }) => brand)
  },

  async getPriceRange(): Promise<PriceRange> {
    const client = requireSupabase()
    const [lowest, highest] = await Promise.all([
      client.from('products').select('price').eq('is_active', true).order('price').limit(1).maybeSingle(),
      client
        .from('products')
        .select('price')
        .eq('is_active', true)
        .order('price', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (lowest.error) throw lowest.error
    if (highest.error) throw highest.error
    if (!lowest.data || !highest.data) return { min: 0, max: 0 }

    return {
      min: Math.floor(Number((lowest.data as { price: number | string }).price)),
      max: Math.ceil(Number((highest.data as { price: number | string }).price)),
    }
  },

  async listAvailableSizes() {
    const client = requireSupabase()
    const { data, error } = await client.from('products').select('sizes').eq('is_active', true)
    if (error) throw error

    const sizes = new Set<number>()
    ;(data as { sizes: number[] | null }[]).forEach((row) =>
      (row.sizes ?? []).forEach((size) => sizes.add(size)),
    )
    return [...sizes].sort((a, b) => a - b)
  },

  async countByCategory() {
    const client = requireSupabase()
    const { data, error } = await client.from('products').select('category_id').eq('is_active', true)
    if (error) throw error

    return (data as { category_id: string }[]).reduce<Record<string, number>>((acc, row) => {
      acc[row.category_id] = (acc[row.category_id] ?? 0) + 1
      return acc
    }, {})
  },
}
