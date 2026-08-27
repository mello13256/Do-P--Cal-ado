import { useState } from 'react'
import { cn } from '../../lib/cn'
import type { Brand } from '../../types/catalog'

interface BrandLogoProps {
  brand: Brand
  className?: string
}

/**
 * Logo de uma marca parceira.
 *
 * COMO COLOCAR OS LOGOS OFICIAIS
 * 1. Salve o arquivo em `public/brands/` (ex.: `public/brands/penalty.svg`).
 * 2. Preencha o campo `logo` da marca em `src/data/brands.ts`.
 *
 * Enquanto não houver arquivo — ou se ele falhar ao carregar — mostramos um
 * wordmark tipográfico simples, nunca uma imitação do logotipo oficial.
 */
export function BrandLogo({ brand, className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(brand.logo) && !failed

  if (showImage) {
    return (
      <img
        src={brand.logo}
        alt={`Logotipo ${brand.name}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn('max-h-10 w-auto object-contain', className)}
      />
    )
  }

  return (
    <span
      className={cn('text-lg font-bold tracking-tight sm:text-xl', className)}
      style={{ color: brand.color ?? 'var(--color-ink-800)' }}
    >
      {brand.name}
    </span>
  )
}
