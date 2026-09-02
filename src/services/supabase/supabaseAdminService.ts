import { slugify } from '../../lib/text'
import type { Availability, Brand, Category, ProductView } from '../../types/catalog'
import { notifyCatalogChanged } from '../catalogSignal'
import type {
  BrandInput,
  CatalogAdminService,
  CategoryInput,
  ProductInput,
  SizeStock,
} from '../admin/adminService'
import { requireSupabase } from './client'
import { mapBrand, mapCategory, mapProduct } from './mappers'
import type { BrandRow, CategoryRow, ProductRow, ProductSizeRow } from './types'

const PRODUCT_SELECT =
  'id, slug, name, brand_id, category_id, gender, price, promo_price, effective_price, badge_text, badge_color, availability, description, highlights, sizes, featured, sku, is_active, created_at, product_images(id, product_id, url, alt, sort_order)'

const BUCKET = 'catalogo'

function toRow(input: ProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    brand_id: input.brandId,
    category_id: input.categoryId,
    gender: input.gender,
    price: input.price,
    promo_price: input.promoPrice ?? null,
    badge_text: input.badgeText?.trim() || null,
    badge_color: input.badgeText?.trim() ? (input.badgeColor ?? 'vermelho') : null,
    availability: input.availability,
    description: input.description,
    highlights: input.highlights,
    featured: input.featured,
    sku: input.sku || null,
    is_active: input.isActive,
  }
}

/** Regrava a lista de fotos do produto (a ordem do formulário é preservada). */
async function replaceImages(productId: string, images: ProductInput['images']) {
  const client = requireSupabase()
  const { error: deleteError } = await client
    .from('product_images')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError

  const rows = images
    .filter((image) => image.src.trim())
    .map((image, index) => ({
      product_id: productId,
      url: image.src.trim(),
      alt: image.alt.trim(),
      sort_order: index + 1,
    }))

  if (rows.length === 0) return
  const { error } = await client.from('product_images').insert(rows)
  if (error) throw error
}

/**
 * Escrita do catálogo no Supabase.
 *
 * Só funciona para quem estiver cadastrado em `public.admins` — as políticas de
 * Row Level Security recusam qualquer gravação de outros usuários, mesmo que
 * alguém use a chave pública do site.
 */
export const supabaseAdminService: CatalogAdminService = {
  supportsUpload: true,

  async listAllProducts(search) {
    const client = requireSupabase()
    const [brandsResult, categoriesResult] = await Promise.all([
      client.from('brands').select('*').order('sort_order'),
      client.from('categories').select('*').order('sort_order'),
    ])
    if (brandsResult.error) throw brandsResult.error
    if (categoriesResult.error) throw categoriesResult.error

    const brands = (brandsResult.data as BrandRow[]).map(mapBrand)
    const categories = (categoriesResult.data as CategoryRow[]).map(mapCategory)

    let request = client.from('products').select(PRODUCT_SELECT).order('name')
    const term = (search ?? '').trim()
    if (term) request = request.or(`name.ilike.*${term}*,sku.ilike.*${term}*,slug.ilike.*${term}*`)

    const { data, error } = await request
    if (error) throw error

    const brandById = new Map(brands.map((brand) => [brand.id, brand]))
    const categoryById = new Map(categories.map((category) => [category.id, category]))

    return (data as ProductRow[])
      .map((row) => {
        const brand = brandById.get(row.brand_id)
        const category = categoryById.get(row.category_id)
        if (!brand || !category) return null
        return { ...mapProduct(row), brand, category } as ProductView
      })
      .filter((item): item is ProductView => item !== null)
  },

  async getProductById(id) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapProduct(data as ProductRow) : null
  },

  async createProduct(input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('products')
      .insert({ ...toRow(input), slug: input.slug || slugify(input.name) })
      .select(PRODUCT_SELECT)
      .single()
    if (error) throw error

    await replaceImages((data as ProductRow).id, input.images)
    notifyCatalogChanged()
    return mapProduct(data as ProductRow)
  },

  async updateProduct(id, input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('products')
      .update(toRow(input))
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()
    if (error) throw error

    await replaceImages(id, input.images)
    notifyCatalogChanged()
    return mapProduct(data as ProductRow)
  },

  async deleteProduct(id) {
    const client = requireSupabase()
    const { error } = await client.from('products').delete().eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },

  async updatePrice(id, price) {
    const client = requireSupabase()
    const { error } = await client.from('products').update({ price }).eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },

  async updateAvailability(id, availability: Availability) {
    const client = requireSupabase()
    const { error } = await client.from('products').update({ availability }).eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },

  async setProductActive(id, isActive) {
    const client = requireSupabase()
    const { error } = await client.from('products').update({ is_active: isActive }).eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },

  async listProductSizes(productId) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('product_sizes')
      .select('product_id, size, stock')
      .eq('product_id', productId)
      .order('size')
    if (error) throw error
    return (data as ProductSizeRow[]).map((row) => ({ size: row.size, stock: row.stock }))
  },

  async saveProductSizes(productId, sizes: SizeStock[]) {
    const client = requireSupabase()

    // Remove as numerações que saíram da lista…
    const keep = sizes.map((entry) => entry.size)
    let deletion = client.from('product_sizes').delete().eq('product_id', productId)
    if (keep.length > 0) deletion = deletion.not('size', 'in', `(${keep.join(',')})`)
    const { error: deleteError } = await deletion
    if (deleteError) throw deleteError

    // …e grava as atuais. O gatilho do banco atualiza `products.sizes`.
    if (sizes.length > 0) {
      const { error } = await client.from('product_sizes').upsert(
        sizes.map((entry) => ({
          product_id: productId,
          size: entry.size,
          stock: entry.stock,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'product_id,size' },
      )
      if (error) throw error
    }
    notifyCatalogChanged()
  },

  async uploadImage(file, productSlug) {
    const client = requireSupabase()
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `produtos/${productSlug || 'sem-slug'}/${Date.now()}.${extension}`

    const { error } = await client.storage.from(BUCKET).upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (error) throw error

    const { data } = client.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl }
  },

  async createBrand(input: BrandInput): Promise<Brand> {
    const client = requireSupabase()
    const { data, error } = await client
      .from('brands')
      .insert({
        slug: input.slug || slugify(input.name),
        name: input.name,
        logo_url: input.logo || null,
        color: input.color || null,
        description: input.description || null,
        is_partner: input.partner,
      })
      .select('*')
      .single()
    if (error) throw error
    notifyCatalogChanged()
    return mapBrand(data as BrandRow)
  },

  async updateBrand(id, input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('brands')
      .update({
        slug: input.slug,
        name: input.name,
        logo_url: input.logo || null,
        color: input.color || null,
        description: input.description || null,
        is_partner: input.partner,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    notifyCatalogChanged()
    return mapBrand(data as BrandRow)
  },

  async deleteBrand(id) {
    const client = requireSupabase()
    const { error } = await client.from('brands').delete().eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const client = requireSupabase()
    const { data, error } = await client
      .from('categories')
      .insert({
        slug: input.slug || slugify(input.name),
        name: input.name,
        tagline: input.tagline,
        description: input.description || null,
        image_url: input.image || null,
        sort_order: input.order ?? 99,
      })
      .select('*')
      .single()
    if (error) throw error
    notifyCatalogChanged()
    return mapCategory(data as CategoryRow)
  },

  async updateCategory(id, input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('categories')
      .update({
        slug: input.slug,
        name: input.name,
        tagline: input.tagline,
        description: input.description || null,
        image_url: input.image || null,
        sort_order: input.order ?? 99,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    notifyCatalogChanged()
    return mapCategory(data as CategoryRow)
  },

  async deleteCategory(id) {
    const client = requireSupabase()
    const { error } = await client.from('categories').delete().eq('id', id)
    if (error) throw error
    notifyCatalogChanged()
  },
}
