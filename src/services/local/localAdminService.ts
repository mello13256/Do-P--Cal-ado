import { slugify } from '../../lib/text'
import type { Brand, Category, Product, ProductView } from '../../types/catalog'
import type {
  BrandInput,
  CatalogAdminService,
  CategoryInput,
  ProductInput,
  SizeStock,
} from '../admin/adminService'
import { getSnapshot, updateSnapshot } from './localStore'

/**
 * Escrita no catálogo local (modo demonstração).
 *
 * Usado enquanto o Supabase não está configurado: as alterações ficam no
 * `localStorage` deste navegador, o que permite conhecer o painel inteiro antes
 * de ligar o banco. Nada é compartilhado com outros dispositivos.
 */
function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function toProduct(id: string, input: ProductInput, createdAt?: string): Product {
  return {
    id,
    slug: input.slug || slugify(input.name),
    name: input.name,
    brandId: input.brandId,
    categoryId: input.categoryId,
    gender: input.gender,
    sizes: [],
    price: input.price,
    promoPrice: input.promoPrice,
    badgeText: input.badgeText?.trim() || undefined,
    badgeColor: input.badgeText?.trim() ? (input.badgeColor ?? 'vermelho') : undefined,
    availability: input.availability,
    description: input.description,
    highlights: input.highlights,
    images: input.images.length > 0 ? input.images : [{ alt: input.name }],
    featured: input.featured,
    sku: input.sku,
    createdAt: createdAt ?? new Date().toISOString().slice(0, 10),
  }
}

function views(products: Product[]): ProductView[] {
  const { brands, categories } = getSnapshot()
  const brandById = new Map(brands.map((brand) => [brand.id, brand]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  return products
    .map((product) => {
      const brand = brandById.get(product.brandId)
      const category = categoryById.get(product.categoryId)
      return brand && category ? ({ ...product, brand, category } as ProductView) : null
    })
    .filter((item): item is ProductView => item !== null)
}

/** Sem banco, a foto vira um endereço `data:` guardado com o produto. */
function lerComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => resolver(String(leitor.result))
    leitor.onerror = () => rejeitar(new Error('Não foi possível ler a foto.'))
    leitor.readAsDataURL(arquivo)
  })
}

export const localAdminService: CatalogAdminService = {
  supportsUpload: true,

  async listAllProducts(search) {
    const term = (search ?? '').trim().toLowerCase()
    const list = getSnapshot().products.filter(
      (product) =>
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? '').toLowerCase().includes(term) ||
        product.slug.includes(term),
    )
    return views(list).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  },

  async getProductById(id) {
    return getSnapshot().products.find((product) => product.id === id) ?? null
  },

  async createProduct(input) {
    const product = toProduct(nextId('p'), input)
    updateSnapshot((current) => ({ ...current, products: [...current.products, product] }))
    return product
  },

  async updateProduct(id, input) {
    const existing = getSnapshot().products.find((product) => product.id === id)
    const updated: Product = {
      ...toProduct(id, input, existing?.createdAt),
      sizes: existing?.sizes ?? [],
    }
    updateSnapshot((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === id ? updated : product)),
    }))
    return updated
  },

  async deleteProduct(id) {
    updateSnapshot((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== id),
    }))
  },

  async updatePrice(id, price) {
    updateSnapshot((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id ? { ...product, price } : product,
      ),
    }))
  },

  async updateAvailability(id, availability) {
    updateSnapshot((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id ? { ...product, availability } : product,
      ),
    }))
  },

  async setProductActive(id, isActive) {
    // Sem banco não há coluna "ativo": esconder equivale a marcar como
    // indisponível no catálogo local.
    updateSnapshot((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id
          ? { ...product, availability: isActive ? 'em-estoque' : 'indisponivel' }
          : product,
      ),
    }))
  },

  async listProductSizes(productId) {
    const product = getSnapshot().products.find((item) => item.id === productId)
    return (product?.sizes ?? []).map((size) => ({ size, stock: 1 }))
  },

  async saveProductSizes(productId, sizes: SizeStock[]) {
    const withStock = sizes
      .filter((entry) => entry.stock > 0)
      .map((entry) => entry.size)
      .sort((a, b) => a - b)
    updateSnapshot((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? { ...product, sizes: withStock } : product,
      ),
    }))
  },

  async uploadImage(file) {
    const url = await lerComoDataUrl(file)
    // O armazenamento do navegador é pequeno; acima disso a foto não caberia
    // junto com o resto do catálogo.
    if (url.length > 900_000) {
      throw new Error(
        'Foto muito pesada para o modo demonstração. Com o banco configurado não há esse limite.',
      )
    }
    return { url }
  },

  async createBrand(input: BrandInput): Promise<Brand> {
    const brand = {
      id: input.slug || slugify(input.name),
      slug: input.slug || slugify(input.name),
      name: input.name,
      logo: input.logo ?? '',
      color: input.color,
      description: input.description,
      partner: input.partner,
    }
    updateSnapshot((current) => ({ ...current, brands: [...current.brands, brand] }))
    return brand
  },

  async updateBrand(id, input) {
    const brand = {
      id,
      slug: input.slug,
      name: input.name,
      logo: input.logo ?? '',
      color: input.color,
      description: input.description,
      partner: input.partner,
    }
    updateSnapshot((current) => ({
      ...current,
      brands: current.brands.map((item) => (item.id === id ? brand : item)),
    }))
    return brand
  },

  async deleteBrand(id) {
    updateSnapshot((current) => ({
      ...current,
      brands: current.brands.filter((brand) => brand.id !== id),
    }))
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const category: Category = {
      id: input.slug || slugify(input.name),
      slug: input.slug || slugify(input.name),
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      image: input.image ?? '',
      order: input.order ?? 99,
    }
    updateSnapshot((current) => ({ ...current, categories: [...current.categories, category] }))
    return category
  },

  async updateCategory(id, input) {
    const category: Category = {
      id,
      slug: input.slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      image: input.image ?? '',
      order: input.order ?? 99,
    }
    updateSnapshot((current) => ({
      ...current,
      categories: current.categories.map((item) => (item.id === id ? category : item)),
    }))
    return category
  },

  async deleteCategory(id) {
    updateSnapshot((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== id),
    }))
  },
}
