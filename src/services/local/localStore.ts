import { brands as seedBrands, type BrandRecord } from '../../data/brands'
import { categories as seedCategories } from '../../data/categories'
import { products as seedProducts } from '../../data/products'
import type { Category, Product } from '../../types/catalog'
import { notifyCatalogChanged } from '../catalogSignal'

/**
 * Catálogo em memória, usado quando o Supabase ainda não está configurado.
 *
 * Começa com os dados de `src/data` e guarda as alterações feitas no painel
 * administrativo no `localStorage` do navegador — assim dá para experimentar o
 * painel inteiro antes de ligar o banco. Nada disso é compartilhado entre
 * dispositivos: é um modo de demonstração.
 */
export interface CatalogSnapshot {
  products: Product[]
  categories: Category[]
  brands: BrandRecord[]
}

const STORAGE_KEY = 'dopecalcado:catalogo-local:v1'

function seed(): CatalogSnapshot {
  return {
    products: structuredClone(seedProducts),
    categories: structuredClone(seedCategories),
    brands: structuredClone(seedBrands),
  }
}

function load(): CatalogSnapshot {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as Partial<CatalogSnapshot>
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.categories) || !Array.isArray(parsed.brands)) {
      return seed()
    }
    return parsed as CatalogSnapshot
  } catch {
    return seed()
  }
}

let snapshot: CatalogSnapshot = load()

// Alteração feita em outra aba do mesmo navegador: recarrega e avisa a interface.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    snapshot = load()
    notifyCatalogChanged()
  })
}

export function getSnapshot(): CatalogSnapshot {
  return snapshot
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Sem armazenamento disponível: as alterações valem só nesta sessão.
  }
}

/** Aplica uma alteração ao catálogo local e avisa a interface. */
export function updateSnapshot(mutate: (current: CatalogSnapshot) => CatalogSnapshot): void {
  snapshot = mutate(snapshot)
  persist()
  notifyCatalogChanged()
}

/** Descarta as alterações locais e volta aos dados de `src/data`. */
export function resetLocalCatalog(): void {
  snapshot = seed()
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignora
  }
  notifyCatalogChanged()
}

/** `true` quando o catálogo local já foi alterado pelo painel. */
export function hasLocalChanges(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}
