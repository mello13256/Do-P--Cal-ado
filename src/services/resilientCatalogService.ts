import type { CatalogService } from './catalogService'

/**
 * Rede de segurança do catálogo.
 *
 * Toda leitura tenta primeiro o banco. Se der erro — internet fora, banco em
 * manutenção, projeto pausado —, o site cai no catálogo local de `src/data`
 * em vez de aparecer vazio para o cliente. O aviso fica no console do
 * navegador para quem for investigar.
 */
export function comReserva(principal: CatalogService, reserva: CatalogService): CatalogService {
  async function tentar<T>(
    operacao: string,
    doBanco: () => Promise<T>,
    doLocal: () => Promise<T>,
  ): Promise<T> {
    try {
      return await doBanco()
    } catch (erro) {
      console.warn(
        `[catálogo] falha ao consultar o banco em "${operacao}" — usando o catálogo local.`,
        erro,
      )
      return doLocal()
    }
  }

  return {
    listProducts: (query) =>
      tentar('listProducts', () => principal.listProducts(query), () => reserva.listProducts(query)),
    getProductBySlug: (slug) =>
      tentar('getProductBySlug', () => principal.getProductBySlug(slug), () => reserva.getProductBySlug(slug)),
    getRelatedProducts: (produto, limite) =>
      tentar('getRelatedProducts', () => principal.getRelatedProducts(produto, limite), () => reserva.getRelatedProducts(produto, limite)),
    getFeaturedProducts: (limite) =>
      tentar('getFeaturedProducts', () => principal.getFeaturedProducts(limite), () => reserva.getFeaturedProducts(limite)),
    listCategories: () =>
      tentar('listCategories', () => principal.listCategories(), () => reserva.listCategories()),
    getCategoryBySlug: (slug) =>
      tentar('getCategoryBySlug', () => principal.getCategoryBySlug(slug), () => reserva.getCategoryBySlug(slug)),
    listBrands: (opcoes) =>
      tentar('listBrands', () => principal.listBrands(opcoes), () => reserva.listBrands(opcoes)),
    getPriceRange: () =>
      tentar('getPriceRange', () => principal.getPriceRange(), () => reserva.getPriceRange()),
    listAvailableSizes: () =>
      tentar('listAvailableSizes', () => principal.listAvailableSizes(), () => reserva.listAvailableSizes()),
    countByCategory: () =>
      tentar('countByCategory', () => principal.countByCategory(), () => reserva.countByCategory()),
  }
}
