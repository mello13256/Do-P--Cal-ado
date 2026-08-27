import { Link } from 'react-router-dom'
import type { CartItem } from '../../context/cart-context'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/format'
import { MediaPlaceholder } from '../brand/MediaPlaceholder'
import { IconMinus, IconPlus, IconTrash } from '../ui/icons'

export function CartItemRow({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { setQuantity, removeItem } = useCart()

  return (
    <li className="flex gap-3 py-4">
      <Link
        to={`/produtos/${item.slug}`}
        onClick={onNavigate}
        className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <MediaPlaceholder />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/produtos/${item.slug}`}
              onClick={onNavigate}
              className="block truncate text-sm font-semibold text-ink-900 transition-colors hover:text-brand-600"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 truncate text-xs text-ink-500">
              {item.brandName}
              {item.size ? ` · Numeração ${item.size}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
            aria-label={`Remover ${item.name} do carrinho`}
          >
            <IconTrash />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-full border border-ink-200">
            <button
              type="button"
              onClick={() => setQuantity(item.id, item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              aria-label={`Diminuir quantidade de ${item.name}`}
            >
              <IconMinus />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.id, item.quantity + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              aria-label={`Aumentar quantidade de ${item.name}`}
            >
              <IconPlus />
            </button>
          </div>
          <p className="text-sm font-bold text-ink-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}
