import { cn } from '../../lib/cn'

interface SizePickerProps {
  sizes: number[]
  value?: number
  onChange: (size: number) => void
  /** Mostra o aviso de "escolha a numeração". */
  error?: boolean
  disabled?: boolean
}

export function SizePicker({ sizes, value, onChange, error = false, disabled = false }: SizePickerProps) {
  if (sizes.length === 0) return null

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-bold text-ink-900">Numeração</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            aria-pressed={value === size}
            className={cn(
              'h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold transition-all duration-200',
              value === size
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {size}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-brand-600">
          Escolha uma numeração para continuar.
        </p>
      ) : null}
    </fieldset>
  )
}
