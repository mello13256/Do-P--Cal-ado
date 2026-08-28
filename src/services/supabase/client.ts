import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Projeto Supabase da loja.
 *
 * A chave `anon` fica aqui de propósito: ela é pública por natureza — vai para
 * o navegador de todo visitante junto com o site. Quem protege os dados são as
 * políticas de Row Level Security criadas em `supabase/migrations`: qualquer
 * um lê o catálogo, só quem está na tabela `admins` grava.
 *
 * Para apontar para outro projeto (ou trocar a chave), defina
 * VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY — elas têm preferência sobre os
 * valores abaixo.
 *
 * A chave `service_role` NUNCA deve aparecer neste arquivo nem em nenhum outro
 * do site.
 */
const PROJETO_DA_LOJA = {
  url: 'https://yrsejdjoodsfqcgkxfsb.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2VqZGpvb2RzZnFjZ2t4ZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTI5ODgsImV4cCI6MjEwMzQyODk4OH0.jB7PA3Hm9ZrpQn8cop2tOVEFohjrKgxBrlpL5HvCIeQ',
}

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || PROJETO_DA_LOJA.url
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || PROJETO_DA_LOJA.anonKey

/**
 * `VITE_CATALOGO=local` desliga o banco e faz o site usar o catálogo de
 * `src/data`, com o painel em modo demonstração. Serve para desenvolver sem
 * depender da internet ou do Supabase:
 *
 *   VITE_CATALOGO=local npm run dev
 */
const forcarLocal = import.meta.env.VITE_CATALOGO === 'local'

/** `true` quando há projeto configurado (por variável de ambiente ou acima). */
export const isSupabaseConfigured = !forcarLocal && Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
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
