import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/format'
import { checkoutService } from '../../services/checkoutService'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Drawer } from '../ui/Drawer'
import { IconCart, IconWhatsApp } from '../ui/icons'
import { CartItemRow } from './CartItemRow'

/**
 * Carrinho da loja.
 *
 * O pedido é finalizado pelo WhatsApp com a lista de itens montada
 * automaticamente (ver `src/services/checkoutService.ts`). Não há pagamento
 * online — quando houver, só a implementação do checkout muda.
 */
export function CartDrawer() {
  const { items, subtotal, totalItems, isOpen, closeCart, clear } = useCart()
  const [sending, setSending] = useState(false)

  async function handleSubmitOrder() {
    setSending(true)
    try {
      const result = await checkoutService.submitOrder({ items, subtotal })
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } finally {
      setSending(false)
    }
  }

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title={`Carrinho${totalItems > 0 ? ` (${totalItems})` : ''}`}
      labelledById="cart-title"
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">Subtotal</span>
              <span className="text-lg font-bold text-ink-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs leading-relaxed text-ink-500">
              O pedido é enviado pelo WhatsApp com os itens, as quantidades e o total. A loja
              confirma a disponibilidade e combina o pagamento e a entrega.
            </p>
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              onClick={handleSubmitOrder}
              disabled={sending}
            >
              <IconWhatsApp className="text-lg" aria-hidden="true" />
              {sending ? 'Abrindo o WhatsApp…' : 'Enviar pedido pelo WhatsApp'}
            </Button>
            <button
              type="button"
              onClick={clear}
              className="w-full py-2 text-xs font-semibold uppercase tracking-wide text-ink-500 transition-colors hover:text-brand-600"
            >
              Esvaziar carrinho
            </button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-300">
            <IconCart className="text-3xl" />
          </span>
          <div>
            <p className="text-base font-semibold text-ink-900">Seu carrinho está vazio</p>
            <p className="mt-1 text-sm text-ink-500">
              Escolha os produtos e monte seu pedido — a gente confirma tudo pelo WhatsApp.
            </p>
          </div>
          <Link to="/produtos" onClick={closeCart} className={buttonStyles('primary', 'md')}>
            Ver produtos
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} onNavigate={closeCart} />
          ))}
        </ul>
      )}
    </Drawer>
  )
}
