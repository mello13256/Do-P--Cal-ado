import { useMemo } from 'react'
import { catalogService } from '../services'
import type { CatalogQuery } from '../types/catalog'
import { useAsync } from './useAsync'

export function useProducts(query: CatalogQuery) {
  const key = useMemo(() => JSON.stringify(query), [query])
  return useAsync(() => catalogService.listProducts(query), [key])
}

export function useProduct(slug: string | undefined) {
  return useAsync(
    () => (slug ? catalogService.getProductBySlug(slug) : Promise.resolve(null)),
    [slug],
  )
}

export function useFeaturedProducts(limit = 8) {
  return useAsync(() => catalogService.getFeaturedProducts(limit), [limit])
}

export function useCategories() {
  return useAsync(() => catalogService.listCategories(), [])
}

export function useBrands(onlyPartners = false) {
  return useAsync(() => catalogService.listBrands({ onlyPartners }), [onlyPartners])
}

export function usePriceRange() {
  return useAsync(() => catalogService.getPriceRange(), [])
}

export function useAvailableSizes() {
  return useAsync(() => catalogService.listAvailableSizes(), [])
}

export function useCategoryCounts() {
  return useAsync(() => catalogService.countByCategory(), [])
}
