import { Seo } from '../components/Seo'
import { AboutSection } from '../components/home/AboutSection'
import { TrustStrip } from '../components/home/TrustStrip'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'

export default function AboutPage() {
  return (
    <>
      <Seo
        title="Sobre nós"
        description="A Do Pé Calçados iniciou suas atividades em fevereiro de 1989 em Contenda, Paraná. Conheça a história da loja."
        path="/sobre"
      />

      <div className="container-page">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Sobre nós' }]} />
      </div>

      <AboutSection variant="full" headingLevel="h1" />
      <TrustStrip />
    </>
  )
}
