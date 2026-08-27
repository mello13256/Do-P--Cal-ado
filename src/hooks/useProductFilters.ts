import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Availability, CatalogQuery, Gender, SortOption } from '../types/catalog'

export type FilterGender = Exclude<Gender, 'unissex'>

/** Nomes dos parâmetros na URL — links compartilháveis e legíveis. */
const PARAM = {
  search: 'q',
  category: 'categoria',
  brand: 'marca',
  gender: 'genero',
  size: 'tamanho',
  availability: 'disponibilidade',
  minPrice: 'preco_min',
  maxPrice: 'preco_max',
  sort: 'ordem',
  page: 'pagina',
} as const

const SORT_OPTIONS: SortOption[] = [
  'relevancia',
  'menor-preco',
  'maior-preco',
  'novidades',
  'nome',
]

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key)
  if (!raw) return []
  return raw.split(',').map((value) => value.trim()).filter(Boolean)
}

function readNumber(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key)
  if (raw === null) return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

export interface ProductFiltersState {
  search: string
  categorySlugs: string[]
  brandSlugs: string[]
  genders: FilterGender[]
  sizes: number[]
  availability: Availability[]
  minPrice?: number
  maxPrice?: number
  sort: SortOption
  page: number
}

/**
 * Estado dos filtros do catálogo guardado na URL.
 *
 * Manter na URL traz três benefícios: o usuário pode compartilhar o link já
 * filtrado, o botão "voltar" do navegador funciona e a página pode ser
 * carregada direto com filtros aplicados (ex.: vindo dos cards de categoria).
 */
export function useProductFilters(perPage = 12) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<ProductFiltersState>(() => {
    const sortParam = searchParams.get(PARAM.sort) as SortOption | null
    return {
      search: searchParams.get(PARAM.search) ?? '',
      categorySlugs: readList(searchParams, PARAM.category),
      brandSlugs: readList(searchParams, PARAM.brand),
      genders: readList(searchParams, PARAM.gender).filter((value): value is FilterGender =>
        ['masculino', 'feminino', 'infantil'].includes(value),
      ),
      sizes: readList(searchParams, PARAM.size)
        .map(Number)
        .filter((size) => Number.isFinite(size)),
      availability: readList(searchParams, PARAM.availability).filter(
        (value): value is Availability => value === 'em-estoque' || value === 'indisponivel',
      ),
      minPrice: readNumber(searchParams, PARAM.minPrice),
      maxPrice: readNumber(searchParams, PARAM.maxPrice),
      sort: sortParam && SORT_OPTIONS.includes(sortParam) ? sortParam : 'relevancia',
      page: Math.max(1, readNumber(searchParams, PARAM.page) ?? 1),
    }
  }, [searchParams])

  const query = useMemo<CatalogQuery>(
    () => ({
      search: filters.search || undefined,
      categorySlugs: filters.categorySlugs,
      brandSlugs: filters.brandSlugs,
      genders: filters.genders,
      sizes: filters.sizes,
      availability: filters.availability,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: filters.page,
      perPage,
    }),
    [filters, perPage],
  )

  /** Atualiza parâmetros; qualquer mudança de filtro volta para a página 1. */
  const update = useCallback(
    (changes: Record<string, string | number | string[] | number[] | undefined>, keepPage = false) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          Object.entries(changes).forEach(([key, value]) => {
            const isEmptyList = Array.isArray(value) && value.length === 0
            if (value === undefined || value === '' || isEmptyList) {
              next.delete(key)
            } else if (Array.isArray(value)) {
              next.set(key, value.join(','))
            } else {
              next.set(key, String(value))
            }
          })
          if (!keepPage) next.delete(PARAM.page)
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  const toggleInList = useCallback(
    <T extends string | number>(key: string, list: T[], value: T) => {
      const exists = list.includes(value)
      const nextList = exists ? list.filter((item) => item !== value) : [...list, value]
      update({ [key]: nextList as string[] | number[] })
    },
    [update],
  )

  const actions = useMemo(
    () => ({
      setSearch: (value: string) => update({ [PARAM.search]: value }),
      toggleCategory: (slug: string) =>
        toggleInList(PARAM.category, filters.categorySlugs, slug),
      toggleBrand: (slug: string) => toggleInList(PARAM.brand, filters.brandSlugs, slug),
      toggleGender: (gender: FilterGender) =>
        toggleInList(PARAM.gender, filters.genders, gender),
      toggleSize: (size: number) => toggleInList(PARAM.size, filters.sizes, size),
      toggleAvailability: (value: Availability) =>
        toggleInList(PARAM.availability, filters.availability, value),
      setPriceRange: (min?: number, max?: number) =>
        update({ [PARAM.minPrice]: min, [PARAM.maxPrice]: max }),
      setSort: (sort: SortOption) => update({ [PARAM.sort]: sort }),
      setPage: (page: number) => update({ [PARAM.page]: page }, true),
      setCategories: (slugs: string[]) => update({ [PARAM.category]: slugs }),
      clearAll: () => setSearchParams(new URLSearchParams(), { replace: true }),
      clearPrice: () => update({ [PARAM.minPrice]: undefined, [PARAM.maxPrice]: undefined }),
    }),
    [filters, setSearchParams, toggleInList, update],
  )

  const activeFilterCount =
    filters.categorySlugs.length +
    filters.brandSlugs.length +
    filters.genders.length +
    filters.sizes.length +
    filters.availability.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0)

  return {
    filters,
    query,
    actions,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0 || filters.search.length > 0,
  }
}
