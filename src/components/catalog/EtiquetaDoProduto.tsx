import { cn } from '../../lib/cn'
import type { BadgeColor } from '../../types/catalog'

/** Paleta das etiquetas — pensada para ler bem sobre a foto do produto. */
const CORES: Record<BadgeColor, string> = {
  vermelho: 'bg-brand-500 text-white',
  preto: 'bg-ink-900 text-white',
  verde: 'bg-emerald-600 text-white',
  azul: 'bg-blue-700 text-white',
  dourado: 'bg-amber-500 text-ink-900',
}

export const CORES_DE_ETIQUETA: { valor: BadgeColor; nome: string }[] = [
  { valor: 'vermelho', nome: 'Vermelho' },
  { valor: 'preto', nome: 'Preto' },
  { valor: 'verde', nome: 'Verde' },
  { valor: 'azul', nome: 'Azul' },
  { valor: 'dourado', nome: 'Dourado' },
]

export function EtiquetaDoProduto({
  texto,
  cor = 'vermelho',
  className,
}: {
  texto: string
  cor?: BadgeColor
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm',
        CORES[cor] ?? CORES.vermelho,
        className,
      )}
    >
      {texto}
    </span>
  )
}
