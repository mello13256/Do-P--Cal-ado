import type {
  Availability,
  BadgeColor,
  Brand,
  Category,
  Gender,
  Product,
  ProductView,
} from '../../types/catalog'

/** Dados de um produto no formulário do painel. */
export interface ProductInput {
  slug: string
  name: string
  brandId: string
  categoryId: string
  gender: Gender
  price: number
  /** Preço promocional; vazio quando não há promoção. */
  promoPrice?: number
  /** Etiqueta livre exibida no card: "Lançamento", "Novo"… */
  badgeText?: string
  badgeColor?: BadgeColor
  availability: Availability
  description: string
  highlights: string[]
  featured: boolean
  sku?: string
  isActive: boolean
  images: { src: string; alt: string }[]
}

/** Numeração + quantidade em estoque. */
export interface SizeStock {
  size: number
  stock: number
}

export interface BrandInput {
  slug: string
  name: string
  logo?: string
  color?: string
  description?: string
  partner: boolean
}

export interface CategoryInput {
  slug: string
  name: string
  tagline: string
  description?: string
  image?: string
  order?: number
}

/**
 * Contrato de escrita do catálogo — o que o painel administrativo precisa.
 *
 * Duas implementações:
 *   • `supabaseAdminService`  → grava no banco Postgres (uso real);
 *   • `localAdminService`     → grava no navegador (modo demonstração, sem banco).
 *
 * A escolha é automática em `src/services/index.ts`, conforme as variáveis de
 * ambiente do Supabase estejam ou não configuradas.
 */
export interface CatalogAdminService {
  /** Lista para o painel — inclui produtos ocultos do site. */
  listAllProducts(search?: string): Promise<ProductView[]>
  getProductById(id: string): Promise<Product | null>
  createProduct(input: ProductInput): Promise<Product>
  updateProduct(id: string, input: ProductInput): Promise<Product>
  deleteProduct(id: string): Promise<void>
  /** Atalhos usados na listagem. */
  updatePrice(id: string, price: number): Promise<void>
  updateAvailability(id: string, availability: Availability): Promise<void>
  setProductActive(id: string, isActive: boolean): Promise<void>

  listProductSizes(productId: string): Promise<SizeStock[]>
  saveProductSizes(productId: string, sizes: SizeStock[]): Promise<void>

  /** Envia a foto e devolve a URL pública para usar em `images[].src`. */
  uploadImage(file: File, productSlug: string): Promise<{ url: string }>
  /** `false` quando o envio de arquivos não está disponível (modo local). */
  readonly supportsUpload: boolean

  createBrand(input: BrandInput): Promise<Brand>
  updateBrand(id: string, input: BrandInput): Promise<Brand>
  deleteBrand(id: string): Promise<void>

  createCategory(input: CategoryInput): Promise<Category>
  updateCategory(id: string, input: CategoryInput): Promise<Category>
  deleteCategory(id: string): Promise<void>
}
