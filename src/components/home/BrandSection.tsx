import { Link } from 'react-router-dom'
import { useBrands } from '../../hooks/useCatalog'
import { BrandLogo } from '../brand/BrandLogo'
import { Section, SectionHeader } from '../ui/Section'
import { Skeleton } from '../ui/Skeleton'

interface BrandSectionProps {
  /** `h1` quando a seção é o conteúdo principal da página /marcas. */
  headingLevel?: 'h1' | 'h2'
  muted?: boolean
}

/** Marcas trabalhadas pela loja — cada logo leva ao catálogo já filtrado. */
export function BrandSection({ headingLevel = 'h2', muted = false }: BrandSectionProps) {
  const { data: brands, loading } = useBrands(true)

  return (
    <Section muted={muted}>
      <SectionHeader
        as={headingLevel}
        eyebrow="Quem trabalha com a gente"
        title="Marcas"
        description="Trabalhamos com marcas conhecidas de calçados e artigos esportivos. Clique em uma delas para ver os produtos disponíveis."
        align="center"
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(brands ?? []).map((brand) => (
            <li key={brand.id}>
              <Link
                to={`/produtos?marca=${brand.slug}`}
                className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border border-ink-100 bg-white px-4 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-[var(--shadow-card)]"
                aria-label={`Ver produtos da marca ${brand.name}`}
              >
                <BrandLogo brand={brand} />
                {brand.description ? (
                  <span className="line-clamp-1 text-[0.7rem] text-ink-500">{brand.description}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
