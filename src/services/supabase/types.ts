/** Linhas das tabelas do banco, exatamente como o Supabase devolve. */

export interface BrandRow {
  id: string
  slug: string
  name: string
  logo_url: string | null
  color: string | null
  description: string | null
  is_partner: boolean
  sort_order: number
}

export interface CategoryRow {
  id: string
  slug: string
  name: string
  tagline: string
  description: string | null
  image_url: string | null
  sort_order: number
}

export interface ProductImageRow {
  id: string
  product_id: string
  url: string
  alt: string
  sort_order: number
}

export interface ProductSizeRow {
  product_id: string
  size: number
  stock: number
}

export interface ProductRow {
  id: string
  slug: string
  name: string
  brand_id: string
  category_id: string
  gender: 'masculino' | 'feminino' | 'infantil' | 'unissex'
  price: number | string
  promo_price: number | string | null
  /** Coluna calculada no banco: promo_price quando existe, senão price. */
  effective_price?: number | string | null
  badge_text: string | null
  badge_color: string | null
  availability: 'em-estoque' | 'indisponivel'
  description: string
  highlights: string[] | null
  sizes: number[] | null
  featured: boolean
  sku: string | null
  is_active: boolean
  created_at: string
  product_images?: ProductImageRow[] | null
}
