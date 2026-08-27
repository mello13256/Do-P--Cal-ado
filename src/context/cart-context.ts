import { createContext } from 'react'
import type { ProductView } from '../types/catalog'

export interface CartItem {
  /** Chave única do item: produto + numeração. */
  id: string
  productId: string
  slug: string
  name: string
  brandName: string
  categoryName: string
  price: number
  size?: number
  quantity: number
  image?: string
  imageAlt: string
}

export interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  isOpen: boolean
  addItem: (product: ProductView, options?: { size?: number; quantity?: number }) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
