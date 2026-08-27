import { useSyncExternalStore } from 'react'
import { assinarReserva, estaEmReserva } from '../services/resilientCatalogService'

/**
 * `true` quando o site está exibindo o catálogo de reserva porque o banco não
 * respondeu. Serve para explicar a situação ao cliente em vez de mostrar uma
 * lista vazia sem motivo.
 */
export function useCatalogoEmReserva(): boolean {
  return useSyncExternalStore(assinarReserva, estaEmReserva, estaEmReserva)
}
