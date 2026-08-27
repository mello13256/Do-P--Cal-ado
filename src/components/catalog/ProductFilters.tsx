import { availabilityLabels, genderLabels, sizeRanges } from '../../config/site'
import type { ProductFiltersState, FilterGender } from '../../hooks/useProductFilters'
import { cn } from '../../lib/cn'
import type { Availability, Brand, Category, PriceRange } from '../../types/catalog'
import { PriceRangeFilter } from './PriceRangeFilter'

interface FilterActions {
  toggleCategory: (slug: string) => void
  toggleBrand: (slug: string) => void
  toggleGender: (gender: FilterGender) => void
  toggleSize: (size: number) => void
  toggleAvailability: (value: Availability) => void
  setPriceRange: (min?: number, max?: number) => void
  clearAll: () => void
}

interface ProductFiltersProps {
  filters: ProductFiltersState
  actions: FilterActions
  categories: Category[]
  brands: Brand[]
  sizes: number[]
  priceBounds: PriceRange
  activeFilterCount: number
}

const genders: FilterGender[] = ['masculino', 'feminino', 'infantil']
const availabilities: Availability[] = ['em-estoque', 'indisponivel']

function FilterGroup({
  title,
  children,
  description,
}: {
  title: string
  children: React.ReactNode
  description?: string
}) {
  return (
    <fieldset className="border-t border-ink-100 py-5 first:border-t-0 first:pt-0">
      <legend className="text-sm font-bold text-ink-900">{title}</legend>
      {description ? <p className="mt-1 text-xs text-ink-500">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink-700 transition-colors hover:text-ink-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-ink-300 text-brand-500 accent-brand-500"
      />
      {label}
    </label>
  )
}

function Chip({
  label,
  active,
  onClick,
  ariaLabel,
}: {
  label: string
  active: boolean
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        'min-h-9 rounded-full border px-3.5 text-sm font-medium transition-all duration-200',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
      )}
    >
      {label}
    </button>
  )
}

/**
 * Painel de filtros do catálogo — usado na coluna lateral no desktop e dentro
 * de um drawer no celular. Todos os filtros são funcionais e ficam refletidos
 * na URL.
 */
export function ProductFilters({
  filters,
  actions,
  categories,
  brands,
  sizes,
  priceBounds,
  activeFilterCount,
}: ProductFiltersProps) {
  // Ao escolher um público, mostramos apenas as numerações daquele público.
  const visibleSizes =
    filters.genders.length > 0
      ? sizes.filter((size) =>
          filters.genders.some(
            (gender) => size >= sizeRanges[gender].min && size <= sizeRanges[gender].max,
          ),
        )
      : sizes

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-bold text-ink-900">Filtros</h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={actions.clearAll}
            className="text-xs font-semibold uppercase tracking-wide text-brand-600 transition-colors hover:text-brand-700"
          >
            Limpar tudo
          </button>
        ) : null}
      </div>

      <FilterGroup title="Categoria">
        <div className="max-h-64 overflow-y-auto pr-1">
          {categories.map((category) => (
            <CheckboxRow
              key={category.id}
              label={category.name}
              checked={filters.categorySlugs.includes(category.slug)}
              onChange={() => actions.toggleCategory(category.slug)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Público">
        <div className="flex flex-wrap gap-2">
          {genders.map((gender) => (
            <Chip
              key={gender}
              label={genderLabels[gender]}
              active={filters.genders.includes(gender)}
              onClick={() => actions.toggleGender(gender)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        title="Numeração"
        description={
          filters.genders.length > 0
            ? filters.genders
                .map((gender) => `${genderLabels[gender]}: ${sizeRanges[gender].min} ao ${sizeRanges[gender].max}`)
                .join(' · ')
            : 'Masculinos 33 ao 47 · Femininos 33 ao 40 · Infantis 15 ao 32'
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {visibleSizes.map((size) => (
            <Chip
              key={size}
              label={String(size)}
              ariaLabel={`Numeração ${size}`}
              active={filters.sizes.includes(size)}
              onClick={() => actions.toggleSize(size)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Marca">
        <div className="max-h-64 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <CheckboxRow
              key={brand.id}
              label={brand.name}
              checked={filters.brandSlugs.includes(brand.slug)}
              onChange={() => actions.toggleBrand(brand.slug)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Disponibilidade">
        {availabilities.map((value) => (
          <CheckboxRow
            key={value}
            label={availabilityLabels[value]}
            checked={filters.availability.includes(value)}
            onChange={() => actions.toggleAvailability(value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Preço">
        <PriceRangeFilter
          bounds={priceBounds}
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={actions.setPriceRange}
        />
      </FilterGroup>
    </div>
  )
}
