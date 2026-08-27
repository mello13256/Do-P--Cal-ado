import { cn } from '../../lib/cn'
import { FootprintMark } from './FootprintMark'

interface MediaPlaceholderProps {
  /** Texto discreto exibido no placeholder (ex.: nome da categoria). */
  label?: string
  className?: string
  tone?: 'light' | 'cream' | 'dark'
}

const tones = {
  light: 'bg-ink-50 text-ink-300',
  cream: 'bg-cream text-brand-300',
  dark: 'bg-ink-900 text-white/15',
} as const

/**
 * Espaço reservado para as fotos que ainda não existem.
 *
 * Propositalmente neutro: usa apenas a pegada da identidade da loja, para não
 * dar a impressão de que é a foto de um produto real.
 */
export function MediaPlaceholder({ label, className, tone = 'light' }: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        tones[tone],
        className,
      )}
      aria-hidden="true"
    >
      <div className="footprint-trail absolute inset-0 opacity-60" />
      <FootprintMark className="relative h-16 w-16 opacity-90" />
      {label ? (
        <span
          className={cn(
            'absolute bottom-3 left-0 right-0 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em]',
            tone === 'dark' ? 'text-white/40' : 'text-ink-400',
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
