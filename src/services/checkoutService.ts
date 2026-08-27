import { cartOrderMessage, whatsappLink } from '../lib/whatsapp'
import type { CartItem } from '../context/cart-context'

export interface CheckoutOrder {
  items: CartItem[]
  subtotal: number
}

export interface CheckoutResult {
  /** 'whatsapp' hoje; 'gateway' quando houver pagamento online. */
  kind: 'whatsapp' | 'gateway'
  /** Endereço para onde o cliente deve ser levado. */
  url: string
}

/**
 * Contrato de finalização de pedido.
 *
 * A loja ainda não trabalha com pagamento online, então o pedido é enviado
 * pelo WhatsApp com a lista de itens já montada. Para integrar um gateway no
 * futuro, crie outra implementação (ex.: `mercadoPagoCheckoutService`) que
 * devolva a URL de pagamento e troque a exportação no final deste arquivo —
 * o carrinho e a interface continuam iguais.
 */
export interface CheckoutService {
  submitOrder(order: CheckoutOrder): Promise<CheckoutResult>
}

export const whatsappCheckoutService: CheckoutService = {
  async submitOrder({ items, subtotal }) {
    const message = cartOrderMessage(
      items.map((item) => ({
        name: item.name,
        brand: item.brandName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
    )
    return { kind: 'whatsapp', url: whatsappLink(message) }
  },
}

export const checkoutService: CheckoutService = whatsappCheckoutService
