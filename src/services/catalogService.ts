import type {
  Brand,
  Category,
  CatalogQuery,
  Paginated,
  PriceRange,
  Product,
  ProductView,
} from '../types/catalog'

/**
 * Contrato do catálogo.
 *
 * Todos os métodos são assíncronos de propósito: hoje a implementação lê
 * arquivos locais, amanhã pode fazer `fetch('/api/produtos')` ou consultar um
 * banco — sem que nenhum componente da interface precise mudar.
 *
 * O futuro painel administrativo deve implementar o `CatalogWriteService`
 * (abaixo) contra a mesma modelagem de dados.
 */
export interface CatalogService {
  listProducts(query?: CatalogQuery): Promise<Paginated<ProductView>>
  getProductBySlug(slug: string): Promise<ProductView | null>
  getRelatedProducts(product: ProductView, limit?: number): Promise<ProductView[]>
  getFeaturedProducts(limit?: number): Promise<ProductView[]>
  listCategories(): Promise<Category[]>
  getCategoryBySlug(slug: string): Promise<Category | null>
  listBrands(options?: { onlyPartners?: boolean }): Promise<Brand[]>
  getPriceRange(): Promise<PriceRange>
  /** Numerações que realmente existem no catálogo, em ordem crescente. */
  listAvailableSizes(): Promise<number[]>
  /** Quantidade de produtos por categoria (`categoryId` → total). */
  countByCategory(): Promise<Record<string, number>>
}

/**
 * Contrato de escrita — ainda não implementado.
 *
 * Quando o painel administrativo existir, basta criar uma implementação
 * (ex.: `ApiCatalogWriteService`) que fale com o backend. A interface pública
 * do site continua usando somente o `CatalogService` de leitura.
 */
export interface CatalogWriteService {
  createProduct(data: Omit<Product, 'id'>): Promise<Product>
  updateProduct(id: string, data: Partial<Product>): Promise<Product>
  deleteProduct(id: string): Promise<void>
  updatePrice(id: string, price: number): Promise<Product>
  updateAvailability(id: string, availability: Product['availability']): Promise<Product>
  uploadProductImage(id: string, file: File): Promise<{ src: string }>
  createBrand(data: Omit<Brand, 'id'>): Promise<Brand>
  createCategory(data: Omit<Category, 'id'>): Promise<Category>
}
