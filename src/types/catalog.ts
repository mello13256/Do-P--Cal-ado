/**
 * Modelos de domínio do catálogo.
 *
 * Estes tipos são a "fronteira" entre os dados e a interface: hoje eles são
 * preenchidos por arquivos estáticos em `src/data`, amanhã podem vir de uma API
 * ou banco de dados sem que nenhum componente visual precise mudar.
 */

export type Gender = 'masculino' | 'feminino' | 'infantil' | 'unissex'

export type Availability = 'em-estoque' | 'indisponivel'

export interface Category {
  id: string
  /** Usado nas URLs: /produtos?categoria=tenis */
  slug: string
  name: string
  /** Frase curta exibida no card da categoria. */
  tagline: string
  description?: string
  /** Caminho da imagem (ex.: "/categorias/tenis.jpg"). Vazio = placeholder. */
  image?: string
  /** Ordem de exibição na home e no menu. */
  order?: number
}

export interface Brand {
  id: string
  slug: string
  name: string
  /** Caminho do logo oficial (ex.: "/brands/penalty.svg"). Vazio = wordmark. */
  logo?: string
  /** Cor usada no wordmark de fallback, aproximada da marca. */
  color?: string
  description?: string
}

export interface ProductImage {
  /** Caminho do arquivo. Se ausente, o site desenha um placeholder elegante. */
  src?: string
  alt: string
}

/** Cores possíveis para a etiqueta personalizada do produto. */
export type BadgeColor = 'vermelho' | 'preto' | 'verde' | 'azul' | 'dourado'

export interface Product {
  id: string
  slug: string
  name: string
  /** Referência ao `Brand.id`. */
  brandId: string
  /** Referência ao `Category.id`. */
  categoryId: string
  gender: Gender
  /** Numerações disponíveis, em ordem crescente. */
  sizes: number[]
  /** Preço normal, em reais. */
  price: number
  /**
   * Preço promocional. Quando preenchido e menor que o normal, o site mostra
   * o preço antigo riscado ao lado e o novo em destaque.
   */
  promoPrice?: number
  /** Texto livre da etiqueta: "Lançamento", "Novo", "Últimas peças"… */
  badgeText?: string
  /** Cor da etiqueta. Sem valor, usa o vermelho da loja. */
  badgeColor?: BadgeColor
  availability: Availability
  description: string
  /** Diferenciais em tópicos, exibidos na página do produto. */
  highlights?: string[]
  images: ProductImage[]
  featured?: boolean
  sku?: string
  /** ISO date — usado na ordenação "Novidades". */
  createdAt?: string
}

/** Produto com marca e categoria já resolvidas, pronto para a interface. */
export interface ProductView extends Product {
  brand: Brand
  category: Category
}

export type SortOption =
  | 'relevancia'
  | 'menor-preco'
  | 'maior-preco'
  | 'novidades'
  | 'nome'

export interface CatalogQuery {
  search?: string
  categorySlugs?: string[]
  brandSlugs?: string[]
  genders?: Exclude<Gender, 'unissex'>[]
  sizes?: number[]
  availability?: Availability[]
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
  page?: number
  perPage?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface PriceRange {
  min: number
  max: number
}
