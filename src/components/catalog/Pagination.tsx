import { cn } from '../../lib/cn'
import { IconChevronLeft, IconChevronRight } from '../ui/icons'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Paginação — mantém o catálogo leve mesmo com centenas de produtos. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  )

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Página anterior"
      >
        <IconChevronLeft />
      </button>

      {pages.map((item, index) => {
        const previous = pages[index - 1]
        const showGap = previous !== undefined && item - previous > 1
        return (
          <span key={item} className="flex items-center gap-1.5">
            {showGap ? <span className="px-1 text-ink-400">…</span> : null}
            <button
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'h-11 min-w-11 rounded-full border px-3 text-sm font-semibold transition-colors',
                item === page
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-ink-200 text-ink-700 hover:bg-ink-50',
              )}
            >
              {item}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Próxima página"
      >
        <IconChevronRight />
      </button>
    </nav>
  )
}
