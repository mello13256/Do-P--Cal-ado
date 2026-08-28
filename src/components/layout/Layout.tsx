import { Outlet } from 'react-router-dom'
import { IntroAnimation } from '../brand/IntroAnimation'
import { CartDrawer } from '../cart/CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollToTop } from './ScrollToTop'
import { WhatsAppFloat } from './WhatsAppFloat'

/** Estrutura comum a todas as páginas. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <IntroAnimation />

      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <ScrollToTop />
      <Header />

      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  )
}
