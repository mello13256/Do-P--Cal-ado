import { Seo } from '../components/Seo'
import { BrandSection } from '../components/home/BrandSection'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'

export default function BrandsPage() {
  return (
    <>
      <Seo
        title="Marcas"
        description="Penalty, Comfortflex, Olympikus, Via Marte, Macboot, Ramarim, Umbro, Dakota e Freeway — as marcas trabalhadas pela Do Pé Calçados."
        path="/marcas"
      />

      <div className="container-page">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Marcas' }]} />
      </div>

      <BrandSection headingLevel="h1" />
    </>
  )
}
