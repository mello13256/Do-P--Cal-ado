import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * `true` quando as variáveis de ambiente do Supabase estão preenchidas.
 * Sem elas, o site funciona com o catálogo local (`src/data`) — útil em
 * desenvolvimento e como rede de segurança se o banco estiver fora do ar.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Cliente do Supabase (ou `null` quando não configurado).
 *
 * A chave `anon` é pública por natureza: quem protege os dados são as
 * políticas de Row Level Security definidas em `supabase/migrations`.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** Uso interno: garante que há cliente antes de consultar o banco. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
    )
  }
  return supabase
}
