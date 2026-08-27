import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navigation } from '../../config/navigation'
import { siteConfig } from '../../config/site'
import { useCart } from '../../hooks/useCart'
import { useCategories } from '../../hooks/useCatalog'
import { cn } from '../../lib/cn'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import { Logo } from '../brand/Logo'
import { SearchBar } from '../catalog/SearchBar'
import { buttonStyles } from '../ui/buttonStyles'
import {
  IconCart,
  IconChevronDown,
  IconMapPin,
  IconMenu,
  IconPhone,
  IconWhatsApp,
} from '../ui/icons'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const location = useLocation()
  const { totalItems, openCart } = useCart()
  const { data: categories } = useCategories()
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const categoriesRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setCategoriesOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!categoriesOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (!categoriesRef.current?.contains(event.target as Node)) setCategoriesOpen(false)
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setCategoriesOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [categoriesOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-transform after:duration-200 after:content-[""]',
      isActive
        ? 'text-brand-600 after:scale-x-100 after:bg-brand-500'
        : 'text-ink-700 after:scale-x-0 after:bg-brand-500 hover:text-ink-900 hover:after:scale-x-100',
    )

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow duration-300',
          scrolled ? 'shadow-[0_1px_0_rgba(20,22,25,0.08),0_8px_24px_-16px_rgba(20,22,25,0.35)]' : 'border-b border-ink-100',
        )}
      >
        {/* Faixa institucional — só em telas maiores. */}
        <div className="hidden bg-ink-900 text-white lg:block">
          <div className="container-page flex h-9 items-center justify-between text-xs">
            <p className="flex items-center gap-2 text-white/70">
              <IconMapPin className="text-sm" aria-hidden="true" />
              {siteConfig.address.full}
            </p>
            <div className="flex items-center gap-5">
              <a
                href={siteConfig.contact.phoneHref}
                className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
              >
                <IconPhone className="text-sm" aria-hidden="true" />
                {siteConfig.contact.phone}
              </a>
              <a
                href={whatsappLink(generalContactMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
              >
                <IconWhatsApp className="text-sm" aria-hidden="true" />
                {siteConfig.contact.whatsapp}
              </a>
            </div>
          </div>
        </div>

        <div className="container-page">
          <div className="flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
            <Link
              to="/"
              className="shrink-0 rounded-lg py-1"
              aria-label={`${siteConfig.name} — página inicial`}
            >
              <Logo size="md" />
            </Link>

            <div className="hidden flex-1 lg:block">
              <SearchBar withSuggestions className="mx-auto max-w-xl" />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <div className="hidden xl:block">
                <a
                  href={whatsappLink(generalContactMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles('whatsapp', 'sm')}
                >
                  <IconWhatsApp className="text-base" aria-hidden="true" />
                  Fale conosco
                </a>
              </div>

              <button
                type="button"
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                aria-label={`Abrir carrinho${totalItems > 0 ? ` (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})` : ''}`}
              >
                <IconCart className="text-xl" />
                {totalItems > 0 ? (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-bold text-white">
                    {totalItems}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
              >
                <IconMenu className="text-xl" />
              </button>
            </div>
          </div>

          {/* Busca no celular. */}
          <div className="pb-3 lg:hidden">
            <SearchBar withSuggestions />
          </div>

          {/* Navegação principal. */}
          <nav aria-label="Navegação principal" className="hidden border-t border-ink-100 lg:block">
            <ul className="flex items-center gap-7">
              {navigation.map((item) =>
                item.label === 'Categorias' ? (
                  <li key={item.to} ref={categoriesRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoriesOpen((open) => !open)}
                      className={cn(
                        'flex items-center gap-1 py-3 text-sm font-semibold transition-colors',
                        location.pathname.startsWith('/categorias')
                          ? 'text-brand-600'
                          : 'text-ink-700 hover:text-ink-900',
                      )}
                      aria-expanded={categoriesOpen}
                      aria-haspopup="true"
                    >
                      Categorias
                      <IconChevronDown
                        className={cn('text-base transition-transform', categoriesOpen && 'rotate-180')}
                      />
                    </button>

                    {categoriesOpen ? (
                      <div className="absolute left-0 top-full z-40 w-[30rem] rounded-2xl border border-ink-100 bg-white p-3 shadow-[var(--shadow-card-hover)]">
                        <ul className="grid grid-cols-2 gap-1">
                          {(categories ?? []).map((category) => (
                            <li key={category.id}>
                              <Link
                                to={`/produtos?categoria=${category.slug}`}
                                className="flex flex-col rounded-xl px-3 py-2 transition-colors hover:bg-ink-50"
                              >
                                <span className="text-sm font-semibold text-ink-900">
                                  {category.name}
                                </span>
                                <span className="text-xs text-ink-500">{category.tagline}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/categorias"
                          className="mt-2 block rounded-xl bg-ink-50 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-ink-700 transition-colors hover:bg-ink-100"
                        >
                          Ver todas as categorias
                        </Link>
                      </div>
                    ) : null}
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.to === '/'} className={navLinkClass}>
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories ?? []} />
    </>
  )
}
