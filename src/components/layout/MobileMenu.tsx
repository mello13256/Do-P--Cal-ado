import { Link } from 'react-router-dom'
import { navigation } from '../../config/navigation'
import { siteConfig } from '../../config/site'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import type { Category } from '../../types/catalog'
import { buttonStyles } from '../ui/buttonStyles'
import { Drawer } from '../ui/Drawer'
import { IconChevronRight, IconMail, IconPhone, IconWhatsApp } from '../ui/icons'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

/** Menu do celular: navegação, categorias e contatos em um painel lateral. */
export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left" labelledById="mobile-menu-title">
      <nav aria-label="Navegação do celular">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-ink-800 transition-colors hover:bg-ink-50"
              >
                {item.label}
                <IconChevronRight className="text-lg text-ink-400" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <h3 className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
          Categorias
        </h3>
        <ul className="mt-2 grid grid-cols-2 gap-1">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/produtos?categoria=${category.slug}`}
                onClick={onClose}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-2 rounded-2xl bg-cream p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Atendimento</h3>
        <a
          href={siteConfig.contact.phoneHref}
          className="flex items-center gap-3 py-1.5 text-sm font-medium text-ink-800"
        >
          <IconPhone className="text-base text-brand-600" aria-hidden="true" />
          {siteConfig.contact.phone}
        </a>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="flex items-center gap-3 py-1.5 text-sm font-medium break-all text-ink-800"
        >
          <IconMail className="text-base text-brand-600" aria-hidden="true" />
          {siteConfig.contact.email}
        </a>
        <a
          href={whatsappLink(generalContactMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles('whatsapp', 'md', 'mt-2 w-full')}
        >
          <IconWhatsApp className="text-lg" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      </div>
    </Drawer>
  )
}
