import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Field, TextInput } from '../../components/admin/AdminField'
import { Logo } from '../../components/brand/Logo'
import { Button } from '../../components/ui/Button'
import { useAdminSession } from '../../hooks/useAdminSession'

export default function AdminLoginPage() {
  const { session, loading, signIn, requiresLogin } = useAdminSession()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && (session || !requiresLogin)) {
    return <Navigate to={location.state?.from ?? '/admin/produtos'} replace />
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(location.state?.from ?? '/admin/produtos', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <Seo title="Entrar no painel" noindex />

      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-card)]">
        <Logo size="md" />
        <h1 className="mt-6 text-xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-sm text-ink-500">
          Entre com a conta cadastrada para gerenciar o catálogo da loja.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="E-mail">
            {(id) => (
              <TextInput
                id={id}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            )}
          </Field>

          <Field label="Senha">
            {(id) => (
              <TextInput
                id={id}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            )}
          </Field>

          {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
