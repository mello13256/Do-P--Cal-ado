import { Seo } from '../components/Seo'
import { CategoryCard } from '../components/home/CategoryCard'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Section, SectionHeader } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import { useCategories, useCategoryCounts } from '../hooks/useCatalog'

export default function CategoriesPage() {
  const { data: categories, loading } = useCategories()
  const { data: counts } = useCategoryCounts()

  return (
    <>
      <Seo
        title="Categorias"
        description="Tênis, chuteiras, sandálias, tamancos, calçados, artigos esportivos, confecções, brinquedos e muito mais na Do Pé Calçado."
        path="/categorias"
      />

      <div className="container-page">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Categorias' }]} />
      </div>

      <Section className="pt-2">
        <SectionHeader
          as="h1"
          eyebrow="Catálogo"
          title="Categorias"
          description="Escolha uma categoria para ver os produtos disponíveis. Se não encontrar o que procura, chame a gente no WhatsApp."
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, index) => (
              <Skeleton key={index} className="aspect-4/3 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {(categories ?? []).map((category) => (
              <CategoryCard key={category.id} category={category} count={counts?.[category.id]} />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
