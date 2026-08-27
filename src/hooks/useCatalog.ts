import { useMemo, useSyncExternalStore } from 'react'
import { catalogService } from '../services'
import { getCatalogVersion, subscribeToCatalog } from '../services/catalogSignal'
import type { CatalogQuery } from '../types/catalog'
import { useAsync } from './useAsync'

/**
 * Muda sempre que o painel administrativo grava algo — as telas então refazem
 * as consultas e mostram o catálogo atualizado sem recarregar a página.
 */
function useCatalogVersion(): number {
  return useSyncExternalStore(subscribeToCatalog, getCatalogVersion, getCatalogVersion)
}

export function useProducts(query: CatalogQuery) {
  const version = useCatalogVersion()
  const key = useMemo(() => JSON.stringify(query), [query])
  return useAsync(() => catalogService.listProducts(query), [key, version])
}

export function useProduct(slug: string | undefined) {
  const version = useCatalogVersion()
  return useAsync(
    () => (slug ? catalogService.getProductBySlug(slug) : Promise.resolve(null)),
    [slug, version],
  )
}

export function useFeaturedProducts(limit = 8) {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.getFeaturedProducts(limit), [limit, version])
}

export function useCategories() {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.listCategories(), [version])
}

export function useBrands(onlyPartners = false) {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.listBrands({ onlyPartners }), [onlyPartners, version])
}

export function usePriceRange() {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.getPriceRange(), [version])
}

export function useAvailableSizes() {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.listAvailableSizes(), [version])
}

export function useCategoryCounts() {
  const version = useCatalogVersion()
  return useAsync(() => catalogService.countByCategory(), [version])
}
