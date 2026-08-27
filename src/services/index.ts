import type { CatalogService } from './catalogService'
import type { CatalogAdminService } from './admin/adminService'
import { localAdminService } from './local/localAdminService'
import { comReserva } from './resilientCatalogService'
import { staticCatalogService } from './staticCatalogService'
import { isSupabaseConfigured } from './supabase/client'
import { supabaseAdminService } from './supabase/supabaseAdminService'
import { supabaseCatalogService } from './supabase/supabaseCatalogService'

/**
 * ORIGEM DOS DADOS DO CATÁLOGO
 *
 * • Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`, o site lê e
 *   grava no banco Postgres do Supabase (ver `supabase/README.md`).
 * • Sem projeto configurado, usa o catálogo local de `src/data` — o site
 *   continua funcionando e o painel roda em modo demonstração, guardando as
 *   alterações no próprio navegador.
 * • Se o banco estiver configurado mas falhar (fora do ar, projeto pausado),
 *   a leitura cai automaticamente no catálogo local em vez de deixar o site
 *   vazio para o cliente (ver `resilientCatalogService`).
 *
 * Para usar outro backend no futuro, escreva uma implementação de
 * `CatalogService` (leitura) e outra de `CatalogAdminService` (escrita) e troque
 * as duas linhas abaixo. Nenhum componente visual precisa mudar.
 */
export const catalogService: CatalogService = isSupabaseConfigured
  ? comReserva(supabaseCatalogService, staticCatalogService)
  : staticCatalogService

export const catalogAdminService: CatalogAdminService = isSupabaseConfigured
  ? supabaseAdminService
  : localAdminService

/** Qual origem está ativa — usada para avisar no painel. */
export const dataSource: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local'

export type { CatalogService } from './catalogService'
export type { CatalogAdminService } from './admin/adminService'
