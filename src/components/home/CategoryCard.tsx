import { Link } from 'react-router-dom'
import type { Category } from '../../types/catalog'
import { MediaPlaceholder } from '../brand/MediaPlaceholder'
import { IconArrowRight } from '../ui/icons'

interface CategoryCardProps {
  category: Category
  /** Total de produtos na categoria, quando disponível. */
  count?: number
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="aspect-4/3 overflow-hidden bg-ink-50">
        {category.image ? (
          <img
            src={category.image}
            alt={`Categoria ${category.name}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <MediaPlaceholder label={category.name} tone="cream" />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink-900">
            <Link to={`/produtos?categoria=${category.slug}`} className="after:absolute after:inset-0">
              {category.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-500">{category.tagline}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-600">
          {typeof count === 'number' ? `${count}` : null}
          <IconArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
