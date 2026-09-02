import type { BadgeColor, Brand, Category, Product, ProductImage } from '../../types/catalog'

const CORES_DE_ETIQUETA: BadgeColor[] = ['vermelho', 'preto', 'verde', 'azul', 'dourado']
import type { BrandRow, CategoryRow, ProductRow } from './types'

/** Converte as linhas do banco nos modelos usados pela interface. */

export function mapBrand(row: BrandRow): Brand & { partner: boolean } {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo_url ?? '',
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    partner: row.is_partner,
  }
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description ?? undefined,
    image: row.image_url ?? '',
    order: row.sort_order,
  }
}

export function mapProduct(row: ProductRow): Product {
  const images: ProductImage[] = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({ src: image.url, alt: image.alt || row.name }))

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandId: row.brand_id,
    categoryId: row.category_id,
    gender: row.gender,
    sizes: [...(row.sizes ?? [])].sort((a, b) => a - b),
    price: Number(row.price),
    promoPrice: row.promo_price === null ? undefined : Number(row.promo_price),
    badgeText: row.badge_text ?? undefined,
    badgeColor: CORES_DE_ETIQUETA.includes(row.badge_color as BadgeColor)
      ? (row.badge_color as BadgeColor)
      : undefined,
    availability: row.availability,
    description: row.description,
    highlights: row.highlights ?? [],
    images: images.length > 0 ? images : [{ alt: row.name }],
    featured: row.featured,
    sku: row.sku ?? undefined,
    createdAt: row.created_at,
  }
}
