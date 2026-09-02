import { sizeRanges } from '../config/site'
import type { Gender } from '../types/catalog'

/** Gera uma lista de numerações, do menor ao maior (inclusive). */
export function sizeRange(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
}

/** Numerações praticadas pela loja para cada público. */
export function sizesForGender(gender: Exclude<Gender, 'unissex'>): number[] {
  const { min, max } = sizeRanges[gender]
  return sizeRange(min, max)
}

/** Todas as numerações praticadas pela loja, sem repetição. */
export function allSizes(): number[] {
  const set = new Set<number>([
    ...sizesForGender('infantil'),
    ...sizesForGender('feminino'),
    ...sizesForGender('masculino'),
  ])
  return [...set].sort((a, b) => a - b)
}

/**
 * Texto compacto de numeração: "33 ao 40", "40" ou "Sob consulta".
 * Quem chama é que escreve a palavra "Numeração", quando fizer sentido.
 */
export function formatSizeRange(sizes: number[]): string {
  if (sizes.length === 0) return 'Sob consulta'
  if (sizes.length === 1) return String(sizes[0])
  return `${sizes[0]} ao ${sizes[sizes.length - 1]}`
}
