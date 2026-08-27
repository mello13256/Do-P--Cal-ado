import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Select, TextInput } from '../../components/admin/AdminField'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { IconSearch, IconTrash } from '../../components/ui/icons'
import { availabilityLabels } from '../../config/site'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { formatPrice } from '../../lib/format'
import { formatSizeRange } from '../../lib/sizes'
import { catalogAdminService } from '../../services'
import type { Availability, ProductView } from '../../types/catalog'

/** Lista de produtos do painel, com edição rápida de preço e disponibilidade. */
export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [products, setProducts] = useState<ProductView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const load = useCallback(async (term: string) => {
    setLoading(true)
    try {
      setProducts(await catalogAdminService.listAllProducts(term))
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar os produtos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(debouncedSearch)
  }, [debouncedSearch, load])

  async function run(action: () => Promise<void>, message: string) {
    try {
      await action()
      setFeedback(message)
      await load(debouncedSearch)
      window.setTimeout(() => setFeedback(null), 2500)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.')
    }
  }

  async function handleDelete(product: ProductView) {
    const confirmed = window.confirm(
      `Excluir "${product.name}"? Essa ação não pode ser desfeita.\n\nSe quiser apenas tirar do site, mude a disponibilidade para "Indisponível".`,
    )
    if (!confirmed) return
    await run(() => catalogAdminService.deleteProduct(product.id), 'Produto excluído.')
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="mt-1 text-sm text-ink-600">
            {loading ? 'Carregando…' : `${products.length} ${products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}`}
          </p>
        </div>
        <Link to="/admin/produtos/novo" className={buttonStyles('primary', 'md')}>
          Novo produto
        </Link>
      </div>

      <div className="relative mt-6 max-w-md">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-ink-400" />
        <TextInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, referência ou slug"
          className="pl-11"
          aria-label="Buscar produtos"
        />
      </div>

      {error ? (
        <AdminNotice tone="error" className="mt-4">
          {error}
        </AdminNotice>
      ) : null}
      {feedback ? (
        <AdminNotice tone="success" className="mt-4">
          {feedback}
        </AdminNotice>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-200 bg-white">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">Produtos cadastrados</caption>
          <thead className="border-b border-ink-200 bg-ink-50 text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Produto</th>
              <th scope="col" className="px-4 py-3 font-semibold">Marca</th>
              <th scope="col" className="px-4 py-3 font-semibold">Categoria</th>
              <th scope="col" className="px-4 py-3 font-semibold">Numeração</th>
              <th scope="col" className="px-4 py-3 font-semibold">Preço</th>
              <th scope="col" className="px-4 py-3 font-semibold">Disponibilidade</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/produtos/${product.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-brand-600"
                  >
                    {product.name}
                  </Link>
                  {product.sku ? (
                    <span className="ml-2 text-xs text-ink-400">{product.sku}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-ink-600">{product.brand.name}</td>
                <td className="px-4 py-3 text-ink-600">{product.category.name}</td>
                <td className="px-4 py-3 text-ink-600">{formatSizeRange(product.sizes)}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`preco-${product.id}`}>
                    Preço de {product.name}
                  </label>
                  <input
                    id={`preco-${product.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product.price}
                    onBlur={(event) => {
                      const value = Number(event.target.value)
                      if (Number.isFinite(value) && value !== product.price) {
                        void run(
                          () => catalogAdminService.updatePrice(product.id, value),
                          `Preço de ${product.name} atualizado para ${formatPrice(value)}.`,
                        )
                      }
                    }}
                    className="w-28 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`disp-${product.id}`}>
                    Disponibilidade de {product.name}
                  </label>
                  <Select
                    id={`disp-${product.id}`}
                    value={product.availability}
                    onChange={(event) =>
                      void run(
                        () =>
                          catalogAdminService.updateAvailability(
                            product.id,
                            event.target.value as Availability,
                          ),
                        `${product.name}: ${availabilityLabels[event.target.value as Availability]}.`,
                      )
                    }
                    className="w-44 py-1.5"
                  >
                    {Object.entries(availabilityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/produtos/${product.id}`}
                      className={buttonStyles('outline', 'sm')}
                    >
                      Editar
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDelete(product)}
                      aria-label={`Excluir ${product.name}`}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  )
}
