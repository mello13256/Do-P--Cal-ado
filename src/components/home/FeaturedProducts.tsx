import { Link } from 'react-router-dom'
import { useFeaturedProducts } from '../../hooks/useCatalog'
import { ProductGrid } from '../catalog/ProductGrid'
import { buttonStyles } from '../ui/buttonStyles'
import { Section, SectionHeader } from '../ui/Section'

export function FeaturedProducts() {
  const { data: products, loading } = useFeaturedProducts(8)

  // Sem produtos (catálogo ainda vazio ou banco fora do ar) a seção não
  // aparece, em vez de mostrar uma vitrine vazia na página inicial.
  if (!loading && (products?.length ?? 0) === 0) return null

  return (
    <Section muted>
      <SectionHeader
        eyebrow="Selecionados para você"
        title="Destaques da loja"
        description="Uma amostra do que costuma sair da prateleira. Passe na loja ou chame no WhatsApp para conferir numerações e cores."
        action={
          <Link to="/produtos" className={buttonStyles('outline', 'md')}>
            Ver catálogo completo
          </Link>
        }
      />
      <ProductGrid products={products ?? []} loading={loading} skeletonCount={8} />
    </Section>
  )
}
