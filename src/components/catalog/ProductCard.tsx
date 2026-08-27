import { Link } from 'react-router-dom'
import { genderLabels } from '../../config/site'
import { useCart } from '../../hooks/useCart'
import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'
import { formatSizeRange } from '../../lib/sizes'
import type { ProductView } from '../../types/catalog'
import { MediaPlaceholder } from '../brand/MediaPlaceholder'
import { Badge } from '../ui/Badge'
import { IconCart } from '../ui/icons'
import { assetUrl } from '../../lib/assets'

interface ProductCardProps {
  product: ProductView
  /** Prioriza o carregamento das primeiras imagens da lista. */
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart()
  const image = product.images[0]
  const inStock = product.availability === 'em-estoque'
  // Produtos com numeração exigem escolher o tamanho na página do produto.
  const canQuickAdd = inStock && product.sizes.length === 0

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative aspect-4/5 overflow-hidden bg-ink-50">
        {image?.src ? (
          <img
            src={assetUrl(image.src)}
            alt={image.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]',
              !inStock && 'opacity-70',
            )}
          />
        ) : (
          <MediaPlaceholder label={product.category.name} />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!inStock ? <Badge tone="muted">Indisponível</Badge> : null}
          {inStock && product.featured ? <Badge tone="brand">Destaque</Badge> : null}
        </div>

        {canQuickAdd ? (
          <button
            type="button"
            onClick={() => addItem(product)}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-800 shadow-md transition-all duration-200 hover:bg-brand-500 hover:text-white focus-visible:bg-brand-500 focus-visible:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <IconCart className="text-lg" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-500">
          {product.brand.name}
        </p>

        <h3 className="mt-1.5 text-[0.95rem] font-semibold leading-snug text-ink-900">
          <Link to={`/produtos/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-xs text-ink-500">
          {product.category.name} · {genderLabels[product.gender]}
        </p>

        {product.sizes.length > 0 ? (
          <p className="mt-1 text-xs text-ink-500">Numeração {formatSizeRange(product.sizes)}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="text-lg font-bold text-ink-900">{formatPrice(product.price)}</p>
          <span className="whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-wide text-brand-600 transition-colors group-hover:text-brand-700">
            Ver detalhes
          </span>
        </div>
      </div>
    </article>
  )
}
