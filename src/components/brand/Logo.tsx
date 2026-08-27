import { siteConfig } from '../../config/site'
import { cn } from '../../lib/cn'
import { FootprintMark } from './FootprintMark'

interface LogoProps {
  /** 'full' = símbolo + nome; 'mark' = apenas o símbolo. */
  variant?: 'full' | 'mark'
  /** Versão para fundos escuros. */
  inverted?: boolean
  /** Mostra "Tradição desde 1989" abaixo do nome. */
  withTagline?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 'h-9 w-9 rounded-[10px]', name: 'text-base', tagline: 'text-[0.6rem]' },
  md: { mark: 'h-11 w-11 rounded-xl', name: 'text-lg sm:text-xl', tagline: 'text-[0.65rem]' },
  lg: { mark: 'h-14 w-14 rounded-2xl', name: 'text-2xl sm:text-3xl', tagline: 'text-xs' },
} as const

/**
 * Logotipo da Do Pé Calçado.
 *
 * Por padrão desenha a versão vetorial construída a partir da identidade
 * impressa da loja (painel vermelho + pegada + nome em serifa). Para usar o
 * arquivo oficial em alta resolução, coloque-o em `public/` e informe o caminho
 * em `siteConfig.logoSrc` — o componente passa a renderizar a imagem.
 */
export function Logo({
  variant = 'full',
  inverted = false,
  withTagline = false,
  className,
  size = 'md',
}: LogoProps) {
  const scale = sizes[size]

  if (siteConfig.logoSrc) {
    return (
      <img
        src={siteConfig.logoSrc}
        alt={`${siteConfig.name} — ${siteConfig.tagline}`}
        className={cn('h-11 w-auto object-contain', className)}
        width={220}
        height={44}
      />
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center bg-brand-500 text-white shadow-sm ring-1 ring-black/5',
          scale.mark,
        )}
        aria-hidden="true"
      >
        <FootprintMark className="h-[62%] w-[62%]" />
      </span>

      {variant === 'full' ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-serif font-semibold tracking-tight',
              scale.name,
              inverted ? 'text-white' : 'text-ink-900',
            )}
          >
            Do <span className="text-brand-500">Pé</span> Calçado
          </span>
          {withTagline ? (
            <span
              className={cn(
                'mt-1 font-sans font-semibold uppercase tracking-[0.22em]',
                scale.tagline,
                inverted ? 'text-white/70' : 'text-ink-500',
              )}
            >
              Desde 1989
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}
