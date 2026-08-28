import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

/**
 * Abertura do site: a pegada da loja se formando na tela.
 *
 * A ordem imita uma pegada acontecendo agora — a sola encosta primeiro e os
 * dedos vêm em seguida, do dedão ao menor. Dura cerca de 3 segundos e some
 * sozinha; um toque, um clique ou qualquer tecla pula na hora.
 *
 * Não aparece para quem pediu menos animação no sistema (`prefers-reduced-motion`)
 * nem no painel administrativo, onde só atrapalharia o trabalho.
 */

/** Sola e dedos, na mesma geometria do logotipo (ver `FootprintMark`). */
const PARTES = [
  { cx: 53, cy: 63, rx: 19, ry: 25, rotacao: -10, atraso: 0.15, duracao: 0.55, dedo: false },
  { cx: 32, cy: 34, rx: 7.6, ry: 9, rotacao: -25, atraso: 0.85, duracao: 0.34, dedo: true },
  { cx: 47, cy: 26, rx: 6, ry: 7.4, rotacao: -12, atraso: 1.05, duracao: 0.34, dedo: true },
  { cx: 60, cy: 24, rx: 5.4, ry: 6.8, rotacao: -4, atraso: 1.25, duracao: 0.34, dedo: true },
  { cx: 71, cy: 27, rx: 4.7, ry: 6, rotacao: 8, atraso: 1.45, duracao: 0.34, dedo: true },
  { cx: 80, cy: 34, rx: 4, ry: 5, rotacao: 18, atraso: 1.65, duracao: 0.34, dedo: true },
]

const DURACAO_SAIDA = 420

/**
 * `completa` = a pegada se formando.
 * `simples`  = a marca aparece pronta, sem movimento, para quem pediu menos
 *              animação no sistema (o próprio navegador anula as animações).
 * `nenhuma`  = painel administrativo.
 *
 * Dá para forçar pela URL, útil para conferir: `?intro=1` sempre mostra,
 * `?intro=0` sempre pula.
 */
type Modo = 'completa' | 'simples' | 'nenhuma'

function definirModo(): Modo {
  if (typeof window === 'undefined') return 'nenhuma'

  const forcado = new URLSearchParams(window.location.search).get('intro')
  if (forcado === '0') return 'nenhuma'
  if (forcado === '1') return 'completa'

  if (window.location.pathname.includes('/admin')) return 'nenhuma'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'simples'
  return 'completa'
}

export function IntroAnimation() {
  const [modo] = useState<Modo>(definirModo)
  const [montado, setMontado] = useState(() => modo !== 'nenhuma')
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    if (!montado) return

    let fim: number

    function encerrar(atraso: number) {
      setSaindo(true)
      fim = window.setTimeout(() => setMontado(false), atraso)
    }

    const duracaoTotal = modo === 'simples' ? 1500 : 2900
    const automatico = window.setTimeout(() => encerrar(DURACAO_SAIDA), duracaoTotal)
    const pular = () => {
      window.clearTimeout(automatico)
      encerrar(220)
    }

    window.addEventListener('pointerdown', pular)
    window.addEventListener('keydown', pular)
    window.addEventListener('wheel', pular, { passive: true })
    window.addEventListener('touchstart', pular, { passive: true })

    // Enquanto a abertura está na tela, o fundo não rola.
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(automatico)
      window.clearTimeout(fim)
      window.removeEventListener('pointerdown', pular)
      window.removeEventListener('keydown', pular)
      window.removeEventListener('wheel', pular)
      window.removeEventListener('touchstart', pular)
      document.body.style.overflow = overflowAnterior
    }
  }, [montado, modo])

  if (!montado) return null

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        saindo ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
    >
      {/* Detalhes vermelhos discretos: um brilho ao fundo e a onda do pisão. */}
      <div
        className="pointer-events-none absolute h-[26rem] w-[26rem] rounded-full bg-brand-50/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        <span
          className="intro-parte intro-onda absolute h-24 w-24 rounded-full border-2 border-brand-300"
          style={{ animationDuration: '0.9s', animationDelay: '0.35s' }}
        />

        <svg viewBox="0 0 100 100" className="relative h-full w-full" role="presentation">
          {PARTES.map((parte) => (
            <ellipse
              key={`${parte.cx}-${parte.cy}`}
              cx={parte.cx}
              cy={parte.cy}
              rx={parte.rx}
              ry={parte.ry}
              transform={`rotate(${parte.rotacao} ${parte.cx} ${parte.cy})`}
              fill="var(--color-brand-500)"
              className={cn('intro-parte', parte.dedo ? 'intro-dedo' : 'intro-sola')}
              style={{
                animationDuration: `${parte.duracao}s`,
                animationDelay: `${parte.atraso}s`,
              }}
            />
          ))}
        </svg>
      </div>

      <p
        className="intro-parte intro-entrada mt-2 font-serif text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl"
        style={{ animationDuration: '0.5s', animationDelay: '2s' }}
      >
        Do <span className="text-brand-500">Pé</span> Calçados
      </p>

      <span
        className="intro-parte intro-barra mt-3 h-px w-24 origin-left bg-brand-500/60"
        style={{ animationDuration: '0.6s', animationDelay: '2.15s' }}
      />

      <p
        className="intro-parte intro-entrada mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-ink-400"
        style={{ animationDuration: '0.5s', animationDelay: '2.25s' }}
      >
        Desde 1989
      </p>

      <p className="absolute bottom-4 left-4 text-[0.62rem] tracking-wide text-ink-300">
        Miguel Ososki Barbosa
      </p>
    </div>
  )
}
