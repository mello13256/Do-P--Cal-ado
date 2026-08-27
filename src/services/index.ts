import type { CatalogService } from './catalogService'
import { staticCatalogService } from './staticCatalogService'

/**
 * PONTO ÚNICO DE TROCA DA FONTE DE DADOS.
 *
 * Hoje o catálogo vem dos arquivos em `src/data`. Para ligar o site a uma API
 * ou banco de dados no futuro, crie uma implementação de `CatalogService`
 * (ex.: `apiCatalogService`, usando `fetch`) e troque a linha abaixo:
 *
 *   export const catalogService: CatalogService = apiCatalogService
 *
 * Nenhum componente visual precisa ser alterado.
 */
export const catalogService: CatalogService = staticCatalogService

export type { CatalogService, CatalogWriteService } from './catalogService'
