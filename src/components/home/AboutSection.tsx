import { Link } from 'react-router-dom'
import { siteConfig } from '../../config/site'
import { SinceBadge } from '../brand/SinceBadge'
import { buttonStyles } from '../ui/buttonStyles'
import { Section, SectionHeader } from '../ui/Section'

interface AboutSectionProps {
  /** `full` mostra a história completa (página Sobre nós). */
  variant?: 'teaser' | 'full'
  headingLevel?: 'h1' | 'h2'
}

/** Nossa história — texto do material institucional impresso da loja. */
export function AboutSection({ variant = 'teaser', headingLevel = 'h2' }: AboutSectionProps) {
  const paragraphs =
    variant === 'full'
      ? siteConfig.history.paragraphs
      : siteConfig.history.paragraphs.slice(0, 2)

  return (
    <Section muted={variant === 'teaser'}>
      <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <SectionHeader as={headingLevel} eyebrow="Nossa história" title="Uma loja de Contenda desde 1989" />

          <div className="space-y-4 text-[1.02rem] leading-relaxed text-ink-600">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {variant === 'teaser' ? (
            <Link to="/sobre" className={buttonStyles('outline', 'md', 'mt-7')}>
              Conhecer a loja
            </Link>
          ) : null}
        </div>

        <aside className="flex flex-col items-center gap-6 rounded-3xl border border-ink-100 bg-white p-8 text-center">
          <SinceBadge className="h-20 w-20" />
          <blockquote className="font-serif text-[1.05rem] italic leading-relaxed text-ink-700">
            “{siteConfig.history.verse.text}”
          </blockquote>
          <cite className="text-sm font-semibold not-italic text-brand-600">
            {siteConfig.history.verse.reference}
          </cite>
        </aside>
      </div>
    </Section>
  )
}
