import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { IconClose } from './icons'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Lado de onde o painel entra. */
  side?: 'right' | 'left'
  footer?: ReactNode
  labelledById?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Painel lateral acessível usado pelo carrinho, pelo menu do celular e pelos
 * filtros do catálogo: fecha com Esc ou clique no fundo, prende o foco
 * enquanto está aberto e devolve o foco ao elemento anterior ao fechar.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  footer,
  labelledById,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE)
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const headingId = labelledById ?? 'drawer-title'

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={cn(
          'relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl',
          side === 'right' ? 'ml-auto animate-[slide-in-right_.28s_ease]' : 'mr-auto',
        )}
        style={{
          animation: `${side === 'right' ? 'drawer-in-right' : 'drawer-in-left'} .28s cubic-bezier(0.22,1,0.36,1)`,
        }}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 id={headingId} className="text-base font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            aria-label="Fechar"
          >
            <IconClose className="text-xl" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>

        {footer ? <div className="border-t border-ink-100 px-5 py-4">{footer}</div> : null}
      </div>

      <style>{`
        @keyframes drawer-in-right { from { transform: translateX(100%); } to { transform: none; } }
        @keyframes drawer-in-left { from { transform: translateX(-100%); } to { transform: none; } }
      `}</style>
    </div>
  )
}
