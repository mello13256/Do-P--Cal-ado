import { Link } from 'react-router-dom'
import { navigation } from '../../config/navigation'
import { siteConfig } from '../../config/site'
import { useBrands, useCategories } from '../../hooks/useCatalog'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import { Logo } from '../brand/Logo'
import {
  IconFacebook,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWhatsApp,
} from '../ui/icons'

const socialIcons = {
  instagram: IconInstagram,
  facebook: IconFacebook,
} as const

export function Footer() {
  const { data: categories } = useCategories()
  const { data: brands } = useBrands(true)
  const year = new Date().getFullYear()
  const activeSocial = siteConfig.social.filter((item) => item.url)

  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo inverted withTagline size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              {siteConfig.subtitle} Uma loja de Contenda, no Paraná, com {year - siteConfig.foundedYear} anos
              de história.
            </p>

            {activeSocial.length > 0 ? (
              <div className="mt-5 flex gap-2">
                {activeSocial.map((item) => {
                  const Icon = socialIcons[item.id as keyof typeof socialIcons]
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                      aria-label={item.label}
                    >
                      {Icon ? <Icon className="text-lg" /> : item.label.charAt(0)}
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Links rápidos
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-categories">
            <h2
              id="footer-categories"
              className="text-sm font-bold uppercase tracking-[0.16em] text-white"
            >
              Categorias
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(categories ?? []).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/produtos?categoria=${category.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Contato</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <IconMapPin className="mt-0.5 shrink-0 text-base text-brand-400" aria-hidden="true" />
                <span>
                  {siteConfig.address.street} - {siteConfig.address.district}
                  <br />
                  {siteConfig.address.city} - {siteConfig.address.state}
                </span>
              </li>
              <li>
                <a
                  href={siteConfig.contact.phoneHref}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <IconPhone className="shrink-0 text-base text-brand-400" aria-hidden="true" />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(generalContactMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <IconWhatsApp className="shrink-0 text-base text-brand-400" aria-hidden="true" />
                  {siteConfig.contact.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 break-all transition-colors hover:text-white"
                >
                  <IconMail className="shrink-0 text-base text-brand-400" aria-hidden="true" />
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-white">
              Horários
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {siteConfig.hours.map((entry) => (
                <li key={entry.days} className="flex justify-between gap-4">
                  <span>{entry.days}</span>
                  <span className="text-white/50">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Marcas</h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {(brands ?? []).map((brand) => (
              <li key={brand.id}>
                <Link
                  to={`/produtos?marca=${brand.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-white">
            {siteConfig.name} — {siteConfig.tagline}
          </p>
          <p className="text-white/50">
            © {year} {siteConfig.name} · HM Good Calçados Ltda · Contenda/PR
          </p>
        </div>
      </div>
    </footer>
  )
}
