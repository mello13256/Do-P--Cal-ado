import { availabilityLabels, genderLabels } from '../../config/site'
import type { ProductFiltersState } from '../../hooks/useProductFilters'
import { formatPrice } from '../../lib/format'
import type { Brand, Category } from '../../types/catalog'
import { IconClose } from '../ui/icons'

interface ActiveFiltersProps {
  filters: ProductFiltersState
  categories: Category[]
  brands: Brand[]
  actions: {
    toggleCategory: (slug: string) => void
    toggleBrand: (slug: string) => void
    toggleGender: (gender: 'masculino' | 'feminino' | 'infantil') => void
    toggleSize: (size: number) => void
    toggleAvailability: (value: 'em-estoque' | 'indisponivel') => void
    clearPrice: () => void
    clearAll: () => void
  }
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="flex min-h-9 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
      >
        {label}
        <IconClose className="text-sm" aria-hidden="true" />
        <span className="sr-only">Remover filtro</span>
      </button>
    </li>
  )
}

/** Resumo dos filtros aplicados, cada um removível com um toque. */
export function ActiveFilters({ filters, categories, brands, actions }: ActiveFiltersProps) {
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined
  const isEmpty =
    filters.categorySlugs.length === 0 &&
    filters.brandSlugs.length === 0 &&
    filters.genders.length === 0 &&
    filters.sizes.length === 0 &&
    filters.availability.length === 0 &&
    !hasPrice

  if (isEmpty) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap items-center gap-2">
        {filters.categorySlugs.map((slug) => (
          <Pill
            key={`categoria-${slug}`}
            label={categories.find((category) => category.slug === slug)?.name ?? slug}
            onRemove={() => actions.toggleCategory(slug)}
          />
        ))}
        {filters.brandSlugs.map((slug) => (
          <Pill
            key={`marca-${slug}`}
            label={brands.find((brand) => brand.slug === slug)?.name ?? slug}
            onRemove={() => actions.toggleBrand(slug)}
          />
        ))}
        {filters.genders.map((gender) => (
          <Pill
            key={`genero-${gender}`}
            label={genderLabels[gender]}
            onRemove={() => actions.toggleGender(gender)}
          />
        ))}
        {filters.sizes.map((size) => (
          <Pill
            key={`tamanho-${size}`}
            label={`Numeração ${size}`}
            onRemove={() => actions.toggleSize(size)}
          />
        ))}
        {filters.availability.map((value) => (
          <Pill
            key={`disp-${value}`}
            label={availabilityLabels[value]}
            onRemove={() => actions.toggleAvailability(value)}
          />
        ))}
        {hasPrice ? (
          <Pill
            label={`${filters.minPrice !== undefined ? formatPrice(filters.minPrice) : 'Até'} ${
              filters.maxPrice !== undefined
                ? `${filters.minPrice !== undefined ? '– ' : ''}${formatPrice(filters.maxPrice)}`
                : 'ou mais'
            }`}
            onRemove={actions.clearPrice}
          />
        ) : null}
      </ul>

      <button
        type="button"
        onClick={actions.clearAll}
        className="text-xs font-semibold uppercase tracking-wide text-brand-600 transition-colors hover:text-brand-700"
      >
        Limpar tudo
      </button>
    </div>
  )
}
