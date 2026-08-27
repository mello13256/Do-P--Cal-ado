import { brands } from '../data/brands'
import { categories } from '../data/categories'
import { products } from '../data/products'
import { normalizeText } from '../lib/text'
import type {
  Brand,
  Category,
  CatalogQuery,
  Paginated,
  PriceRange,
  Product,
  ProductView,
} from '../types/catalog'
import type { CatalogService } from './catalogService'

const DEFAULT_PER_PAGE = 12

const brandById = new Map(brands.map((brand) => [brand.id, brand]))
const categoryById = new Map(categories.map((category) => [category.id, category]))

/** Junta produto + marca + categoria numa estrutura pronta para a interface. */
function toProductView(product: Product): ProductView | null {
  const brand = brandById.get(product.brandId)
  const category = categoryById.get(product.categoryId)
  if (!brand || !category) {
    // Dado inconsistente: melhor esconder o produto do que quebrar a página.
    if (import.meta.env.DEV) {
      console.warn(
        `[catálogo] produto "${product.slug}" referencia marca/categoria inexistente.`,
      )
    }
    return null
  }
  return { ...product, brand, category }
}

const allProductViews: ProductView[] = products
  .map(toProductView)
  .filter((item): item is ProductView => item !== null)

function matchesGender(product: ProductView, genders: NonNullable<CatalogQuery['genders']>) {
  if (genders.length === 0) return true
  // Produtos unissex aparecem para qualquer público selecionado.
  if (product.gender === 'unissex') return true
  return genders.includes(product.gender)
}

function matchesSearch(product: ProductView, term: string) {
  if (!term) return true
  const haystack = normalizeText(
    [product.name, product.brand.name, product.category.name, product.description, product.sku ?? '']
      .join(' '),
  )
  // Todas as palavras digitadas precisam aparecer (busca "tenis olympikus").
  return normalizeText(term)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

function sortProducts(items: ProductView[], sort: CatalogQuery['sort']): ProductView[] {
  const sorted = [...items]
  switch (sort) {
    case 'menor-preco':
      return sorted.sort((a, b) => a.price - b.price)
    case 'maior-preco':
      return sorted.sort((a, b) => b.price - a.price)
    case 'nome':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    case 'novidades':
      return sorted.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
    default:
      // Relevância: em estoque primeiro, depois destaques, depois nome.
      return sorted.sort((a, b) => {
        const stock = Number(b.availability === 'em-estoque') - Number(a.availability === 'em-estoque')
        if (stock !== 0) return stock
        const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
        if (featured !== 0) return featured
        return a.name.localeCompare(b.name, 'pt-BR')
      })
  }
}

function applyFilters(query: CatalogQuery): ProductView[] {
  const {
    search = '',
    categorySlugs = [],
    brandSlugs = [],
    genders = [],
    sizes = [],
    availability = [],
    minPrice,
    maxPrice,
  } = query

  return allProductViews.filter((product) => {
    if (categorySlugs.length > 0 && !categorySlugs.includes(product.category.slug)) return false
    if (brandSlugs.length > 0 && !brandSlugs.includes(product.brand.slug)) return false
    if (!matchesGender(product, genders)) return false
    if (sizes.length > 0 && !sizes.some((size) => product.sizes.includes(size))) return false
    if (availability.length > 0 && !availability.includes(product.availability)) return false
    if (typeof minPrice === 'number' && product.price < minPrice) return false
    if (typeof maxPrice === 'number' && product.price > maxPrice) return false
    if (!matchesSearch(product, search)) return false
    return true
  })
}

/**
 * Implementação em memória, alimentada pelos arquivos de `src/data`.
 * Serve como referência de comportamento para uma futura implementação de API.
 */
export const staticCatalogService: CatalogService = {
  async listProducts(query = {}) {
    const filtered = sortProducts(applyFilters(query), query.sort)
    const perPage = query.perPage ?? DEFAULT_PER_PAGE
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const page = Math.min(Math.max(query.page ?? 1, 1), totalPages)
    const start = (page - 1) * perPage

    const result: Paginated<ProductView> = {
      items: filtered.slice(start, start + perPage),
      total: filtered.length,
      page,
      perPage,
      totalPages,
    }
    return result
  },

  async getProductBySlug(slug) {
    return allProductViews.find((product) => product.slug === slug) ?? null
  },

  async getRelatedProducts(product, limit = 4) {
    const sameCategory = allProductViews.filter(
      (item) => item.id !== product.id && item.categoryId === product.categoryId,
    )
    const sameBrand = allProductViews.filter(
      (item) =>
        item.id !== product.id &&
        item.brandId === product.brandId &&
        item.categoryId !== product.categoryId,
    )
    return [...sameCategory, ...sameBrand].slice(0, limit)
  },

  async getFeaturedProducts(limit = 8) {
    const featured = allProductViews.filter((product) => product.featured)
    const rest = allProductViews.filter((product) => !product.featured)
    return [...featured, ...rest]
      .filter((product) => product.availability === 'em-estoque')
      .slice(0, limit)
  },

  async listCategories(): Promise<Category[]> {
    return [...categories].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  },

  async getCategoryBySlug(slug) {
    return categories.find((category) => category.slug === slug) ?? null
  },

  async listBrands(options = {}): Promise<Brand[]> {
    const list = options.onlyPartners ? brands.filter((brand) => brand.partner) : brands
    return list.map(({ partner: _partner, ...brand }) => brand)
  },

  async getPriceRange(): Promise<PriceRange> {
    if (allProductViews.length === 0) return { min: 0, max: 0 }
    const prices = allProductViews.map((product) => product.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }
  },

  async listAvailableSizes() {
    const sizes = new Set<number>()
    allProductViews.forEach((product) => product.sizes.forEach((size) => sizes.add(size)))
    return [...sizes].sort((a, b) => a - b)
  },

  async countByCategory() {
    return allProductViews.reduce<Record<string, number>>((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1
      return acc
    }, {})
  },
}
