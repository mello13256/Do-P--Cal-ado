import { Link } from 'react-router-dom'
import { siteConfig } from '../../config/site'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import { SinceBadge } from '../brand/SinceBadge'
import { buttonStyles } from '../ui/buttonStyles'
import { IconArrowRight, IconMapPin, IconWhatsApp } from '../ui/icons'

/** Destaque da página inicial: quem é a loja, desde quando e o que oferece. */
export function Hero() {
  const years = new Date().getFullYear() - siteConfig.foundedYear

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="footprint-trail absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-50/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              {siteConfig.tagline}
            </p>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] text-ink-900 sm:text-5xl lg:text-6xl">
              Do <span className="text-brand-500">Pé</span> Calçado
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              {siteConfig.subtitle}
            </p>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-500">
              São {years} anos atendendo Contenda e região, com as marcas que a gente conhece de
              perto e o atendimento de sempre.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/produtos" className={buttonStyles('primary', 'lg')}>
                Ver produtos
                <IconArrowRight className="text-lg" aria-hidden="true" />
              </Link>
              <a
                href={whatsappLink(generalContactMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles('outline', 'lg')}
              >
                <IconWhatsApp className="text-lg text-[#1faa54]" aria-hidden="true" />
                Fale conosco
              </a>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-ink-500">
              <IconMapPin className="text-base text-brand-500" aria-hidden="true" />
              {siteConfig.address.full}
            </p>
          </div>

          {/* Painel inspirado na placa vermelha da fachada. */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="rounded-3xl border border-ink-200/70 bg-white p-3 shadow-[var(--shadow-card)]">
              <div className="relative overflow-hidden rounded-2xl bg-brand-500 px-8 py-14 text-center text-white">
                <div className="footprint-trail absolute inset-0 opacity-20" aria-hidden="true" />
                <p className="relative font-serif text-3xl font-semibold sm:text-4xl">
                  Do <span className="text-ink-900">Pé</span> Calçado
                </p>
                <p className="relative mt-3 text-sm font-medium uppercase tracking-[0.24em] text-white/80">
                  Calçados e artigos esportivos
                </p>
                <div className="relative mt-8 flex items-center justify-center">
                  <SinceBadge className="h-24 w-24 drop-shadow-md" />
                </div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Anos de loja', value: `${years}` },
                { label: 'Marcas', value: '9' },
                { label: 'Categorias', value: '9' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-ink-100 bg-white px-2 py-4">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-ink-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
