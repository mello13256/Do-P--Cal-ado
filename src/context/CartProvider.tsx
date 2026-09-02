import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { precoDeVenda } from '../lib/preco'
import type { ProductView } from '../types/catalog'
import { CartContext, type CartItem } from './cart-context'

const STORAGE_KEY = 'dopecalcado:carrinho:v1'
const MAX_QUANTITY = 99

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' && item !== null && 'id' in item && 'quantity' in item,
    )
  } catch {
    return []
  }
}

/**
 * Carrinho da loja.
 *
 * Hoje o pedido é fechado pelo WhatsApp (ver `src/services/checkoutService.ts`).
 * A modelagem já é a de um carrinho de e-commerce — quando houver um gateway de
 * pagamento, basta trocar a implementação de checkout; o carrinho não muda.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Armazenamento indisponível (navegação privada): o carrinho segue em memória.
    }
  }, [items])

  const addItem = useCallback<
    (product: ProductView, options?: { size?: number; quantity?: number }) => void
  >((product, options = {}) => {
    const { size, quantity = 1 } = options
    const id = size ? `${product.id}::${size}` : product.id

    setItems((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) {
        return current.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
            : item,
        )
      }
      const newItem: CartItem = {
        id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brandName: product.brand.name,
        categoryName: product.category.name,
        price: precoDeVenda(product),
        size,
        quantity: Math.min(MAX_QUANTITY, quantity),
        image: product.images[0]?.src || undefined,
        imageAlt: product.images[0]?.alt ?? product.name,
      }
      return [...current, newItem]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item,
          ),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({
      items,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      isOpen,
      addItem,
      removeItem,
      setQuantity,
      clear,
      openCart,
      closeCart,
    }),
    [items, isOpen, addItem, removeItem, setQuantity, clear, openCart, closeCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
