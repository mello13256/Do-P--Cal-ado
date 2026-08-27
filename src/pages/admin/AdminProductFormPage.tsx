import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Checkbox, Field, Select, TextArea, TextInput } from '../../components/admin/AdminField'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { IconTrash } from '../../components/ui/icons'
import { availabilityLabels, genderLabels, sizeRanges } from '../../config/site'
import { useBrands, useCategories } from '../../hooks/useCatalog'
import { slugify } from '../../lib/text'
import { sizeRange } from '../../lib/sizes'
import { catalogAdminService } from '../../services'
import type { ProductInput } from '../../services/admin/adminService'
import type { Availability, Gender } from '../../types/catalog'

const emptyProduct: ProductInput = {
  slug: '',
  name: '',
  brandId: '',
  categoryId: '',
  gender: 'unissex',
  price: 0,
  availability: 'em-estoque',
  description: '',
  highlights: [],
  featured: false,
  sku: '',
  isActive: true,
  images: [],
}

/** Numerações oferecidas para cada público. */
function sizesForGender(gender: Gender): number[] {
  if (gender === 'unissex') return sizeRange(15, 47)
  const range = sizeRanges[gender]
  return sizeRange(range.min, range.max)
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()
  const { data: brands } = useBrands()
  const { data: categories } = useCategories()

  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [highlightsText, setHighlightsText] = useState('')
  const [stock, setStock] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    let active = true
    void (async () => {
      try {
        const [product, sizes] = await Promise.all([
          catalogAdminService.getProductById(id!),
          catalogAdminService.listProductSizes(id!),
        ])
        if (!active) return
        if (!product) {
          setError('Produto não encontrado.')
          return
        }
        setForm({
          slug: product.slug,
          name: product.name,
          brandId: product.brandId,
          categoryId: product.categoryId,
          gender: product.gender,
          price: product.price,
          availability: product.availability,
          description: product.description,
          highlights: product.highlights ?? [],
          featured: Boolean(product.featured),
          sku: product.sku ?? '',
          isActive: true,
          images: product.images.filter((image) => image.src).map((image) => ({
            src: image.src!,
            alt: image.alt,
          })),
        })
        setHighlightsText((product.highlights ?? []).join('\n'))
        setStock(Object.fromEntries(sizes.map((entry) => [entry.size, entry.stock])))
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Falha ao carregar o produto.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  const availableSizes = useMemo(() => sizesForGender(form.gender), [form.gender])

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleUpload(file: File) {
    setError(null)
    try {
      const { url } = await catalogAdminService.uploadImage(file, form.slug || slugify(form.name))
      update('images', [...form.images, { src: url, alt: form.name }])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao enviar a foto.')
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: ProductInput = {
      ...form,
      slug: form.slug || slugify(form.name),
      highlights: highlightsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      images: form.images.filter((image) => image.src.trim()),
    }

    try {
      const saved = isNew
        ? await catalogAdminService.createProduct(payload)
        : await catalogAdminService.updateProduct(id!, payload)

      await catalogAdminService.saveProductSizes(
        saved.id,
        Object.entries(stock)
          .map(([size, quantity]) => ({ size: Number(size), stock: quantity }))
          .filter((entry) => entry.stock > 0),
      )

      navigate('/admin/produtos')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar o produto.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-ink-500" role="status">
        Carregando produto…
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'Novo produto' : 'Editar produto'}</h1>
          <p className="mt-1 text-sm text-ink-600">
            Os campos marcados com * são obrigatórios.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/produtos" className={buttonStyles('outline', 'md')}>
            Cancelar
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar produto'}
          </Button>
        </div>
      </div>

      {error ? (
        <AdminNotice tone="error" className="mt-5">
          {error}
        </AdminNotice>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Dados principais */}
        <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-6">
          <h2 className="text-base font-bold">Informações do produto</h2>

          <Field label="Nome *">
            {(fieldId) => (
              <TextInput
                id={fieldId}
                value={form.name}
                required
                onChange={(event) => {
                  const name = event.target.value
                  setForm((current) => ({
                    ...current,
                    name,
                    slug: slugTouched ? current.slug : slugify(name),
                  }))
                }}
              />
            )}
          </Field>

          <Field
            label="Endereço na web (slug) *"
            hint={`O produto ficará em /produtos/${form.slug || 'exemplo'}`}
          >
            {(fieldId) => (
              <TextInput
                id={fieldId}
                value={form.slug}
                required
                pattern="[a-z0-9\-]+"
                onChange={(event) => {
                  setSlugTouched(true)
                  update('slug', slugify(event.target.value))
                }}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Marca *">
              {(fieldId) => (
                <Select
                  id={fieldId}
                  value={form.brandId}
                  required
                  onChange={(event) => update('brandId', event.target.value)}
                >
                  <option value="">Selecione…</option>
                  {(brands ?? []).map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Categoria *">
              {(fieldId) => (
                <Select
                  id={fieldId}
                  value={form.categoryId}
                  required
                  onChange={(event) => update('categoryId', event.target.value)}
                >
                  <option value="">Selecione…</option>
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Público *">
              {(fieldId) => (
                <Select
                  id={fieldId}
                  value={form.gender}
                  onChange={(event) => update('gender', event.target.value as Gender)}
                >
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Referência (SKU)">
              {(fieldId) => (
                <TextInput
                  id={fieldId}
                  value={form.sku ?? ''}
                  onChange={(event) => update('sku', event.target.value)}
                />
              )}
            </Field>

            <Field label="Preço (R$) *">
              {(fieldId) => (
                <TextInput
                  id={fieldId}
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(event) => update('price', Number(event.target.value))}
                />
              )}
            </Field>

            <Field label="Disponibilidade *">
              {(fieldId) => (
                <Select
                  id={fieldId}
                  value={form.availability}
                  onChange={(event) => update('availability', event.target.value as Availability)}
                >
                  {Object.entries(availabilityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field label="Descrição">
            {(fieldId) => (
              <TextArea
                id={fieldId}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Como é o produto, para que serve, do que é feito…"
              />
            )}
          </Field>

          <Field label="Diferenciais" hint="Um por linha — viram a lista com marcadores na página do produto.">
            {(fieldId) => (
              <TextArea
                id={fieldId}
                value={highlightsText}
                onChange={(event) => setHighlightsText(event.target.value)}
                placeholder={'Solado antiderrapante\nPalmilha macia'}
              />
            )}
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox
              label="Destaque"
              hint="Aparece na vitrine da página inicial."
              checked={form.featured}
              onChange={(checked) => update('featured', checked)}
            />
            <Checkbox
              label="Visível no site"
              hint="Desmarque para esconder sem excluir o cadastro."
              checked={form.isActive}
              onChange={(checked) => update('isActive', checked)}
            />
          </div>
        </section>

        <div className="space-y-6">
          {/* Estoque por numeração */}
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="text-base font-bold">Numerações e estoque</h2>
            <p className="mt-1 text-sm text-ink-500">
              Informe quantos pares há de cada numeração. Numerações com <strong>0</strong> não
              aparecem no site.
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {availableSizes.map((size) => (
                <label key={size} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-ink-600">{size}</span>
                  <input
                    type="number"
                    min="0"
                    value={stock[size] ?? 0}
                    aria-label={`Estoque da numeração ${size}`}
                    onChange={(event) =>
                      setStock((current) => ({
                        ...current,
                        [size]: Math.max(0, Number(event.target.value)),
                      }))
                    }
                    className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              ))}
            </div>

            <p className="mt-3 text-xs text-ink-500">
              Produtos sem numeração — bolas, confecções, brinquedos — podem ficar com tudo em zero.
            </p>
          </section>

          {/* Fotos */}
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="text-base font-bold">Fotos</h2>
            <p className="mt-1 text-sm text-ink-500">
              A primeira foto é a principal. Sempre descreva a imagem no campo de texto alternativo.
            </p>

            <ul className="mt-4 space-y-3">
              {form.images.map((image, index) => (
                <li key={index} className="rounded-xl border border-ink-200 p-3">
                  <div className="flex gap-3">
                    <img
                      src={image.src}
                      alt=""
                      className="h-16 w-14 shrink-0 rounded-lg border border-ink-100 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.visibility = 'hidden'
                      }}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <TextInput
                        value={image.src}
                        aria-label={`Endereço da foto ${index + 1}`}
                        placeholder="/produtos/foto.jpg"
                        onChange={(event) => {
                          const images = [...form.images]
                          images[index] = { ...images[index], src: event.target.value }
                          update('images', images)
                        }}
                      />
                      <TextInput
                        value={image.alt}
                        aria-label={`Texto alternativo da foto ${index + 1}`}
                        placeholder="Descrição da foto"
                        onChange={(event) => {
                          const images = [...form.images]
                          images[index] = { ...images[index], alt: event.target.value }
                          update('images', images)
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remover foto ${index + 1}`}
                      onClick={() =>
                        update('images', form.images.filter((_, position) => position !== index))
                      }
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update('images', [...form.images, { src: '', alt: form.name }])}
              >
                Adicionar foto por caminho
              </Button>

              {catalogAdminService.supportsUpload ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                    Enviar arquivo
                  </Button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload(file)
                      event.target.value = ''
                    }}
                  />
                </>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
