import { Button } from '../ui/Button'
import { IconSearch } from '../ui/icons'

interface EmptyStateProps {
  title?: string
  description?: string
  onClear?: () => void
}

export function EmptyState({
  title = 'Nenhum produto encontrado',
  description = 'Tente ajustar os filtros ou buscar por outro termo. Se procura algo específico, fale com a gente pelo WhatsApp — talvez tenhamos na loja.',
  onClear,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-300 shadow-sm">
        <IconSearch className="text-2xl" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">{description}</p>
      {onClear ? (
        <Button variant="outline" className="mt-5" onClick={onClear}>
          Limpar filtros
        </Button>
      ) : null}
    </div>
  )
}
