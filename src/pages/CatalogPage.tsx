import { useState } from 'react'
import { Seo } from '../components/Seo'
import { ActiveFilters } from '../components/catalog/ActiveFilters'
import { EmptyState } from '../components/catalog/EmptyState'
import { Pagination } from '../components/catalog/Pagination'
import { ProductFilters } from '../components/catalog/ProductFilters'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { SearchBar } from '../components/catalog/SearchBar'
import { SortSelect } from '../components/catalog/SortSelect'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Drawer } from '../components/ui/Drawer'
import { IconFilter } from '../components/ui/icons'
import {
  useAvailableSizes,
  useBrands,
  useCategories,
  usePriceRange,
  useProducts,
} from '../hooks/useCatalog'
import { useProductFilters } from '../hooks/useProductFilters'

const PER_PAGE = 12

export default function CatalogPage() {
  const { filters, query, actions, activeFilterCount, hasActiveFilters } = useProductFilters(PER_PAGE)
  const { data: result, loading } = useProducts(query)
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { data: sizes } = useAvailableSizes()
  const { data: priceBounds } = usePriceRange()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categoryList = categories ?? []
  const brandList = brands ?? []
  const selectedCategory =
    filters.categorySlugs.length === 1
      ? categoryList.find((category) => category.slug === filters.categorySlugs[0])
      : undefined

  const title = selectedCategory?.name ?? 'Produtos'
  const total = result?.total ?? 0

  const filterPanel = (
    <ProductFilters
      filters={filters}
      actions={actions}
      categories={categoryList}
      brands={brandList}
      sizes={sizes ?? []}
      priceBounds={priceBounds ?? { min: 0, max: 1000 }}
      activeFilterCount={activeFilterCount}
    />
  )

  return (
    <>
      <Seo
        title={selectedCategory ? `${selectedCategory.name}` : 'Produtos'}
        description={
          selectedCategory?.description ??
          'Catálogo da Do Pé Calçado: calçados, artigos esportivos, confecções, brinquedos e mais, com filtros por marca, público, numeração e preço.'
        }
        path="/produtos"
      />

      <div className="container-page">
        <Breadcrumbs
          items={[
            { label: 'Início', to: '/' },
            ...(selectedCategory
              ? [{ label: 'Produtos', to: '/produtos' }, { label: selectedCategory.name }]
              : [{ label: 'Produtos' }]),
          ]}
        />
      </div>

      <div className="container-page pb-16">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-600">
            {selectedCategory?.description ??
              'Use os filtros para encontrar por categoria, público, numeração, marca, disponibilidade e preço.'}
          </p>
          <p className="mt-3 text-xs text-ink-400">
            Catálogo demonstrativo: os produtos e preços abaixo são exemplos até o cadastro do
            estoque real da loja.
          </p>
        </header>

        {/* Busca do catálogo: filtra a lista ao vivo, em qualquer tamanho de tela. */}
        <div className="mb-6 max-w-xl">
          <SearchBar
            defaultValue={filters.search}
            onSearch={actions.setSearch}
            placeholder="Buscar dentro do catálogo"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[17rem_1fr] xl:gap-10">
          {/* Filtros — coluna fixa no desktop. */}
          <aside className="hidden lg:block">
            <div className="sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
              {filterPanel}
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-600" aria-live="polite">
                {loading ? 'Carregando produtos…' : (
                  <>
                    <strong className="font-semibold text-ink-900">{total}</strong>{' '}
                    {total === 1 ? 'produto encontrado' : 'produtos encontrados'}
                    {filters.search ? ` para “${filters.search}”` : ''}
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Abrir filtros"
                >
                  <IconFilter className="text-base" aria-hidden="true" />
                  Filtros
                  {activeFilterCount > 0 ? (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </Button>
                <SortSelect value={filters.sort} onChange={actions.setSort} />
              </div>
            </div>

            <div className="mb-5">
              <ActiveFilters
                filters={filters}
                categories={categoryList}
                brands={brandList}
                actions={actions}
              />
            </div>

            <ProductGrid
              products={result?.items ?? []}
              loading={loading}
              skeletonCount={PER_PAGE}
              emptyState={
                <EmptyState onClear={hasActiveFilters ? actions.clearAll : undefined} />
              }
            />

            <Pagination
              page={result?.page ?? 1}
              totalPages={result?.totalPages ?? 1}
              onChange={(page) => {
                actions.setPage(page)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        </div>
      </div>

      {/* Filtros no celular. */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        side="left"
        labelledById="filters-title"
        footer={
          <Button className="w-full" size="lg" onClick={() => setFiltersOpen(false)}>
            Ver {total} {total === 1 ? 'produto' : 'produtos'}
          </Button>
        }
      >
        {filterPanel}
      </Drawer>
    </>
  )
}
