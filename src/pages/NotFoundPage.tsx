import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Section } from '../components/ui/Section'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Página não encontrada" path="/404" noindex />
      <Section>
        <div className="mx-auto max-w-lg py-10 text-center">
          <p className="font-serif text-6xl font-semibold text-brand-500">404</p>
          <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
          <p className="mt-3 text-ink-600">
            O endereço que você acessou não existe ou foi movido. Volte para o início ou veja o
            catálogo completo.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className={buttonStyles('primary', 'md')}>
              Voltar ao início
            </Link>
            <Link to="/produtos" className={buttonStyles('outline', 'md')}>
              Ver produtos
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
