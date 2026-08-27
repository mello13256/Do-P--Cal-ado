import { siteConfig } from '../config/site'
import { formatPrice } from './format'

export interface WhatsAppOrderLine {
  name: string
  brand?: string
  size?: number
  quantity: number
  price: number
}

/** Monta o link wa.me com a mensagem já preenchida. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.contact.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Mensagem genérica do botão "Fale conosco". */
export function generalContactMessage(): string {
  return `Olá! Vim pelo site da ${siteConfig.name} e gostaria de mais informações.`
}

/** Mensagem do botão "Tenho interesse" na página do produto. */
export function productInterestMessage(productName: string, size?: number): string {
  const sizePart = size ? ` na numeração ${size}` : ''
  return `Olá! Tenho interesse no produto ${productName}${sizePart}. Gostaria de saber mais informações e a disponibilidade.`
}

/** Mensagem do carrinho: itens, quantidades, valores e total. */
export function cartOrderMessage(lines: WhatsAppOrderLine[], total: number): string {
  const items = lines
    .map((line, index) => {
      const details = [line.brand, line.size ? `numeração ${line.size}` : null]
        .filter(Boolean)
        .join(' · ')
      const subtotal = formatPrice(line.price * line.quantity)
      return [
        `${index + 1}. ${line.name}`,
        details ? `   ${details}` : null,
        `   ${line.quantity} × ${formatPrice(line.price)} = ${subtotal}`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return [
    `Olá! Gostaria de fazer um pedido na ${siteConfig.name}:`,
    '',
    items,
    '',
    `Total: ${formatPrice(total)}`,
    '',
    'Pode confirmar a disponibilidade e as formas de pagamento, por favor?',
  ].join('\n')
}
