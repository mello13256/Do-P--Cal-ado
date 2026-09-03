import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import {
  abrirFotoParaRecorte,
  gerarFotoRecortada,
  type AreaDeRecorte,
  type FonteDaFoto,
} from '../../lib/imagem'
import { Button } from '../ui/Button'
import { IconClose } from '../ui/icons'

type Modo = 'preencher' | 'inteira'

interface RecorteDeFotoProps {
  arquivo: File
  onCancelar: () => void
  onConfirmar: (arquivo: File) => void
}

const ZOOM_MAXIMO = 4
/** Quanto a seta do teclado desloca a foto, em pixels de tela. */
const PASSO_DO_TECLADO = 16

interface Ponto {
  x: number
  y: number
}

function centroDe(pontos: Ponto[]): Ponto {
  const soma = pontos.reduce((total, ponto) => ({ x: total.x + ponto.x, y: total.y + ponto.y }), {
    x: 0,
    y: 0,
  })
  return { x: soma.x / pontos.length, y: soma.y / pontos.length }
}

function distanciaEntre(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function entre(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo)
}

/**
 * Escolha do enquadramento antes de enviar a foto.
 *
 * A vitrine mostra as fotos num quadro 4 x 5. Sem esta tela o navegador
 * cortava a imagem por conta própria e o resultado só aparecia depois de
 * salvo — às vezes com o calçado pela metade. Aqui o quadro branco é
 * exatamente o que o cliente vai ver: arrasta-se a foto, aproxima-se com o
 * controle (ou com dois dedos) e o arquivo já sobe recortado.
 */
export function RecorteDeFoto({ arquivo, onCancelar, onConfirmar }: RecorteDeFotoProps) {
  const tituloId = useId()
  const molduraRef = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)

  const [fonte, setFonte] = useState<FonteDaFoto | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [modo, setModo] = useState<Modo>('preencher')
  const [zoom, setZoom] = useState(1)
  const [deslocamento, setDeslocamento] = useState<Ponto>({ x: 0, y: 0 })
  const [moldura, setMoldura] = useState({ largura: 0, altura: 0 })
  const [gerando, setGerando] = useState(false)

  useLockBodyScroll(true)

  // Abre a foto escolhida (girando conforme a câmera gravou) e libera o
  // endereço temporário quando a tela fecha.
  useEffect(() => {
    let ativo = true
    let aberta: FonteDaFoto | null = null

    setFonte(null)
    setErro(null)
    setModo('preencher')
    setZoom(1)
    setDeslocamento({ x: 0, y: 0 })

    void (async () => {
      try {
        const pronta = await abrirFotoParaRecorte(arquivo)
        aberta = pronta
        if (!ativo) {
          URL.revokeObjectURL(pronta.url)
          return
        }
        setFonte(pronta)
      } catch (caught) {
        if (ativo) setErro(caught instanceof Error ? caught.message : 'Não foi possível abrir esta foto.')
      }
    })()

    return () => {
      ativo = false
      if (aberta) URL.revokeObjectURL(aberta.url)
    }
  }, [arquivo])

  // Fecha com Esc e devolve o foco a quem abriu.
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    painelRef.current?.focus()

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        onCancelar()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      anterior?.focus?.()
    }
  }, [onCancelar])

  // A moldura acompanha a largura da tela; as contas precisam do tamanho real.
  useEffect(() => {
    const elemento = molduraRef.current
    if (!elemento) return
    const medir = () =>
      setMoldura({ largura: elemento.clientWidth, altura: elemento.clientHeight })
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [fonte])

  const pronto = Boolean(fonte && moldura.largura > 0)
  // Menor aproximação que ainda cobre a moldura inteira.
  const escalaBase =
    fonte && pronto
      ? Math.max(moldura.largura / fonte.largura, moldura.altura / fonte.altura)
      : 1
  const escala = escalaBase * zoom
  const exibida = {
    largura: fonte ? fonte.largura * escala : 0,
    altura: fonte ? fonte.altura * escala : 0,
  }

  function limitesPara(nivel: number): Ponto {
    if (!fonte) return { x: 0, y: 0 }
    const escalaNoNivel = escalaBase * nivel
    return {
      x: Math.max(0, (fonte.largura * escalaNoNivel - moldura.largura) / 2),
      y: Math.max(0, (fonte.altura * escalaNoNivel - moldura.altura) / 2),
    }
  }

  const limites = limitesPara(zoom)
  const posicao = {
    x: entre(deslocamento.x, -limites.x, limites.x),
    y: entre(deslocamento.y, -limites.y, limites.y),
  }

  /** Pedaço da foto que está dentro da moldura, em pixels da imagem. */
  const area: AreaDeRecorte | null = (() => {
    if (!fonte || !pronto || modo === 'inteira') return null
    const esquerda = (moldura.largura - exibida.largura) / 2 + posicao.x
    const topo = (moldura.altura - exibida.altura) / 2 + posicao.y
    const largura = Math.min(fonte.largura, moldura.largura / escala)
    const altura = Math.min(fonte.altura, moldura.altura / escala)
    return {
      x: entre(-esquerda / escala, 0, fonte.largura - largura),
      y: entre(-topo / escala, 0, fonte.altura - altura),
      largura,
      altura,
    }
  })()

  function mudarZoom(novoZoom: number, ancora?: Ponto) {
    const alvo = entre(novoZoom, 1, ZOOM_MAXIMO)
    const proporcao = alvo / zoom
    const limite = limitesPara(alvo)
    const base = ancora ?? deslocamento
    setZoom(alvo)
    setDeslocamento({
      x: entre(base.x * proporcao, -limite.x, limite.x),
      y: entre(base.y * proporcao, -limite.y, limite.y),
    })
  }

  // Arrastar com o dedo/mouse; com dois dedos, aproximar.
  const ponteiros = useRef(new Map<number, Ponto>())
  const gesto = useRef<{ centro: Ponto; distancia: number; zoom: number; deslocamento: Ponto } | null>(
    null,
  )

  function reiniciarGesto() {
    const pontos = [...ponteiros.current.values()]
    if (pontos.length === 0) {
      gesto.current = null
      return
    }
    gesto.current = {
      centro: centroDe(pontos),
      distancia: pontos.length > 1 ? distanciaEntre(pontos[0], pontos[1]) : 0,
      zoom,
      deslocamento: posicao,
    }
  }

  function aoPressionar(evento: React.PointerEvent<HTMLDivElement>) {
    if (modo !== 'preencher' || !pronto) return
    evento.currentTarget.setPointerCapture(evento.pointerId)
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY })
    reiniciarGesto()
  }

  function aoMover(evento: React.PointerEvent<HTMLDivElement>) {
    const inicio = gesto.current
    if (!inicio || !ponteiros.current.has(evento.pointerId)) return
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY })

    const pontos = [...ponteiros.current.values()]
    const centro = centroDe(pontos)

    let novoZoom = inicio.zoom
    if (pontos.length > 1 && inicio.distancia > 0) {
      novoZoom = entre(
        (inicio.zoom * distanciaEntre(pontos[0], pontos[1])) / inicio.distancia,
        1,
        ZOOM_MAXIMO,
      )
      setZoom(novoZoom)
    }

    const proporcao = novoZoom / inicio.zoom
    const limite = limitesPara(novoZoom)
    setDeslocamento({
      x: entre(inicio.deslocamento.x * proporcao + (centro.x - inicio.centro.x), -limite.x, limite.x),
      y: entre(inicio.deslocamento.y * proporcao + (centro.y - inicio.centro.y), -limite.y, limite.y),
    })
  }

  function aoSoltar(evento: React.PointerEvent<HTMLDivElement>) {
    ponteiros.current.delete(evento.pointerId)
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
    reiniciarGesto()
  }

  function aoTeclarNaMoldura(evento: React.KeyboardEvent<HTMLDivElement>) {
    if (modo !== 'preencher') return
    const passos: Record<string, Ponto> = {
      ArrowLeft: { x: -PASSO_DO_TECLADO, y: 0 },
      ArrowRight: { x: PASSO_DO_TECLADO, y: 0 },
      ArrowUp: { x: 0, y: -PASSO_DO_TECLADO },
      ArrowDown: { x: 0, y: PASSO_DO_TECLADO },
    }
    const passo = passos[evento.key]
    if (passo) {
      evento.preventDefault()
      setDeslocamento({
        x: entre(posicao.x + passo.x, -limites.x, limites.x),
        y: entre(posicao.y + passo.y, -limites.y, limites.y),
      })
      return
    }
    if (evento.key === '+' || evento.key === '=') {
      evento.preventDefault()
      mudarZoom(zoom + 0.2, posicao)
    } else if (evento.key === '-') {
      evento.preventDefault()
      mudarZoom(zoom - 0.2, posicao)
    }
  }

  async function confirmar() {
    if (!fonte) return
    setGerando(true)
    setErro(null)
    try {
      onConfirmar(await gerarFotoRecortada(fonte, area, arquivo.name))
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : 'Não foi possível recortar a foto.')
      setGerando(false)
    }
  }

  const estiloDaImagem = (() => {
    if (!fonte || !pronto) return undefined
    if (modo === 'inteira') {
      const encaixe = Math.min(moldura.largura / fonte.largura, moldura.altura / fonte.altura)
      const largura = fonte.largura * encaixe
      const altura = fonte.altura * encaixe
      return {
        width: `${largura}px`,
        height: `${altura}px`,
        left: `${(moldura.largura - largura) / 2}px`,
        top: `${(moldura.altura - altura) / 2}px`,
      }
    }
    return {
      width: `${exibida.largura}px`,
      height: `${exibida.altura}px`,
      left: `${(moldura.largura - exibida.largura) / 2 + posicao.x}px`,
      top: `${(moldura.altura - exibida.altura) / 2 + posicao.y}px`,
    }
  })()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl focus:outline-none sm:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <h2 id={tituloId} className="text-base font-bold">
            Enquadrar a foto
          </h2>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Fechar sem usar a foto"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <IconClose className="text-xl" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {erro ? (
            <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {erro}
            </p>
          ) : null}

          {!fonte && !erro ? (
            <p className="py-16 text-center text-sm text-ink-500" role="status">
              Abrindo a foto…
            </p>
          ) : null}

          {fonte ? (
            <>
              <p className="text-sm text-ink-600">
                O quadro abaixo é exatamente o que o cliente vai ver.{' '}
                {modo === 'preencher'
                  ? 'Arraste a foto para escolher o enquadramento.'
                  : 'Nada é cortado — as sobras ficam brancas.'}
              </p>

              <div
                ref={molduraRef}
                tabIndex={0}
                role="group"
                aria-label="Enquadramento da foto — arraste ou use as setas do teclado"
                onPointerDown={aoPressionar}
                onPointerMove={aoMover}
                onPointerUp={aoSoltar}
                onPointerCancel={aoSoltar}
                onKeyDown={aoTeclarNaMoldura}
                className={cn(
                  'relative mx-auto mt-4 aspect-4/5 w-full max-w-[15rem] touch-none select-none overflow-hidden rounded-xl border border-ink-200 bg-white',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                  modo === 'preencher' && 'cursor-grab active:cursor-grabbing',
                )}
              >
                <img
                  src={fonte.url}
                  alt=""
                  draggable={false}
                  style={estiloDaImagem}
                  className="pointer-events-none absolute max-w-none"
                />
                {/* Linhas de apoio, como as da câmera. */}
                <div
                  aria-hidden="true"
                  className={cn('pointer-events-none absolute inset-0', modo !== 'preencher' && 'hidden')}
                >
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/50" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/50" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/50" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/50" />
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-1 rounded-full bg-ink-100 p-1 text-sm font-semibold">
                {(
                  [
                    { valor: 'preencher', rotulo: 'Preencher quadro' },
                    { valor: 'inteira', rotulo: 'Foto inteira' },
                  ] as const
                ).map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    aria-pressed={modo === opcao.valor}
                    onClick={() => setModo(opcao.valor)}
                    className={cn(
                      'h-9 flex-1 rounded-full px-3 transition-colors',
                      modo === opcao.valor
                        ? 'bg-white text-ink-900 shadow-sm'
                        : 'text-ink-600 hover:text-ink-900',
                    )}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {modo === 'preencher' ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-semibold text-ink-600">Aproximar</span>
                  <input
                    type="range"
                    min={1}
                    max={ZOOM_MAXIMO}
                    step={0.01}
                    value={zoom}
                    aria-label="Aproximar a foto"
                    onChange={(evento) => mudarZoom(Number(evento.target.value))}
                    className="h-2 flex-1 cursor-pointer accent-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1)
                      setDeslocamento({ x: 0, y: 0 })
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                  >
                    Recentralizar
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-xs text-ink-500">
                  A foto aparece inteira, com fundo branco nas sobras. Bom para fotos deitadas,
                  em que preencher o quadro cortaria o calçado.
                </p>
              )}
            </>
          ) : null}
        </div>

        <div className="border-t border-ink-100 px-5 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancelar} className="sm:w-auto">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void confirmar()}
              disabled={!fonte || gerando}
              className="sm:w-auto"
            >
              {gerando ? 'Preparando…' : 'Usar esta foto'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
