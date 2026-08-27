import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { ProductGallery } from '../components/product/ProductGallery'
import { SizePicker } from '../components/product/SizePicker'
import { Badge } from '../components/ui/Badge'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Section, SectionHeader } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import { IconCart, IconCheck, IconWhatsApp } from '../components/ui/icons'
import { genderLabels } from '../config/site'
import { useCart } from '../hooks/useCart'
import { useAsync } from '../hooks/useAsync'
import { useProduct } from '../hooks/useCatalog'
import { formatPrice } from '../lib/format'
import { formatSizeRange } from '../lib/sizes'
import { productInterestMessage, whatsappLink } from '../lib/whatsapp'
import { catalogService } from '../services'
import NotFoundPage from './NotFoundPage'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, loading } = useProduct(slug)
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<number | undefined>()
  const [sizeError, setSizeError] = useState(false)

  const { data: related } = useAsync(
    () => (product ? catalogService.getRelatedProducts(product, 4) : Promise.resolve([])),
    [product?.id],
  )

  useEffect(() => {
    setSelectedSize(undefined)
    setSizeError(false)
  }, [slug])

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-4/5 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <NotFoundPage />

  const inStock = product.availability === 'em-estoque'
  const needsSize = product.sizes.length > 0

  function handleAddToCart() {
    if (!product) return
    if (needsSize && !selectedSize) {
      setSizeError(true)
      return
    }
    setSizeError(false)
    addItem(product, { size: selectedSize })
  }

  return (
    <>
      <Seo
        title={product.name}
        description={`${product.name} — ${product.brand.name}. ${product.description}`}
        path={`/produtos/${product.slug}`}
        image={product.images[0]?.src}
      />

      <div className="container-page">
        <Breadcrumbs
          items={[
            { label: 'Início', to: '/' },
            { label: 'Produtos', to: '/produtos' },
            { label: product.category.name, to: `/produtos?categoria=${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-page pb-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            images={product.images}
            productName={product.name}
            categoryName={product.category.name}
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/produtos?marca=${product.brand.slug}`}
                className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500 transition-colors hover:text-brand-600"
              >
                {product.brand.name}
              </Link>
              {inStock ? (
                <Badge tone="success">
                  <IconCheck className="text-sm" aria-hidden="true" />
                  Em estoque
                </Badge>
              ) : (
                <Badge tone="muted">Indisponível</Badge>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>

            <p className="mt-2 text-sm text-ink-500">
              <Link
                to={`/produtos?categoria=${product.category.slug}`}
                className="transition-colors hover:text-brand-600"
              >
                {product.category.name}
              </Link>
              {' · '}
              {genderLabels[product.gender]}
              {product.sku ? ` · Ref. ${product.sku}` : ''}
            </p>

            <p className="mt-5 text-3xl font-bold text-ink-900">{formatPrice(product.price)}</p>

            {needsSize ? (
              <div className="mt-7">
                <SizePicker
                  sizes={product.sizes}
                  value={selectedSize}
                  onChange={(size) => {
                    setSelectedSize(size)
                    setSizeError(false)
                  }}
                  error={sizeError}
                  disabled={!inStock}
                />
                <p className="mt-2 text-xs text-ink-500">
                  Numeração disponível: {formatSizeRange(product.sizes)}.
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={whatsappLink(productInterestMessage(product.name, selectedSize))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles('whatsapp', 'lg', 'w-full')}
              >
                <IconWhatsApp className="text-lg" aria-hidden="true" />
                Tenho interesse
              </a>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <IconCart className="text-lg" aria-hidden="true" />
                {inStock ? 'Adicionar ao carrinho' : 'Produto indisponível'}
              </Button>

              <p className="text-xs leading-relaxed text-ink-500">
                O pedido é fechado pelo WhatsApp: a loja confirma a disponibilidade, o pagamento e a
                retirada ou entrega. Não há pagamento online.
              </p>
            </div>

            <div className="mt-8 border-t border-ink-100 pt-6">
              <h2 className="text-sm font-bold text-ink-900">Descrição</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-600">
                {product.description}
              </p>

              {product.highlights && product.highlights.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-sm text-ink-600">
                      <IconCheck className="mt-0.5 shrink-0 text-base text-brand-500" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-ink-500">Marca</dt>
                  <dd className="font-medium text-ink-900">{product.brand.name}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Categoria</dt>
                  <dd className="font-medium text-ink-900">{product.category.name}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Público</dt>
                  <dd className="font-medium text-ink-900">{genderLabels[product.gender]}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Numeração</dt>
                  <dd className="font-medium text-ink-900">{formatSizeRange(product.sizes)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {related && related.length > 0 ? (
        <Section muted>
          <SectionHeader title="Você também pode gostar" eyebrow="Sugestões" />
          <ProductGrid products={related} />
        </Section>
      ) : null}
    </>
  )
}
