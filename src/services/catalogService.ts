import type {
  Brand,
  Category,
  CatalogQuery,
  Paginated,
  PriceRange,
  ProductView,
} from '../types/catalog'

/**
 * Contrato do catálogo.
 *
 * Todos os métodos são assíncronos de propósito: hoje a implementação lê
 * arquivos locais, amanhã pode fazer `fetch('/api/produtos')` ou consultar um
 * banco — sem que nenhum componente da interface precise mudar.

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

// O contrato de ESCRITA (usado pelo painel administrativo) fica em
// `src/services/admin/adminService.ts`, com implementações para o Supabase e
// para o modo local.
