import type { Product } from '../types/catalog'

/**
 * Preço que vale hoje: o promocional, quando houver, senão o normal.
 * É este valor que entra no carrinho, nos filtros e na mensagem do WhatsApp.
 */
export function precoDeVenda(produto: Pick<Product, 'price' | 'promoPrice'>): number {
  return temPromocao(produto) ? produto.promoPrice! : produto.price
}

/** `true` quando há preço promocional válido (menor que o normal). */
export function temPromocao(produto: Pick<Product, 'price' | 'promoPrice'>): boolean {
  return typeof produto.promoPrice === 'number' && produto.promoPrice > 0 && produto.promoPrice < produto.price
}

/** Desconto arredondado, para a etiqueta "-20%". */
export function descontoEmPorcento(produto: Pick<Product, 'price' | 'promoPrice'>): number {
  if (!temPromocao(produto)) return 0
  return Math.round((1 - produto.promoPrice! / produto.price) * 100)
}
