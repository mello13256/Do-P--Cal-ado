/**
 * Sinal de "o catálogo mudou".
 *
 * O painel administrativo avisa aqui depois de gravar; a interface pública
 * (hooks de `useCatalog`) escuta e refaz as consultas. Funciona tanto com o
 * Supabase quanto com o modo local.
 */
let version = 0
const listeners = new Set<() => void>()

export function getCatalogVersion(): number {
  return version
}

export function subscribeToCatalog(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Chame após qualquer gravação para que as telas recarreguem os dados. */
export function notifyCatalogChanged(): void {
  version += 1
  listeners.forEach((listener) => listener())
}
