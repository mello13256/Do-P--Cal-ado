import { Link } from 'react-router-dom'
import { useCategories, useCategoryCounts } from '../../hooks/useCatalog'
import { buttonStyles } from '../ui/buttonStyles'
import { Section, SectionHeader } from '../ui/Section'
import { Skeleton } from '../ui/Skeleton'
import { CategoryCard } from './CategoryCard'

export function CategorySection() {
  const { data: categories, loading } = useCategories()
  const { data: counts } = useCategoryCounts()

  return (
    <Section>
      <SectionHeader
        eyebrow="O que você procura"
        title="Categorias"
        description="Do tênis do dia a dia à chuteira do fim de semana — e ainda confecções, brinquedos e artigos esportivos."
        action={
          <Link to="/categorias" className={buttonStyles('outline', 'md')}>
            Ver todas
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-4/3 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {(categories ?? []).slice(0, 6).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={counts?.[category.id]}
            />
          ))}
        </div>
      )}
    </Section>
  )
}
