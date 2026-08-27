import { siteConfig } from '../../config/site'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import { buttonStyles } from '../ui/buttonStyles'
import { Section, SectionHeader } from '../ui/Section'
import { IconClock, IconMail, IconMapPin, IconPhone, IconWhatsApp } from '../ui/icons'

interface ContactSectionProps {
  headingLevel?: 'h1' | 'h2'
  muted?: boolean
  /** Mostra o mapa da loja. */
  withMap?: boolean
}

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  siteConfig.address.mapsQuery,
)}&output=embed`

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.address.mapsQuery,
)}`

/** Dados de contato, horários, mapa e as três ações principais. */
export function ContactSection({
  headingLevel = 'h2',
  muted = false,
  withMap = true,
}: ContactSectionProps) {
  return (
    <Section id="contato" muted={muted}>
      <SectionHeader
        as={headingLevel}
        eyebrow="Fale com a gente"
        title="Contato"
        description="Estamos no Centro de Contenda. Passe na loja, ligue ou chame no WhatsApp — o atendimento é o mesmo de sempre."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-serif text-xl font-semibold text-ink-900">{siteConfig.name}</h3>

          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconMapPin className="text-lg" aria-hidden="true" />
              </span>
              <span className="text-[0.95rem] leading-relaxed text-ink-700">
                {siteConfig.address.street} - {siteConfig.address.district}
                <br />
                {siteConfig.address.city} - {siteConfig.address.state}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconPhone className="text-lg" aria-hidden="true" />
              </span>
              <a
                href={siteConfig.contact.phoneHref}
                className="self-center text-[0.95rem] font-medium text-ink-800 transition-colors hover:text-brand-600"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconWhatsApp className="text-lg" aria-hidden="true" />
              </span>
              <a
                href={whatsappLink(generalContactMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="self-center text-[0.95rem] font-medium text-ink-800 transition-colors hover:text-brand-600"
              >
                {siteConfig.contact.whatsapp}
              </a>
            </li>
            <li className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconMail className="text-lg" aria-hidden="true" />
              </span>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="self-center break-all text-[0.95rem] font-medium text-ink-800 transition-colors hover:text-brand-600"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconClock className="text-lg" aria-hidden="true" />
              </span>
              <div className="text-[0.95rem] text-ink-700">
                {siteConfig.hours.map((entry) => (
                  <p key={entry.days}>
                    <span className="font-medium text-ink-800">{entry.days}:</span> {entry.time}
                  </p>
                ))}
              </div>
            </li>
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={whatsappLink(generalContactMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles('whatsapp', 'md')}
            >
              <IconWhatsApp className="text-lg" aria-hidden="true" />
              WhatsApp
            </a>
            <a href={siteConfig.contact.phoneHref} className={buttonStyles('secondary', 'md')}>
              <IconPhone className="text-base" aria-hidden="true" />
              Ligar
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className={buttonStyles('outline', 'md')}>
              <IconMail className="text-base" aria-hidden="true" />
              Enviar e-mail
            </a>
          </div>
        </div>

        {withMap ? (
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
            <iframe
              title={`Mapa da localização da ${siteConfig.name}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0 lg:h-full lg:min-h-[26rem]"
            />
            <div className="border-t border-ink-100 bg-white p-4">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Abrir no Google Maps e traçar rota →
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  )
}
