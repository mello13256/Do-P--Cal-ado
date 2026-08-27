import { siteConfig } from '../config/site'
import { isSupabaseConfigured, supabase } from './supabase/client'

/**
 * O Supabase autentica por e-mail. Para a loja é mais simples entrar como
 * "helio", então completamos o endereço quando não vier um e-mail inteiro.
 */
export function normalizarUsuario(entrada: string): string {
  const valor = entrada.trim().toLowerCase()
  if (!valor || valor.includes('@')) return valor
  return `${valor}@${siteConfig.adminEmailDomain}`
}

export interface AdminSession {
  userId: string
  email: string
  /** `true` quando o usuário está cadastrado em `public.admins`. */
  isAdmin: boolean
  /** `true` no modo demonstração (sem Supabase configurado). */
  demo: boolean
}

const DEMO_SESSION: AdminSession = {
  userId: 'demo',
  email: 'modo demonstração',
  isAdmin: true,
  demo: true,
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return false
  return Boolean(data)
}

/**
 * Acesso ao painel administrativo.
 *
 * Com o Supabase configurado, exige login (e-mail e senha criados em
 * Authentication → Users) e o usuário precisa constar em `public.admins`.
 * Sem Supabase, o painel abre em modo demonstração — as alterações ficam só
 * neste navegador.
 */
export const authService = {
  requiresLogin: isSupabaseConfigured,

  async getSession(): Promise<AdminSession | null> {
    if (!supabase) return DEMO_SESSION
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user) return null
    return {
      userId: user.id,
      email: user.email ?? '',
      isAdmin: await checkIsAdmin(user.id),
      demo: false,
    }
  },

  async signIn(usuario: string, password: string): Promise<AdminSession> {
    if (!supabase) return DEMO_SESSION
    const email = normalizarUsuario(usuario)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(traduzErro(error.message))
    const user = data.user
    if (!user) throw new Error('Não foi possível entrar. Tente novamente.')

    const isAdmin = await checkIsAdmin(user.id)
    if (!isAdmin) {
      await supabase.auth.signOut()
      throw new Error(
        'Esta conta não tem permissão de administrador. Peça para cadastrá-la na tabela "admins".',
      )
    }
    return { userId: user.id, email: user.email ?? '', isAdmin, demo: false }
  },

  async signOut(): Promise<void> {
    await supabase?.auth.signOut()
  },

  /** Avisa quando o login/logout acontece em outra aba. */
  onAuthChange(listener: () => void): () => void {
    if (!supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange(() => listener())
    return () => data.subscription.unsubscribe()
  },
}

function traduzErro(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Usuário ou senha incorretos.'
  if (/email not confirmed/i.test(message)) return 'Confirme o e-mail da conta antes de entrar.'
  if (/failed to fetch|network|load failed/i.test(message)) {
    return 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.'
  }
  return message
}
