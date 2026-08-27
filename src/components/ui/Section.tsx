import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  /** `true` aplica o fundo creme dos materiais impressos da loja. */
  muted?: boolean
  as?: 'section' | 'div'
}

export function Section({ children, className, id, muted = false, as = 'section' }: SectionProps) {
  const Tag = as
  return (
    <Tag
      id={id}
      className={cn('py-14 sm:py-16 lg:py-20', muted && 'bg-cream', className)}
    >
      <div className="container-page">{children}</div>
    </Tag>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: ReactNode
  /** Nível do heading — mantém a hierarquia correta em cada página. */
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:mb-10',
        align === 'center'
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between',
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="text-2xl font-bold sm:text-3xl lg:text-[2rem]">{title}</Heading>
        {description ? (
          <p className="mt-3 text-[0.975rem] leading-relaxed text-ink-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
