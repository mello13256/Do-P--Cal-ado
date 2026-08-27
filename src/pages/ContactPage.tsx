import { Seo } from '../components/Seo'
import { ContactSection } from '../components/home/ContactSection'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { siteConfig } from '../config/site'

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contato"
        description={`Fale com a ${siteConfig.name}: ${siteConfig.address.full}. Telefone ${siteConfig.contact.phone} e WhatsApp ${siteConfig.contact.whatsapp}.`}
        path="/contato"
      />

      <div className="container-page">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Contato' }]} />
      </div>

      <ContactSection headingLevel="h1" />
    </>
  )
}
