import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Link, Navigate } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Logo } from '../../components/brand/Logo'
import { Button } from '../../components/ui/Button'
import { useAdminSession } from '../../hooks/useAdminSession'
import { cn } from '../../lib/cn'
import { dataSource } from '../../services'

const links = [
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/marcas', label: 'Marcas' },
  { to: '/admin/categorias', label: 'Categorias' },
]

/**
 * Moldura do painel administrativo: exige login (quando há Supabase),
 * mostra a navegação e avisa quando o painel está em modo demonstração.
 */
export default function AdminLayout() {
  const { session, loading, signOut, requiresLogin } = useAdminSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-500" role="status">
        Carregando painel…
      </div>
    )
  }

  if (requiresLogin && !session) {
    return <Navigate to="/admin/entrar" state={{ from: location.pathname }} replace />
  }

  if (session && !session.isAdmin) {
    return (
      <div className="container-page py-20">
        <AdminNotice tone="error">
          A conta <strong>{session.email}</strong> não tem permissão de administrador. Cadastre-a na
          tabela <code>admins</code> do Supabase para liberar o acesso.
        </AdminNotice>
        <Button variant="outline" className="mt-6" onClick={() => void signOut()}>
          Sair
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Seo title="Painel administrativo" noindex />

      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/admin/produtos" className="shrink-0" aria-label="Painel Do Pé Calçado">
            <Logo size="sm" />
          </Link>
          <span className="hidden rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ink-600 sm:inline">
            Painel
          </span>

          <nav aria-label="Seções do painel" className="ml-2 hidden gap-1 sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="hidden text-sm font-semibold text-ink-600 transition-colors hover:text-brand-600 sm:inline"
            >
              Ver site
            </Link>
            {session && !session.demo ? (
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sair
              </Button>
            ) : null}
          </div>
        </div>

        <nav aria-label="Seções do painel" className="container-page flex gap-1 pb-3 sm:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container-page flex-1 py-8">
        {dataSource === 'local' ? (
          <AdminNotice tone="warning" className="mb-6">
            <strong>Modo demonstração.</strong> O Supabase ainda não está configurado, então as
            alterações ficam guardadas só neste navegador — e o envio de fotos fica indisponível.
            Siga o passo a passo de <code>supabase/README.md</code> para ligar o banco de verdade.
          </AdminNotice>
        ) : null}

        <Outlet />
      </main>
    </div>
  )
}
