import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { catalogService } from '../../services'
import { formatPrice } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { ProductView } from '../../types/catalog'
import { IconClose, IconSearch } from '../ui/icons'

interface SearchBarProps {
  /** Valor inicial (usado no catálogo, que mantém o termo na URL). */
  defaultValue?: string
  /** Quando informado, o catálogo filtra ao vivo em vez de navegar. */
  onSearch?: (term: string) => void
  placeholder?: string
  className?: string
  /** Sugestões de produtos enquanto digita (usado no cabeçalho). */
  withSuggestions?: boolean
  autoFocus?: boolean
}

/**
 * Busca por nome, marca ou categoria.
 * No cabeçalho mostra sugestões; dentro do catálogo filtra a lista ao vivo.
 */
export function SearchBar({
  defaultValue = '',
  onSearch,
  placeholder = 'Buscar por produto, marca ou categoria',
  className,
  withSuggestions = false,
  autoFocus = false,
}: SearchBarProps) {
  const navigate = useNavigate()
  const listId = useId()
  const [term, setTerm] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<ProductView[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedTerm = useDebouncedValue(term, 250)

  useEffect(() => {
    setTerm(defaultValue)
  }, [defaultValue])

  // Filtro ao vivo no catálogo.
  useEffect(() => {
    if (!onSearch) return
    onSearch(debouncedTerm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm])

  // Sugestões no cabeçalho.
  useEffect(() => {
    if (!withSuggestions) return
    let active = true
    const trimmed = debouncedTerm.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    catalogService.listProducts({ search: trimmed, perPage: 5, sort: 'relevancia' }).then((result) => {
      if (!active) return
      setSuggestions(result.items)
      setActiveIndex(-1)
    })
    return () => {
      active = false
    }
  }, [debouncedTerm, withSuggestions])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showList = withSuggestions && open && suggestions.length > 0

  function goToCatalog(value: string) {
    setOpen(false)
    const search = value.trim()
    navigate(search ? `/produtos?q=${encodeURIComponent(search)}` : '/produtos')
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (showList && activeIndex >= 0) {
      const product = suggestions[activeIndex]
      setOpen(false)
      navigate(`/produtos/${product.slug}`)
      return
    }
    if (!onSearch) goToCatalog(term)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const activeId = useMemo(
    () => (activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined),
    [activeIndex, listId],
  )

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Buscar produtos
        </label>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-400" />
          <input
            id={`${listId}-input`}
            type="search"
            value={term}
            autoFocus={autoFocus}
            onChange={(event) => {
              setTerm(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            role={withSuggestions ? 'combobox' : undefined}
            aria-expanded={withSuggestions ? showList : undefined}
            aria-controls={withSuggestions ? listId : undefined}
            aria-activedescendant={activeId}
            className="h-11 w-full rounded-full border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-900 shadow-sm transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {term ? (
            <button
              type="button"
              onClick={() => {
                setTerm('')
                if (onSearch) onSearch('')
                setSuggestions([])
              }}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              aria-label="Limpar busca"
            >
              <IconClose />
            </button>
          ) : null}
        </div>
      </form>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugestões de produtos"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-ink-100 bg-white py-1 shadow-[var(--shadow-card-hover)]"
        >
          {suggestions.map((product, index) => (
            <li key={product.id} id={`${listId}-option-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  setOpen(false)
                  navigate(`/produtos/${product.slug}`)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors',
                  index === activeIndex ? 'bg-ink-50' : 'hover:bg-ink-50',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {product.name}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {product.brand.name} · {product.category.name}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-brand-600">
                  {formatPrice(product.price)}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => goToCatalog(term)}
              className="w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-600 transition-colors hover:bg-brand-50"
            >
              Ver todos os resultados para “{term.trim()}”
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
