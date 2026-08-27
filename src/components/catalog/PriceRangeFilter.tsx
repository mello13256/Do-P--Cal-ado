import { useEffect, useState } from 'react'
import { formatPrice } from '../../lib/format'
import type { PriceRange } from '../../types/catalog'

interface PriceRangeFilterProps {
  /** Faixa total disponível no catálogo. */
  bounds: PriceRange
  /** Valores selecionados no momento (podem estar vazios). */
  min?: number
  max?: number
  onChange: (min?: number, max?: number) => void
}

/**
 * Filtro de faixa de preço com dois controles deslizantes sobrepostos.
 * O valor só é aplicado ao soltar o controle, para não recarregar a lista a
 * cada pixel arrastado.
 */
export function PriceRangeFilter({ bounds, min, max, onChange }: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(min ?? bounds.min)
  const [localMax, setLocalMax] = useState(max ?? bounds.max)

  useEffect(() => {
    setLocalMin(min ?? bounds.min)
    setLocalMax(max ?? bounds.max)
  }, [min, max, bounds.min, bounds.max])

  const span = Math.max(1, bounds.max - bounds.min)
  const leftPercent = ((localMin - bounds.min) / span) * 100
  const rightPercent = ((localMax - bounds.min) / span) * 100

  function commit(nextMin: number, nextMax: number) {
    onChange(
      nextMin > bounds.min ? nextMin : undefined,
      nextMax < bounds.max ? nextMax : undefined,
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-ink-700">
        <span>{formatPrice(localMin)}</span>
        <span className="text-ink-400">até</span>
        <span>{formatPrice(localMax)}</span>
      </div>

      <div className="relative mt-4 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-100" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={10}
          value={localMin}
          aria-label="Preço mínimo"
          onChange={(event) => setLocalMin(Math.min(Number(event.target.value), localMax - 10))}
          onPointerUp={() => commit(localMin, localMax)}
          onKeyUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          className="range-thumb absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={10}
          value={localMax}
          aria-label="Preço máximo"
          onChange={(event) => setLocalMax(Math.max(Number(event.target.value), localMin + 10))}
          onPointerUp={() => commit(localMin, localMax)}
          onKeyUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          className="range-thumb absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">Preço mínimo em reais</span>
          <input
            type="number"
            inputMode="numeric"
            value={localMin}
            min={bounds.min}
            max={localMax}
            onChange={(event) => setLocalMin(Number(event.target.value))}
            onBlur={() => commit(Math.min(localMin, localMax), localMax)}
            className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <span className="text-xs text-ink-400">até</span>
        <label className="flex-1">
          <span className="sr-only">Preço máximo em reais</span>
          <input
            type="number"
            inputMode="numeric"
            value={localMax}
            min={localMin}
            max={bounds.max}
            onChange={(event) => setLocalMax(Number(event.target.value))}
            onBlur={() => commit(localMin, Math.max(localMin, localMax))}
            className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
      </div>
    </div>
  )
}
